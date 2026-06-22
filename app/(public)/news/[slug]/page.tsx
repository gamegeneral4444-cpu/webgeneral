import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { NewsCard } from "@/components/public/news-card";
import { PageHero } from "@/components/public/page-hero";
import { getNewsBySlug, getPublishedNews } from "@/lib/data";
import { formatThaiDate } from "@/lib/format";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const news = await getNewsBySlug(slug);
  if (!news) return { title: "ไม่พบข่าว" };
  return {
    title: news.title,
    description: news.excerpt ?? undefined,
    openGraph: news.cover_image_url ? { images: [news.cover_image_url] } : undefined,
  };
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const news = await getNewsBySlug(slug);
  if (!news) notFound();

  const related = (await getPublishedNews({ limit: 4 })).filter((n) => n.id !== news.id).slice(0, 3);

  return (
    <>
      <PageHero
        title={news.title}
        crumbs={[{ label: "ข่าวประชาสัมพันธ์", href: "/news" }, { label: "รายละเอียดข่าว" }]}
      />

      <article className="mx-auto max-w-3xl px-4 py-10">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          {news.category && <Badge variant="secondary">{news.category.name}</Badge>}
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-4" aria-hidden />
            {formatThaiDate(news.published_at ?? news.created_at)}
          </span>
        </div>

        {news.cover_image_url && (
          <div className="relative mt-5 aspect-[16/9] w-full overflow-hidden rounded-2xl border bg-muted">
            <Image
              src={news.cover_image_url}
              alt={news.title}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="prose prose-slate mt-7 max-w-none whitespace-pre-line leading-relaxed text-foreground">
          {news.content}
        </div>

        <div className="mt-10">
          <Link href="/news" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
            <ArrowLeft className="size-4" aria-hidden /> กลับไปหน้าข่าวทั้งหมด
          </Link>
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t bg-muted/40 py-12">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-1 h-1 w-12 rounded-full bg-gold" aria-hidden />
            <h2 className="mb-6 text-2xl font-bold text-foreground">ข่าวที่เกี่ยวข้อง</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((n) => (
                <NewsCard key={n.id} news={n} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
