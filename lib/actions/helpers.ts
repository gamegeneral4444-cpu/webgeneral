import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { canWrite, canDelete, canManageSite, canManageUsers, type Role } from "@/lib/permissions";

export type ActionResult = { ok: boolean; error?: string };

type Guard = "write" | "delete" | "manageSite" | "manageUsers";

const GUARDS: Record<Guard, (r?: Role | null) => boolean> = {
  write: canWrite,
  delete: canDelete,
  manageSite: canManageSite,
  manageUsers: canManageUsers,
};

/**
 * ตรวจสอบสิทธิ์ก่อน mutation — คืน supabase client + role ถ้าผ่าน
 * ถ้าไม่ผ่าน throw error (จับใน action แล้วคืน ActionResult)
 */
export async function authorize(guard: Guard) {
  const current = await getCurrentUser();
  if (!current) throw new Error("กรุณาเข้าสู่ระบบ");
  const role = current.profile?.role;
  if (!current.profile?.is_active) throw new Error("บัญชีถูกระงับการใช้งาน");
  if (!GUARDS[guard](role)) throw new Error("คุณไม่มีสิทธิ์ดำเนินการนี้");
  const supabase = await createClient();
  return { supabase, role, userId: current.userId };
}

/** ทำความสะอาด payload: แปลง "" เป็น null สำหรับฟิลด์ optional */
export function nullifyEmpty<T extends Record<string, unknown>>(obj: T): T {
  const out = { ...obj };
  for (const k in out) {
    if (out[k] === "") out[k] = null as T[Extract<keyof T, string>];
  }
  return out;
}
