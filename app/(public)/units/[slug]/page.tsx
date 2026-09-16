import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, Paperclip } from "lucide-react";
import { PageHero } from "@/components/public/page-hero";
import { EmptyState } from "@/components/public/section";
import { UNITS, findUnit } from "@/lib/units";
import { getUnitPosts } from "@/lib/data";
import { formatThaiDate } from "@/lib/format";

export const revalidate = 300;

export function generateStaticParams() {
  return UNITS.map((u) => ({ slug: u.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const unit = findUnit(slug);
  return { title: unit?.label ?? "ไม่พบงาน" };
}

export default async function UnitDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const unit = findUnit(slug);
  if (!unit) notFound();

  const posts = await getUnitPosts({ unitSlug: slug });

  return (
    <>
      <PageHero
        title={unit.label}
        subtitle={`ผู้รับผิดชอบ : ${unit.owner || "ยังไม่ได้ระบุ"}`}
        crumbs={[{ label: "กลุ่มงาน", href: "/units" }, { label: unit.label }]}
      />

      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-soft-gold text-primary ring-1 ring-primary/10">
            <unit.icon className="size-6" aria-hidden />
          </span>
          <div>
            <div className="mb-1 h-1 w-12 rounded-full bg-gold" aria-hidden />
            <h2 className="text-xl font-bold text-foreground">ความคืบหน้าและผลการดำเนินงาน</h2>
          </div>
        </div>

        {posts.length ? (
          <ol className="space-y-4">
            {posts.map((p) => (
              <li
                key={p.id}
                className="rounded-xl border border-l-4 border-l-gold bg-card p-5 shadow-sm"
              >
                <h3 className="font-semibold text-foreground">{p.title}</h3>
                {p.posted_at && (
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="size-3.5" aria-hidden />
                    {formatThaiDate(p.posted_at)}
                  </p>
                )}
                {p.body && (
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                    {p.body}
                  </p>
                )}
                {p.attachment_url && (
                  <a
                    href={p.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                  >
                    <Paperclip className="size-4" aria-hidden /> ไฟล์แนบ
                  </a>
                )}
              </li>
            ))}
          </ol>
        ) : (
          <EmptyState
            title="ยังไม่มีรายการของงานนี้"
            description="เมื่อผู้รับผิดชอบลงงานหรืออัปเดตความคืบหน้าแล้ว จะแสดงที่นี่"
          />
        )}
      </div>
    </>
  );
}
