"use server";

import { revalidatePath } from "next/cache";
import { documentSchema } from "@/lib/validations";
import { authorize, nullifyEmpty, type ActionResult } from "@/lib/actions/helpers";

function parse(formData: FormData) {
  return documentSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    file_url: formData.get("file_url"),
    file_name: formData.get("file_name") ?? "",
    file_type: formData.get("file_type") ?? "",
    file_size: formData.get("file_size") || 0,
    category_id: formData.get("category_id") ?? "",
    is_published: formData.get("is_published") === "true" || formData.get("is_published") === "on",
  });
}

export async function createDocument(formData: FormData): Promise<ActionResult> {
  try {
    const { supabase, userId } = await authorize("write");
    const parsed = parse(formData);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
    const { error } = await supabase
      .from("documents")
      .insert({ ...nullifyEmpty(parsed.data), uploaded_by: userId });
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/documents");
    revalidatePath("/downloads");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function updateDocument(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const { supabase } = await authorize("write");
    const parsed = parse(formData);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
    const { error } = await supabase.from("documents").update(nullifyEmpty(parsed.data)).eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/documents");
    revalidatePath("/downloads");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function deleteDocument(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await authorize("delete");
    const { error } = await supabase.from("documents").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/documents");
    revalidatePath("/downloads");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
