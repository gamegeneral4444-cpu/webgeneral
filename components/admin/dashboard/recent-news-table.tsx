import Link from "next/link";
import { ArrowRight, Eye, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { NEWS_STATUS } from "@/lib/constants";
import { formatThaiDate } from "@/lib/format";
import type { News, NewsStatus } from "@/types/database";

const STATUS_STYLE: Record<NewsStatus, string> = {
  published: "bg-emerald-50 text-emerald-700",
  draft: "bg-amber-50 text-amber-700",
  archived: "bg-slate-100 text-slate-600",
};

export function RecentNewsTable({ rows }: { rows: News[] }) {
  return (
    <section className="overflow-hidden rounded-xl border border-[var(--admin-border)] bg-white shadow-sm" aria-labelledby="recent-news-title">
      <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-5">
        <h2 id="recent-news-title" className="font-bold text-[var(--admin-ink)]">ข่าวประชาสัมพันธ์ล่าสุด</h2>
        <Link href="/admin/news" className="inline-flex items-center gap-1 text-xs font-medium text-[var(--admin-gold)] hover:underline">
          ดูทั้งหมด <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </header>
      {rows.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-muted-foreground">ยังไม่มีข่าว</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="bg-slate-50/80 text-xs text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">หัวข้อข่าว</th>
                <th className="px-3 py-3 font-medium">หมวดหมู่</th>
                <th className="px-3 py-3 font-medium">สถานะ</th>
                <th className="px-3 py-3 font-medium">วันที่</th>
                <th className="px-5 py-3 text-right font-medium">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.slice(0, 5).map((news) => (
                <tr key={news.id} className="hover:bg-amber-50/30">
                  <td className="max-w-xs px-5 py-3 font-medium text-[var(--admin-ink)]"><span className="line-clamp-2">{news.title}</span></td>
                  <td className="px-3 py-3 text-slate-500">{news.category?.name ?? "ทั่วไป"}</td>
                  <td className="px-3 py-3"><Badge variant="secondary" className={STATUS_STYLE[news.status]}>{NEWS_STATUS[news.status]}</Badge></td>
                  <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-500">{formatThaiDate(news.published_at ?? news.created_at)}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <Link href={`/admin/news/${news.id}/edit`} aria-label={`แก้ไข ${news.title}`} className="rounded-md border p-2 text-slate-600 hover:border-[var(--admin-gold)] hover:text-[var(--admin-gold)]"><Pencil className="size-3.5" aria-hidden /></Link>
                      {news.status === "published" && <Link href={`/news/${news.slug}`} target="_blank" aria-label={`ดู ${news.title}`} className="rounded-md border p-2 text-slate-600 hover:border-[var(--admin-gold)] hover:text-[var(--admin-gold)]"><Eye className="size-3.5" aria-hidden /></Link>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
