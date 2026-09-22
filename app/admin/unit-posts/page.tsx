import Link from "next/link";
import { Plus } from "lucide-react";
import { getUnitPosts } from "@/lib/data";
import { UNITS } from "@/lib/units";
import { formatThaiDate } from "@/lib/format";

export const metadata = { title: "กลุ่มงาน" };

const UNIT_LABEL: Record<string, string> = Object.fromEntries(
  UNITS.map((u) => [u.slug, u.label]),
);

export default async function AdminUnitPostsPage() {
  const posts = await getUnitPosts({ includeDrafts: true });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[var(--admin-ink)]">กลุ่มงาน</h1>
          <p className="text-sm text-muted-foreground">
            ลงงานและอัปเดตความคืบหน้าของแต่ละงาน แยกจากข่าวประชาสัมพันธ์
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/unit-details"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[var(--admin-border)] bg-card px-4 text-sm font-semibold text-[var(--admin-ink)] transition-colors hover:bg-accent"
        >
          แก้คำอธิบายกลุ่มงาน
        </Link>
        <Link
          href="/admin/unit-posts/create"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="size-4" aria-hidden /> เพิ่มรายการ
        </Link>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--admin-border)] bg-card">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-secondary text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">หัวข้อ</th>
              <th className="px-4 py-3 font-medium">งาน</th>
              <th className="px-4 py-3 font-medium">สถานะ</th>
              <th className="px-4 py-3 font-medium">วันที่</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                  ยังไม่มีรายการ — กด &quot;เพิ่มรายการ&quot; เพื่อลงงานแรก
                </td>
              </tr>
            )}
            {posts.map((p) => (
              <tr key={p.id} className="border-t transition-colors hover:bg-accent/40">
                <td className="px-4 py-3 font-medium text-foreground">{p.title}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {UNIT_LABEL[p.unit_slug] ?? p.unit_slug}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      p.status === "published"
                        ? "rounded-full bg-soft-gold px-2.5 py-0.5 text-xs font-medium text-gold-dark"
                        : "rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                    }
                  >
                    {p.status === "published" ? "เผยแพร่" : "ฉบับร่าง"}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {p.posted_at ? formatThaiDate(p.posted_at) : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/unit-posts/${p.id}/edit`}
                    className="font-medium text-primary hover:underline"
                  >
                    แก้ไข
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
