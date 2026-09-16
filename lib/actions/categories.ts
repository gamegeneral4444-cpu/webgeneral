"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { CATEGORY_CONFIG, isCategoryTable, type CategoryTable } from "@/lib/actions/category-config";
import { parseCategoryFormData } from "@/lib/actions/category-payload";
import { authorize, nullifyEmpty, type ActionResult } from "@/lib/actions/helpers";

const uuid = z.string().uuid();

function categoryError(error: { code?: string; message: string }): string {
  return error.code === "23505" ? "slug นี้ถูกใช้งานแล้ว" : error.message;
}

function refreshCategory(table: CategoryTable) {
  revalidatePath("/admin/categories");
  revalidatePath(CATEGORY_CONFIG[table].publicPath);
  revalidatePath("/");
}

export async function createCategory(tableValue: string, formData: FormData): Promise<ActionResult> {
  try {
    if (!isCategoryTable(tableValue)) return { ok: false, error: "ประเภทหมวดหมู่ไม่ถูกต้อง" };
    const { supabase } = await authorize("manageSite");
    const parsed = parseCategoryFormData(formData);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
    const { error } = await supabase.from(tableValue).insert(nullifyEmpty(parsed.data));
    if (error) return { ok: false, error: categoryError(error) };
    refreshCategory(tableValue);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}

export async function updateCategory(tableValue: string, id: string, formData: FormData): Promise<ActionResult> {
  try {
    if (!isCategoryTable(tableValue) || !uuid.safeParse(id).success) return { ok: false, error: "ข้อมูลหมวดหมู่ไม่ถูกต้อง" };
    const { supabase } = await authorize("manageSite");
    const parsed = parseCategoryFormData(formData);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
    const { error } = await supabase.from(tableValue).update(nullifyEmpty(parsed.data)).eq("id", id);
    if (error) return { ok: false, error: categoryError(error) };
    refreshCategory(tableValue);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}

export async function deleteCategory(tableValue: string, id: string): Promise<ActionResult> {
  try {
    if (!isCategoryTable(tableValue) || !uuid.safeParse(id).success) return { ok: false, error: "ข้อมูลหมวดหมู่ไม่ถูกต้อง" };
    const { supabase } = await authorize("manageSite");
    const config = CATEGORY_CONFIG[tableValue];
    const { count } = await supabase.from(config.foreignTable).select("id", { count: "exact", head: true }).eq("category_id", id);
    if ((count ?? 0) > 0) return { ok: false, error: `ยังมีข้อมูลใช้งานหมวดหมู่นี้ ${count} รายการ` };
    const { error } = await supabase.from(tableValue).delete().eq("id", id);
    if (error) return { ok: false, error: categoryError(error) };
    refreshCategory(tableValue);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}
