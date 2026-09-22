"use server";

import { revalidatePath } from "next/cache";
import { authorize, type ActionResult } from "@/lib/actions/helpers";
import { findUnit } from "@/lib/units";

export async function updateUnitDescription(
  unitSlug: string,
  description: string,
): Promise<ActionResult> {
  try {
    const { supabase } = await authorize("manageSite");
    if (!findUnit(unitSlug)) return { ok: false, error: "ไม่พบงานนี้" };
    const text = description.trim();
    if (text.length > 2000) return { ok: false, error: "คำอธิบายยาวเกิน 2,000 ตัวอักษร" };

    const { error } = await supabase
      .from("unit_details")
      .upsert({ unit_slug: unitSlug, description: text }, { onConflict: "unit_slug" });
    if (error) return { ok: false, error: error.message };

    revalidatePath("/units");
    revalidatePath(`/units/${unitSlug}`);
    revalidatePath("/admin/unit-details");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
