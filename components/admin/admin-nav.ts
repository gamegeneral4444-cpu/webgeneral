import {
  LayoutDashboard,
  Newspaper,
  FileText,
  Images,
  Grid3x3,
  Users,
  Settings,
  Tags,
  History,
  UserCog,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/lib/permissions";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles?: Role[]; // ถ้าไม่ระบุ = ทุก role ที่เข้าหลังบ้านได้
};

export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin", label: "แดชบอร์ด", icon: LayoutDashboard },
  { href: "/admin/news", label: "ข่าวประชาสัมพันธ์", icon: Newspaper },
  { href: "/admin/documents", label: "เอกสารดาวน์โหลด", icon: FileText },
  { href: "/admin/gallery", label: "ภาพกิจกรรม", icon: Images },
  { href: "/admin/services", label: "ระบบบริการ", icon: Grid3x3, roles: ["super_admin", "admin"] },
  { href: "/admin/staff", label: "บุคลากร", icon: Users, roles: ["super_admin", "admin"] },
  { href: "/admin/categories", label: "จัดการหมวดหมู่", icon: Tags, roles: ["super_admin", "admin"] },
  { href: "/admin/settings", label: "ตั้งค่าเว็บไซต์", icon: Settings, roles: ["super_admin", "admin"] },
  { href: "/admin/activity", label: "ประวัติกิจกรรม", icon: History },
  { href: "/admin/users", label: "ผู้ใช้งาน", icon: UserCog, roles: ["super_admin"] },
];

export function visibleNav(role?: Role | null): AdminNavItem[] {
  return ADMIN_NAV.filter((item) => !item.roles || (role && item.roles.includes(role)));
}
