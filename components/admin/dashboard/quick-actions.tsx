import Link from "next/link";
import { FilePlus2, FolderCog, ImagePlus, Newspaper, Settings2, UserPlus } from "lucide-react";
import { canManageSite, canWrite, type Role } from "@/lib/permissions";

const ACTIONS = [
  { href: "/admin/news/create", label: "เพิ่มข่าวใหม่", icon: Newspaper, permission: "write" },
  { href: "/admin/documents/create", label: "เพิ่มเอกสาร", icon: FilePlus2, permission: "write" },
  { href: "/admin/gallery/create", label: "เพิ่มอัลบั้มภาพ", icon: ImagePlus, permission: "write" },
  { href: "/admin/staff/create", label: "เพิ่มบุคลากร", icon: UserPlus, permission: "manage" },
  { href: "/admin/categories", label: "จัดการหมวดหมู่", icon: FolderCog, permission: "manage" },
  { href: "/admin/settings", label: "ตั้งค่าเว็บไซต์", icon: Settings2, permission: "manage" },
] as const;

export function QuickActions({ role }: { role: Role }) {
  const visible = ACTIONS.filter((action) =>
    action.permission === "write" ? canWrite(role) : canManageSite(role),
  );

  return (
    <section className="rounded-xl border border-[var(--admin-border)] bg-white p-4 shadow-sm" aria-labelledby="quick-actions-title">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 id="quick-actions-title" className="font-bold text-[var(--admin-ink)]">ทางลัดการจัดการ</h2>
        <Link href="/admin/news" aria-label="ดูข่าวทั้งหมด" className="text-xs font-medium text-[var(--admin-gold)] hover:underline">
          ดูข่าวทั้งหมด
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {visible.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            aria-label={action.label}
            className="flex min-h-20 flex-col justify-center gap-2 rounded-lg border border-slate-200 px-3 py-3 text-sm font-medium text-[var(--admin-ink)] transition hover:border-[var(--admin-gold)] hover:bg-amber-50/50"
          >
            <action.icon className="size-5 text-[var(--admin-gold)]" aria-hidden />
            {action.label}
          </Link>
        ))}
        {visible.length === 0 && (
          <p className="col-span-2 rounded-lg bg-slate-50 p-4 text-sm text-muted-foreground">บัญชีนี้มีสิทธิ์ดูข้อมูลเท่านั้น</p>
        )}
      </div>
    </section>
  );
}
