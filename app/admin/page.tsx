import Link from "next/link";
import { FileUp, Plus } from "lucide-react";
import { ActivityTimeline } from "@/components/admin/dashboard/activity-timeline";
import { AnalyticsSummary } from "@/components/admin/dashboard/analytics-summary";
import { QuickActions } from "@/components/admin/dashboard/quick-actions";
import { RecentDocuments } from "@/components/admin/dashboard/recent-documents";
import { RecentNewsTable } from "@/components/admin/dashboard/recent-news-table";
import { RecentStaff } from "@/components/admin/dashboard/recent-staff";
import { StatCard } from "@/components/admin/dashboard/stat-card";
import { adminListAnalytics, adminListDocuments, adminListNews, adminListRecentAudit, adminListStaff } from "@/lib/admin-data";
import { buildDashboardCards } from "@/lib/dashboard";
import { getDashboardStats } from "@/lib/data";
import { canWrite } from "@/lib/permissions";
import { getCurrentUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "แดชบอร์ด" };

export default async function AdminDashboard() {
  const [current, stats, news, documents, staff, activity, analytics] = await Promise.all([
    getCurrentUser(),
    getDashboardStats(),
    adminListNews(),
    adminListDocuments(),
    adminListStaff(),
    adminListRecentAudit(6),
    adminListAnalytics(30),
  ]);
  const role = current?.profile?.role ?? "viewer";
  const pageViews = analytics.reduce((sum, row) => sum + row.page_views, 0);
  const cards = buildDashboardCards({ ...stats, pageViews });

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-semibold text-[var(--admin-gold)]">ภาพรวมระบบ</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[var(--admin-ink)] sm:text-3xl">แดชบอร์ดผู้ดูแลระบบ</h1>
          <p className="mt-1 text-sm text-muted-foreground">จัดการข่าวสาร เอกสาร ระบบบริการ บุคลากร และข้อมูลเว็บไซต์</p>
        </div>
        {canWrite(role) && (
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/news/create" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-gradient-to-r from-[var(--admin-gold)] to-[var(--admin-gold-bright)] px-4 text-sm font-semibold text-[var(--admin-navy-strong)] shadow-sm hover:brightness-105">
              <Plus className="size-4" aria-hidden /> เพิ่มข่าวใหม่
            </Link>
            <Link href="/admin/documents/create" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[var(--admin-gold)] bg-white px-4 text-sm font-semibold text-[var(--admin-ink)] hover:bg-amber-50">
              <FileUp className="size-4 text-[var(--admin-gold)]" aria-hidden /> อัปโหลดเอกสาร
            </Link>
          </div>
        )}
      </header>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5" aria-label="สถิติภาพรวม">
        {cards.map((card) => <StatCard key={card.label} {...card} />)}
      </section>

      <div className="grid gap-5 xl:grid-cols-12">
        <div className="xl:col-span-8"><RecentNewsTable rows={news} /></div>
        <div className="xl:col-span-4"><QuickActions role={role} /></div>
        <div className="grid gap-5 sm:grid-cols-2 xl:col-span-8">
          <RecentDocuments rows={documents} />
          <RecentStaff rows={staff} />
        </div>
        <div className="xl:col-span-4"><ActivityTimeline rows={activity} /></div>
      </div>

      <div id="analytics"><AnalyticsSummary rows={analytics} /></div>
    </div>
  );
}
