import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatThaiDate } from "@/lib/format";
import type { AuditSummary } from "@/types/database";

const ACTION_LABEL: Record<string, string> = { INSERT: "เพิ่ม", UPDATE: "แก้ไข", DELETE: "ลบ" };

export function ActivityTimeline({ rows }: { rows: AuditSummary[] }) {
  return (
    <section className="rounded-xl border border-[var(--admin-border)] bg-white p-4 shadow-sm" aria-labelledby="activity-title">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="activity-title" className="font-bold text-[var(--admin-ink)]">กิจกรรมล่าสุด</h2>
        <Link href="/admin/activity" className="inline-flex items-center gap-1 text-xs text-[var(--admin-gold)] hover:underline">ดูทั้งหมด <ArrowRight className="size-3" aria-hidden /></Link>
      </div>
      {rows.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">ยังไม่มีกิจกรรมล่าสุด</p> : (
        <ol className="relative ml-2 border-l border-amber-200 pl-5">
          {rows.slice(0, 6).map((activity) => (
            <li key={activity.id} className="relative pb-5 last:pb-0">
              <span className="absolute -left-[1.55rem] top-1.5 size-2.5 rounded-full border-2 border-white bg-[var(--admin-gold)] ring-1 ring-amber-300" />
              <p className="text-sm font-semibold text-[var(--admin-ink)]">{activity.actor_full_name || activity.actor_email || "ระบบ"}</p>
              <p className="mt-0.5 text-xs text-slate-600">{ACTION_LABEL[activity.action] ?? activity.action}ข้อมูลใน {activity.table_name || "ระบบ"}</p>
              <time className="mt-1 block text-xs text-muted-foreground">{formatThaiDate(activity.created_at, { withTime: true })}</time>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
