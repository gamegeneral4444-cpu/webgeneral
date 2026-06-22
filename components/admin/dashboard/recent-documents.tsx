import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { fileExtLabel, formatThaiDate } from "@/lib/format";
import type { DocumentItem } from "@/types/database";

export function RecentDocuments({ rows }: { rows: DocumentItem[] }) {
  return (
    <section className="rounded-xl border border-[var(--admin-border)] bg-white p-4 shadow-sm" aria-labelledby="recent-documents-title">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="recent-documents-title" className="font-bold text-[var(--admin-ink)]">เอกสารล่าสุด</h2>
        <Link href="/admin/documents" className="inline-flex items-center gap-1 text-xs text-[var(--admin-gold)] hover:underline">ดูทั้งหมด <ArrowRight className="size-3" aria-hidden /></Link>
      </div>
      {rows.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">ยังไม่มีเอกสาร</p> : (
        <ul className="divide-y divide-slate-100">
          {rows.slice(0, 4).map((document) => (
            <li key={document.id} className="flex items-center gap-3 py-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-amber-50 text-[var(--admin-gold)]"><FileText className="size-4" aria-hidden /></span>
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-[var(--admin-ink)]">{document.title}</p><p className="text-xs text-muted-foreground">{fileExtLabel(document.file_name, document.file_type)} · {formatThaiDate(document.created_at)}</p></div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
