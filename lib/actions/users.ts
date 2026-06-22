"use server";

import { revalidatePath } from "next/cache";
import { authorize, type ActionResult } from "@/lib/actions/helpers";
import type { Role } from "@/lib/permissions";

const VALID_ROLES: Role[] = ["super_admin", "admin", "editor", "viewer"];

export async function updateUserRole(id: string, role: string): Promise<ActionResult> {
  try {
    const { supabase, userId } = await authorize("manageUsers");
    if (!VALID_ROLES.includes(role as Role)) return { ok: false, error: "บทบาทไม่ถูกต้อง" };
    if (id === userId) return { ok: false, error: "ไม่สามารถเปลี่ยนบทบาทของตนเองได้" };
    const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function toggleUserActive(id: string, isActive: boolean): Promise<ActionResult> {
  try {
    const { supabase, userId } = await authorize("manageUsers");
    if (id === userId) return { ok: false, error: "ไม่สามารถระงับบัญชีของตนเองได้" };
    const { error } = await supabase.from("profiles").update({ is_active: isActive }).eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
