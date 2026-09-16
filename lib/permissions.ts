/**
 * ระบบสิทธิ์ตาม Role (อ้างอิงเอกสาร 05 / 07 Role Matrix)
 */
export type Role = "super_admin" | "admin" | "editor" | "viewer";

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "ผู้ดูแลระบบสูงสุด",
  admin: "ผู้ดูแล",
  editor: "ผู้แก้ไข",
  viewer: "ผู้ชม",
};

/** เพิ่ม/แก้ไข content (ข่าว เอกสาร ฯลฯ) */
export function canWrite(role?: Role | null): boolean {
  return role === "super_admin" || role === "admin" || role === "editor";
}

/** ลบ content — editor ลบไม่ได้ */
export function canDelete(role?: Role | null): boolean {
  return role === "super_admin" || role === "admin";
}

/** จัดการบุคลากร / ตั้งค่าเว็บไซต์ */
export function canManageSite(role?: Role | null): boolean {
  return role === "super_admin" || role === "admin";
}

/** จัดการผู้ใช้งาน — เฉพาะ super_admin */
export function canManageUsers(role?: Role | null): boolean {
  return role === "super_admin";
}

/** เข้าถึงหลังบ้านได้ทุก role ที่ active */
export function canAccessAdmin(role?: Role | null): boolean {
  return role === "super_admin" || role === "admin" || role === "editor" || role === "viewer";
}
