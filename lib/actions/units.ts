"use server";

import { revalidatePath } from "next/cache";
import { authorize, type ActionResult } from "@/lib/actions/helpers";
import { isValidUnitSlug } from "@/lib/units";

type UnitInput = {
  slug: string;
  label: string;
  icon: string;
  description: string;
  sort_order: number;
  is_active: boolean;
};

function clean(input: UnitInput) {
  return {
    slug: input.slug.trim().toLowerCase(),
    label: input.label.trim(),
    icon: input.icon.trim() || "HelpCircle",
    description: input.description.trim(),
    sort_order: Number.isFinite(input.sort_order) ? input.sort_order : 0,
    is_active: input.is_active,
  };
}

function validate(v: ReturnType<typeof clean>): string | null {
  if (!v.label) return "กรุณากรอกชื่อกลุ่มงาน";
  if (v.label.length > 255) return "ชื่อยาวเกิน 255 ตัวอักษร";
  if (!v.slug) return "กรุณากรอกรหัสงาน";
  if (!isValidUnitSlug(v.slug)) return "รหัสงานใช้ได้เฉพาะ a-z 0-9 และขีดกลาง";
  if (v.description.length > 2000) return "คำอธิบายยาวเกิน 2,000 ตัวอักษร";
  return null;
}

function revalidateAll(slug?: string) {
  revalidatePath("/units");
  revalidatePath("/about");
  revalidatePath("/admin/units");
  if (slug) revalidatePath(`/units/${slug}`);
}

export async function createUnit(input: UnitInput): Promise<ActionResult> {
  try {
    const { supabase } = await authorize("manageSite");
    const v = clean(input);
    const err = validate(v);
    if (err) return { ok: false, error: err };

    const { data: existing } = await supabase
      .from("units")
      .select("slug")
      .eq("slug", v.slug)
      .maybeSingle();
    if (existing) return { ok: false, error: `รหัส "${v.slug}" ถูกใช้ไปแล้ว` };

    const { error } = await supabase.from("units").insert(v);
    if (error) return { ok: false, error: error.message };

    revalidateAll(v.slug);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/** แก้ได้ทุกอย่างยกเว้น slug เพราะเป็นตัวเชื่อมกับโพสต์และผังผู้รับผิดชอบ */
export async function updateUnit(slug: string, input: Omit<UnitInput, "slug">): Promise<ActionResult> {
  try {
    const { supabase } = await authorize("manageSite");
    const v = clean({ ...input, slug });
    const err = validate(v);
    if (err) return { ok: false, error: err };

    const { slug: _ignored, ...patch } = v;
    void _ignored;
    const { error } = await supabase.from("units").update(patch).eq("slug", slug);
    if (error) return { ok: false, error: error.message };

    revalidateAll(slug);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/**
 * ลบถาวร — ทำได้เฉพาะงานที่ยังไม่มีโพสต์และไม่มีผู้รับผิดชอบ
 * ถ้ามีข้อมูลผูกอยู่ ให้ใช้การซ่อน (is_active = false) แทน จะได้ไม่เกิดข้อมูลกำพร้า
 */
export async function deleteUnit(slug: string): Promise<ActionResult> {
  try {
    const { supabase } = await authorize("manageSite");

    const [{ count: posts }, { count: staff }] = await Promise.all([
      supabase.from("unit_posts").select("id", { count: "exact", head: true }).eq("unit_slug", slug),
      supabase.from("unit_staff").select("id", { count: "exact", head: true }).eq("unit_slug", slug),
    ]);

    if ((posts ?? 0) > 0 || (staff ?? 0) > 0) {
      return {
        ok: false,
        error: `ลบไม่ได้ เพราะงานนี้มีรายการ ${posts ?? 0} รายการ และผู้รับผิดชอบ ${staff ?? 0} คน — ให้ปิดการแสดงแทน`,
      };
    }

    const { error } = await supabase.from("units").delete().eq("slug", slug);
    if (error) return { ok: false, error: error.message };

    revalidateAll(slug);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
