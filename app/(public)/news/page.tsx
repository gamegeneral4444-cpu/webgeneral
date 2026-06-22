import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NewsCard } from "@/components/public/news-card";
import { EmptyState } from "@/components/public/section";
import { PageHero } from "@/components/public/page-hero";
import { getPublishedNews, getNewsCategories } from "@/lib/data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "ข่าวประชาสัมพันธ์" };
export const revalidate = 60;

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string }>;
}) {
  const { q, cat } = await searchParams;
  const [news, categories] = await Promise.all([
    getPublishedNews({ search: q, categorySlug: cat }),
    getNewsCategories(),
  ]);

  return (
    <>
      <PageHero
        title="ข่าวประชาสัมพันธ์"
        subtitle="ข่าวสารและประกาศจากกลุ่มบริหารงานทั่วไป"
        crumbs={[{ label: "ข่าวประชาสัมพันธ์" }]}
      />

      <div className="mx-auto max-w-7xl px-4 py-10">
        {/* ค้นหา + กรอง */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <form action="/news" className="flex w-full max-w-md gap-2">
            {cat && <input type="hidden" name="cat" value={cat} />}
            <Input name="q" defaultValue={q} placeholder="ค้นหาข่าว..." className="bg-card" />
            <Button type="submit" className="gap-2">
              <Search className="size-4" aria-hidden /> ค้นหา
            </Button>
          </form>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/news"
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm transition-colors",
                !cat ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-accent",
              )}
            >
              ทั้งหมด
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/news?cat=${c.slug}`}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm transition-colors",
                  cat === c.slug
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-card hover:bg-accent",
                )}
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>

        {news.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {news.map((n) => (
              <NewsCard key={n.id} news={n} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={q ? `ไม่พบข่าวที่ตรงกับ "${q}"` : "ยังไม่มีข่าวประชาสัมพันธ์"}
            description="ลองเปลี่ยนคำค้นหรือหมวดหมู่ หรือกลับมาใหม่ภายหลัง"
          />
        )}
      </div>
    </>
  );
}
