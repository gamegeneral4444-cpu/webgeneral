"use server";

import { revalidatePath } from "next/cache";
import { serviceSchema } from "@/lib/validations";
import { authorize, nullifyEmpty, type ActionResult } from "@/lib/actions/helpers";

function parse(formData: FormData) {
  return serviceSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    icon: formData.get("icon") ?? "",
    url: formData.get("url"),
    category_id: formData.get("category_id") ?? "",
    status: formData.get("status"),
    sort_order: formData.get("sort_order") || 0,
    is_external: formData.get("is_external") === "true" || formData.get("is_external") === "on",
  });
}

export async function createService(formData: FormData): Promise<ActionResult> {
  try {
    const { supabase } = await authorize("manageSite");
    const parsed = parse(formData);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
    const { error } = await supabase.from("services").insert(nullifyEmpty(parsed.data));
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/services");
    revalidatePath("/services");
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function updateService(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const { supabase } = await authorize("manageSite");
    const parsed = parse(formData);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
    const { error } = await supabase.from("services").update(nullifyEmpty(parsed.data)).eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/services");
    revalidatePath("/services");
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function deleteService(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await authorize("manageSite");
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/services");
    revalidatePath("/services");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
