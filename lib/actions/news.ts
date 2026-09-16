"use server";

import { revalidatePath } from "next/cache";
import { newsSchema } from "@/lib/validations";
import { authorize, nullifyEmpty, type ActionResult } from "@/lib/actions/helpers";

function parse(formData: FormData) {
  return newsSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt") ?? "",
    content: formData.get("content"),
    cover_image_url: formData.get("cover_image_url") ?? "",
    category_id: formData.get("category_id") ?? "",
    status: formData.get("status"),
    is_featured: formData.get("is_featured") === "on" || formData.get("is_featured") === "true",
    published_at: formData.get("published_at") ?? "",
  });
}

export async function createNews(formData: FormData): Promise<ActionResult> {
  try {
    const { supabase, userId } = await authorize("write");
    const parsed = parse(formData);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

    const payload = nullifyEmpty(parsed.data);
    if (payload.status === "published" && !payload.published_at) {
      payload.published_at = new Date().toISOString();
    }

    const { error } = await supabase.from("news").insert({ ...payload, created_by: userId });
    if (error) return { ok: false, error: error.message };

    revalidatePath("/admin/news");
    revalidatePath("/news");
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function updateNews(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const { supabase } = await authorize("write");
    const parsed = parse(formData);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

    const payload = nullifyEmpty(parsed.data);
    if (payload.status === "published" && !payload.published_at) {
      payload.published_at = new Date().toISOString();
    }

    const { error } = await supabase.from("news").update(payload).eq("id", id);
    if (error) return { ok: false, error: error.message };

    revalidatePath("/admin/news");
    revalidatePath("/news");
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function deleteNews(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await authorize("delete");
    const { error } = await supabase.from("news").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/news");
    revalidatePath("/news");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
