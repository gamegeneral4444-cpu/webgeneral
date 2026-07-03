"use server";

import { revalidatePath } from "next/cache";
import { settingsSchema } from "@/lib/validations";
import { authorize, nullifyEmpty, type ActionResult } from "@/lib/actions/helpers";

export async function updateSettings(formData: FormData): Promise<ActionResult> {
  try {
    const { supabase, userId } = await authorize("manageSite");
    const parsed = settingsSchema.safeParse({
      site_name: formData.get("site_name"),
      school_name: formData.get("school_name") ?? "",
      logo_url: formData.get("logo_url") ?? "",
      banner_image_url: formData.get("banner_image_url") ?? "",
      primary_color: formData.get("primary_color") ?? "",
      address: formData.get("address") ?? "",
      phone: formData.get("phone") ?? "",
      email: formData.get("email") ?? "",
      facebook_url: formData.get("facebook_url") ?? "",
      line_url: formData.get("line_url") ?? "",
      youtube_url: formData.get("youtube_url") ?? "",
      map_embed_url: formData.get("map_embed_url") ?? "",
      office_hours: formData.get("office_hours") ?? "",
    });
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

    const payload = { ...nullifyEmpty(parsed.data), updated_by: userId, updated_at: new Date().toISOString() };

    // มีแถวอยู่แล้วหรือยัง
    const { data: existing } = await supabase.from("site_settings").select("id").limit(1).maybeSingle();
    const { error } = existing
      ? await supabase.from("site_settings").update(payload).eq("id", existing.id)
      : await supabase.from("site_settings").insert(payload);
    if (error) return { ok: false, error: error.message };

    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
