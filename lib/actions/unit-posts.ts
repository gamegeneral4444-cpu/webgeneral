"use server";

import { revalidatePath } from "next/cache";
import { unitPostSchema } from "@/lib/validations";
import { authorize, nullifyEmpty, type ActionResult } from "@/lib/actions/helpers";

function parse(formData: FormData) {
  return unitPostSchema.safeParse({
    unit_slug: formData.get("unit_slug"),
    title: formData.get("title"),
    body: formData.get("body") ?? "",
    attachment_url: formData.get("attachment_url") ?? "",
    status: formData.get("status"),
    posted_at: formData.get("posted_at") ?? "",
  });
}

function revalidate(unitSlug: string) {
  revalidatePath("/admin/unit-posts");
  revalidatePath("/units");
  revalidatePath(`/units/${unitSlug}`);
}

export async function createUnitPost(formData: FormData): Promise<ActionResult> {
  try {
    const { supabase, userId } = await authorize("write");
    const parsed = parse(formData);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

    const payload = nullifyEmpty(parsed.data);
    // เผยแพร่โดยไม่ระบุวันที่ = ใช้วันนี้ ให้เรียงลำดับบนหน้าเว็บได้ถูก
    if (payload.status === "published" && !payload.posted_at) {
      payload.posted_at = new Date().toISOString();
    }

    const { error } = await supabase.from("unit_posts").insert({ ...payload, created_by: userId });
    if (error) return { ok: false, error: error.message };

    revalidate(parsed.data.unit_slug);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function updateUnitPost(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const { supabase } = await authorize("write");
    const parsed = parse(formData);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

    const payload = nullifyEmpty(parsed.data);
    if (payload.status === "published" && !payload.posted_at) {
      payload.posted_at = new Date().toISOString();
    }

    const { error } = await supabase.from("unit_posts").update(payload).eq("id", id);
    if (error) return { ok: false, error: error.message };

    revalidate(parsed.data.unit_slug);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function deleteUnitPost(id: string, unitSlug: string): Promise<ActionResult> {
  try {
    const { supabase } = await authorize("delete");
    const { error } = await supabase.from("unit_posts").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };

    revalidate(unitSlug);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
