"use server";

import { revalidatePath } from "next/cache";
import { galleryAlbumSchema } from "@/lib/validations";
import { authorize, nullifyEmpty, type ActionResult } from "@/lib/actions/helpers";

function parse(formData: FormData) {
  return galleryAlbumSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    description: formData.get("description") ?? "",
    cover_image_url: formData.get("cover_image_url") ?? "",
    event_date: formData.get("event_date") ?? "",
    is_published: formData.get("is_published") === "true" || formData.get("is_published") === "on",
  });
}

export async function createAlbum(formData: FormData): Promise<{ ok: boolean; error?: string; id?: string }> {
  try {
    const { supabase, userId } = await authorize("write");
    const parsed = parse(formData);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
    const { data, error } = await supabase
      .from("gallery_albums")
      .insert({ ...nullifyEmpty(parsed.data), created_by: userId })
      .select("id")
      .single();
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/gallery");
    revalidatePath("/gallery");
    return { ok: true, id: data.id };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function updateAlbum(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const { supabase } = await authorize("write");
    const parsed = parse(formData);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
    const { error } = await supabase.from("gallery_albums").update(nullifyEmpty(parsed.data)).eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/gallery");
    revalidatePath("/gallery");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function deleteAlbum(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await authorize("delete");
    const { error } = await supabase.from("gallery_albums").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/gallery");
    revalidatePath("/gallery");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function addGalleryImage(albumId: string, imageUrl: string, caption?: string): Promise<ActionResult> {
  try {
    const { supabase } = await authorize("write");
    const { error } = await supabase
      .from("gallery_images")
      .insert({ album_id: albumId, image_url: imageUrl, caption: caption || null });
    if (error) return { ok: false, error: error.message };
    revalidatePath(`/admin/gallery/${albumId}/edit`);
    revalidatePath("/gallery");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function deleteGalleryImage(imageId: string): Promise<ActionResult> {
  try {
    const { supabase } = await authorize("write");
    const { error } = await supabase.from("gallery_images").delete().eq("id", imageId);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/gallery");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
