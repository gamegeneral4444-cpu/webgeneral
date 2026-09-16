import { BarChart3, FileText, Grid3x3, Newspaper, Users, type LucideIcon } from "lucide-react";

export type DashboardCounts = {
  news: number;
  published: number;
  documents: number;
  albums: number;
  services: number;
  staff: number;
  pageViews: number;
};

export type DashboardCard = {
  label: string;
  value: number;
  caption: string;
  href: string;
  icon: LucideIcon;
};

export function buildDashboardCards(counts: DashboardCounts): DashboardCard[] {
  return [
    { label: "ข่าวทั้งหมด", value: counts.news, caption: `เผยแพร่แล้ว ${counts.published} รายการ`, href: "/admin/news", icon: Newspaper },
    { label: "เอกสารดาวน์โหลด", value: counts.documents, caption: "ไฟล์", href: "/admin/documents", icon: FileText },
    { label: "ระบบบริการ", value: counts.services, caption: "ระบบที่เปิดใช้งาน", href: "/admin/services", icon: Grid3x3 },
    { label: "บุคลากร", value: counts.staff, caption: "คน", href: "/admin/staff", icon: Users },
    { label: "ผู้เข้าชม 30 วัน", value: counts.pageViews, caption: "ครั้ง", href: "/admin#analytics", icon: BarChart3 },
  ];
}
