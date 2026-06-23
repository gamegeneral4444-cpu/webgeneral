import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AuditDetailDialog } from "./audit-detail-dialog";
import { adminListAuditDetails, adminListAuditLogs } from "@/lib/admin-data";
import { formatThaiDate } from "@/lib/format";
import { canManageSite } from "@/lib/permissions";
import { getCurrentUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "ประวัติกิจกรรม" };

const ACTION_LABEL: Record<string, string> = { INSERT: "เพิ่ม", UPDATE: "แก้ไข", DELETE: "ลบ" };

export default async function ActivityPage({ searchParams }: { searchParams: Promise<{ page?: string; action?: string; table?: string }> }) {
  const params = await searchParams;
  const current = await getCurrentUser();
  const result = await adminListAuditLogs({ page: Number(params.page) || 1, action: params.action, table: params.table });
  const canSeeDetails = canManageSite(current?.profile?.role);
  const details = canSeeDetails ? await adminListAuditDetails(result.rows.map((row) => row.id)) : {};
  const pageCount = Math.max(Math.ceil(result.total / result.pageSize), 1);

  return (
    <div>
      <AdminPageHeader title="ประวัติกิจกรรม" description="บันทึกการเพิ่ม แก้ไข และลบข้อมูลจากฐานข้อมูลแบบอ่านอย่างเดียว" />
      <form className="mb-4 flex flex-wrap gap-2 rounded-xl border bg-white p-3">
        <select name="action" defaultValue={params.action ?? ""} className="h-10 rounded-md border bg-white px-3 text-sm"><option value="">ทุกการทำงาน</option><option value="INSERT">เพิ่ม</option><option value="UPDATE">แก้ไข</option><option value="DELETE">ลบ</option></select>
        <select name="table" defaultValue={params.table ?? ""} className="h-10 rounded-md border bg-white px-3 text-sm"><option value="">ทุกโมดูล</option><option value="news">ข่าว</option><option value="documents">เอกสาร</option><option value="services">บริการ</option><option value="gallery_albums">อัลบั้ม</option><option value="staff">บุคลากร</option><option value="site_settings">ตั้งค่า</option><option value="profiles">ผู้ใช้</option></select>
        <Button type="submit" variant="outline">กรองข้อมูล</Button>
      </form>
      <div className="overflow-hidden rounded-xl border border-[var(--admin-border)] bg-white shadow-sm">
        <div className="divide-y">
          {result.rows.map((row) => (
            <article key={row.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1"><p className="font-semibold text-[var(--admin-ink)]">{row.actor_full_name || row.actor_email || "ระบบ"}</p><p className="mt-1 text-sm text-slate-600"><Badge variant="secondary" className="mr-2">{ACTION_LABEL[row.action] ?? row.action}</Badge>{row.table_name ?? "ระบบ"}</p><time className="mt-1 block text-xs text-muted-foreground">{formatThaiDate(row.created_at, { withTime: true })}</time></div>
              {canSeeDetails && details[row.id] && <AuditDetailDialog before={details[row.id].old_data} after={details[row.id].new_data} />}
            </article>
          ))}
          {result.rows.length === 0 && <p className="py-12 text-center text-sm text-muted-foreground">ยังไม่มีประวัติกิจกรรม หรือยังไม่ได้ใช้ migration 0004</p>}
        </div>
      </div>
      <nav className="mt-4 flex items-center justify-end gap-2" aria-label="หน้าประวัติกิจกรรม">
        <Button asChild variant="outline" size="sm" disabled={result.page <= 1}><Link href={`?page=${Math.max(result.page - 1, 1)}`}>ก่อนหน้า</Link></Button>
        <span className="text-sm text-muted-foreground">หน้า {result.page} / {pageCount}</span>
        <Button asChild variant="outline" size="sm" disabled={result.page >= pageCount}><Link href={`?page=${Math.min(result.page + 1, pageCount)}`}>ถัดไป</Link></Button>
      </nav>
    </div>
  );
}
