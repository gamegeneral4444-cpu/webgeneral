import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, Images } from "lucide-react";
import { PageHero } from "@/components/public/page-hero";
import { GalleryLightbox } from "@/components/public/gallery-lightbox";
import { getAlbumBySlug } from "@/lib/data";
import { formatThaiDate } from "@/lib/format";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const album = await getAlbumBySlug(slug);
  return { title: album?.title ?? "ไม่พบอัลบั้ม" };
}

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const album = await getAlbumBySlug(slug);
  if (!album) notFound();

  return (
    <>
      <PageHero
        title={album.title}
        subtitle={album.description ?? undefined}
        crumbs={[{ label: "ภาพกิจกรรม", href: "/gallery" }, { label: album.title }]}
      />
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-4" aria-hidden /> {formatThaiDate(album.event_date)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Images className="size-4" aria-hidden /> {album.images?.length ?? 0} รูป
          </span>
        </div>
        <GalleryLightbox images={album.images ?? []} />
      </div>
    </>
  );
}
