import Link from "next/link";
import {
  Newspaper,
  CheckCircle2,
  FileText,
  Images,
  Grid3x3,
  Users,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { NEWS_STATUS } from "@/lib/constants";
import { getDashboardStats } from "@/lib/data";
import { adminListNews, adminListDocuments } from "@/lib/admin-data";
import { formatThaiDate } from "@/lib/format";
import type { NewsStatus } from "@/types/database";

export const dynamic = "force-dynamic";
export const metadata = { title: "แดชบอร์ด" };

const STATUS_STYLE: Record<NewsStatus, string> = {
  published: "bg-emerald-100 text-emerald-700",
  draft: "bg-amber-100 text-amber-700",
  archived: "bg-slate-100 text-slate-600",
};

export default async function AdminDashboard() {
  const [stats, news, documents] = await Promise.all([
    getDashboardStats(),
    adminListNews(),
    adminListDocuments(),
  ]);

  const cards = [
    { label: "ข่าวทั้งหมด", value: stats.news, icon: Newspaper, color: "text-blue-600 bg-blue-50" },
    { label: "ข่าวเผยแพร่แล้ว", value: stats.published, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
    { label: "เอกสาร", value: stats.documents, icon: FileText, color: "text-red-600 bg-red-50" },
    { label: "อัลบั้มภาพ", value: stats.albums, icon: Images, color: "text-purple-600 bg-purple-50" },
    { label: "บริการที่เปิด", value: stats.services, icon: Grid3x3, color: "text-amber-600 bg-amber-50" },
    { label: "บุคลากร", value: stats.staff, icon: Users, color: "text-teal-600 bg-teal-50" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">แดชบอร์ด</h1>
        <p className="mt-1 text-sm text-muted-foreground">ภาพรวมข้อมูลของเว็บไซต์</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border bg-card p-4 shadow-sm">
            <div className={`grid size-10 place-items-center rounded-lg ${c.color}`}>
              <c.icon className="size-5" aria-hidden />
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">{c.value}</p>
            <p className="text-xs text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* ข่าวล่าสุด */}
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b px-5 py-3">
            <h2 className="font-semibold text-foreground">ข่าวล่าสุด</h2>
            <Link href="/admin/news" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
              ดูทั้งหมด <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <ul className="divide-y">
            {news.slice(0, 5).map((n) => (
              <li key={n.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <Link href={`/admin/news/${n.id}/edit`} className="min-w-0 flex-1 truncate text-sm text-foreground hover:text-primary">
                  {n.title}
                </Link>
                <Badge className={STATUS_STYLE[n.status]} variant="secondary">
                  {NEWS_STATUS[n.status]}
                </Badge>
              </li>
            ))}
            {news.length === 0 && (
              <li className="px-5 py-8 text-center text-sm text-muted-foreground">ยังไม่มีข่าว</li>
            )}
          </ul>
        </div>

        {/* เอกสารล่าสุด */}
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b px-5 py-3">
            <h2 className="font-semibold text-foreground">เอกสารล่าสุด</h2>
            <Link href="/admin/documents" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
              ดูทั้งหมด <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <ul className="divide-y">
            {documents.slice(0, 5).map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <span className="min-w-0 flex-1 truncate text-sm text-foreground">{d.title}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{formatThaiDate(d.created_at)}</span>
              </li>
            ))}
            {documents.length === 0 && (
              <li className="px-5 py-8 text-center text-sm text-muted-foreground">ยังไม่มีเอกสาร</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
