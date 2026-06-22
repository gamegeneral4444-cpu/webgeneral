import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DocumentCard } from "@/components/public/document-card";
import { EmptyState } from "@/components/public/section";
import { PageHero } from "@/components/public/page-hero";
import { getDocuments, getDocumentCategories } from "@/lib/data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "ดาวน์โหลดเอกสาร" };
export const revalidate = 60;

export default async function DownloadsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string }>;
}) {
  const { q, cat } = await searchParams;
  const [documents, categories] = await Promise.all([
    getDocuments({ search: q, categorySlug: cat }),
    getDocumentCategories(),
  ]);

  return (
    <>
      <PageHero
        title="ดาวน์โหลดเอกสาร"
        subtitle="แบบฟอร์ม คำสั่ง ระเบียบ คู่มือ และหนังสือราชการ"
        crumbs={[{ label: "ดาวน์โหลด" }]}
      />

      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <form action="/downloads" className="flex w-full max-w-md gap-2">
            {cat && <input type="hidden" name="cat" value={cat} />}
            <Input name="q" defaultValue={q} placeholder="ค้นหาเอกสาร..." className="bg-card" />
            <Button type="submit" className="gap-2">
              <Search className="size-4" aria-hidden /> ค้นหา
            </Button>
          </form>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/downloads"
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
                href={`/downloads?cat=${c.slug}`}
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

        {documents.length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {documents.map((d) => (
              <DocumentCard key={d.id} doc={d} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={q ? `ไม่พบเอกสารที่ตรงกับ "${q}"` : "ยังไม่มีเอกสาร"}
            description="ลองเปลี่ยนคำค้นหรือหมวดหมู่"
          />
        )}
      </div>
    </>
  );
}
