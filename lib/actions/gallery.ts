"use server";

import { revalidatePath } from "next/cache";
import { galleryAlbumSchema } from "@/lib/validations";
import { authorize, nullifyEmpty, type ActionResult } from "@/lib/actions/helpers";
import { z } from "zod";

const uuid = z.string().uuid();
const captionSchema = z.string().trim().max(500);

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
    const { data: image } = await supabase.from("gallery_images").select("album_id").eq("id", imageId).maybeSingle();
    const { error } = await supabase.from("gallery_images").delete().eq("id", imageId);
    if (error) return { ok: false, error: error.message };
    if (image?.album_id) revalidatePath(`/admin/gallery/${image.album_id}/edit`);
    revalidatePath("/gallery");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function updateGalleryImage(imageId: string, albumId: string, caption: string): Promise<ActionResult> {
  try {
    if (!uuid.safeParse(imageId).success || !uuid.safeParse(albumId).success) return { ok: false, error: "ข้อมูลรูปไม่ถูกต้อง" };
    const parsedCaption = captionSchema.safeParse(caption);
    if (!parsedCaption.success) return { ok: false, error: "คำบรรยายยาวเกิน 500 ตัวอักษร" };
    const { supabase } = await authorize("write");
    const { error } = await supabase.from("gallery_images").update({ caption: parsedCaption.data || null }).eq("id", imageId).eq("album_id", albumId);
    if (error) return { ok: false, error: error.message };
    revalidatePath(`/admin/gallery/${albumId}/edit`);
    revalidatePath("/gallery");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}

export async function reorderGalleryImages(albumId: string, imageIds: string[]): Promise<ActionResult> {
  try {
    if (!uuid.safeParse(albumId).success || imageIds.some((id) => !uuid.safeParse(id).success)) return { ok: false, error: "ข้อมูลรูปไม่ถูกต้อง" };
    const { supabase } = await authorize("write");
    const { error } = await supabase.rpc("reorder_gallery_images", { target_album_id: albumId, image_ids: imageIds });
    if (error) return { ok: false, error: error.message };
    revalidatePath(`/admin/gallery/${albumId}/edit`);
    revalidatePath("/gallery");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}
