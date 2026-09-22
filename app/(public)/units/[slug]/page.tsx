import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { CalendarDays, UserRound } from "lucide-react";
import { PageHero } from "@/components/public/page-hero";
import { EmptyState } from "@/components/public/section";
import { PostAttachments } from "@/components/public/post-attachments";
import { UNITS, findUnit, unitDescription } from "@/lib/units";
import { getUnitPosts, getUnitStaffMap, getUnitDescriptions } from "@/lib/data";
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

  const [posts, staffMap, descriptions] = await Promise.all([
    getUnitPosts({ unitSlug: slug }),
    getUnitStaffMap(),
    getUnitDescriptions(),
  ]);
  const description = unitDescription(unit, descriptions);
  const heads = staffMap[slug]?.head ?? [];
  const assistants = staffMap[slug]?.assistant ?? [];

  return (
    <>
      <PageHero
        title={unit.label}
        subtitle={
          heads.length
            ? `หัวหน้างาน : ${heads.map((h) => h.full_name).join(" · ")}`
            : "ยังไม่ได้ระบุผู้รับผิดชอบ"
        }
        crumbs={[{ label: "กลุ่มงาน", href: "/units" }, { label: unit.label }]}
      />

      <div className="mx-auto max-w-4xl px-4 py-12">
        {description && (
          <section className="mb-10 rounded-xl border border-l-4 border-l-gold bg-card p-5 shadow-sm">
            <h2 className="mb-2 text-lg font-bold text-foreground">หน้าที่และความรับผิดชอบ</h2>
            <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">{description}</p>
          </section>
        )}

        {(heads.length > 0 || assistants.length > 0) && (
          <section className="mb-10">
            <div className="mb-1 h-1 w-12 rounded-full bg-gold" aria-hidden />
            <h2 className="mb-4 text-xl font-bold text-foreground">ผู้รับผิดชอบ</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ...heads.map((p) => ({ person: p, role: "หัวหน้างาน" })),
                ...assistants.map((p) => ({ person: p, role: "ผู้ช่วย" })),
              ].map(({ person, role }) => (
                <div
                  key={`${role}-${person.id}`}
                  className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm"
                >
                  <span className="relative size-12 shrink-0 overflow-hidden rounded-full bg-soft-gold ring-1 ring-gold/30">
                    {person.image_url ? (
                      <Image
                        src={person.image_url}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="grid size-full place-items-center text-gold-dark">
                        <UserRound className="size-6" aria-hidden />
                      </span>
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-foreground">
                      {person.full_name}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {role} · {person.position}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

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
                <PostAttachments files={p.attachments ?? []} />
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
