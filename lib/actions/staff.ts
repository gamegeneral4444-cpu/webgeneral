"use server";

import { revalidatePath } from "next/cache";
import { staffSchema } from "@/lib/validations";
import { authorize, nullifyEmpty, type ActionResult } from "@/lib/actions/helpers";

function parse(formData: FormData) {
  return staffSchema.safeParse({
    full_name: formData.get("full_name"),
    position: formData.get("position"),
    department: formData.get("department") ?? "",
    responsibility: formData.get("responsibility") ?? "",
    phone: formData.get("phone") ?? "",
    email: formData.get("email") ?? "",
    image_url: formData.get("image_url") ?? "",
    image_position_x: formData.get("image_position_x") || 50,
    image_position_y: formData.get("image_position_y") || 50,
    image_zoom: formData.get("image_zoom") || 1,
    sort_order: formData.get("sort_order") || 0,
    is_active: formData.get("is_active") === "true" || formData.get("is_active") === "on",
  });
}

function withoutCropFields<T extends Record<string, unknown>>(data: T) {
  const { image_position_x, image_position_y, image_zoom, ...rest } = data;
  void image_position_x;
  void image_position_y;
  void image_zoom;
  return rest;
}

function isMissingCropColumn(error: { code?: string; message?: string }) {
  return (
    error.code === "PGRST204" ||
    error.code === "42703" ||
    /image_position_x|image_position_y|image_zoom|schema cache/i.test(error.message ?? "")
  );
}

export async function createStaff(formData: FormData): Promise<ActionResult> {
  try {
    const { supabase } = await authorize("manageSite");
    const parsed = parse(formData);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
    const { error } = await supabase.from("staff").insert(nullifyEmpty(parsed.data));
    if (error) {
      if (!isMissingCropColumn(error)) return { ok: false, error: error.message };
      const fallback = await supabase.from("staff").insert(nullifyEmpty(withoutCropFields(parsed.data)));
      if (fallback.error) return { ok: false, error: fallback.error.message };
    }
    revalidatePath("/admin/staff");
    revalidatePath("/staff");
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function updateStaff(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const { supabase } = await authorize("manageSite");
    const parsed = parse(formData);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
    const { error } = await supabase.from("staff").update(nullifyEmpty(parsed.data)).eq("id", id);
    if (error) {
      if (!isMissingCropColumn(error)) return { ok: false, error: error.message };
      const fallback = await supabase.from("staff").update(nullifyEmpty(withoutCropFields(parsed.data))).eq("id", id);
      if (fallback.error) return { ok: false, error: fallback.error.message };
    }
    revalidatePath("/admin/staff");
    revalidatePath("/staff");
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function deleteStaff(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await authorize("manageSite");
    const { error } = await supabase.from("staff").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/staff");
    revalidatePath("/staff");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
