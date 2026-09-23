"use server";

import { revalidatePath } from "next/cache";
import { authorize, type ActionResult } from "@/lib/actions/helpers";

import type { UnitRole } from "@/types/database";

export type UnitRoleEntry = { unit_slug: string; role: UnitRole };

/**
 * ตั้งบทบาทของบุคลากรคนหนึ่งใหม่ทั้งชุด
 *
 * ลบของเดิมทิ้งแล้วใส่ชุดใหม่ ง่ายกว่าไล่เทียบทีละแถวและได้ผลเหมือนกัน
 * เพราะหนึ่งคนมีบทบาทไม่เกิน 14 แถว
 */
export async function setStaffUnitRoles(
  staffId: string,
  entries: UnitRoleEntry[],
): Promise<ActionResult> {
  try {
    const { supabase } = await authorize("manageSite");

    // กันค่าที่ไม่ได้มาจากรายการงานจริง — ตรวจกับตาราง units
    const { data: unitRows } = await supabase.from("units").select("slug");
    const known = new Set((unitRows ?? []).map((u: { slug: string }) => u.slug));
    const valid = entries.filter(
      (e) => known.has(e.unit_slug) && (e.role === "head" || e.role === "assistant"),
    );

    const { error: delError } = await supabase
      .from("unit_staff")
      .delete()
      .eq("staff_id", staffId);
    if (delError) return { ok: false, error: delError.message };

    if (valid.length) {
      const { error } = await supabase.from("unit_staff").insert(
        valid.map((e) => ({
          staff_id: staffId,
          unit_slug: e.unit_slug,
          role: e.role,
        })),
      );
      if (error) return { ok: false, error: error.message };
    }

    revalidatePath("/units");
    revalidatePath("/staff");
    for (const e of valid) revalidatePath(`/units/${e.unit_slug}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
