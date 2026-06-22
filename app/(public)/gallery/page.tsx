import type { Metadata } from "next";
import { GalleryCard } from "@/components/public/gallery-card";
import { EmptyState } from "@/components/public/section";
import { PageHero } from "@/components/public/page-hero";
import { getAlbums } from "@/lib/data";

export const metadata: Metadata = { title: "ภาพกิจกรรม" };
export const revalidate = 60;

export default async function GalleryPage() {
  const albums = await getAlbums();
  return (
    <>
      <PageHero
        title="ภาพกิจกรรม"
        subtitle="รวมภาพบรรยากาศกิจกรรมต่าง ๆ ของกลุ่มบริหารงานทั่วไป"
        crumbs={[{ label: "ภาพกิจกรรม" }]}
      />
      <div className="mx-auto max-w-7xl px-4 py-10">
        {albums.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {albums.map((a) => (
              <GalleryCard key={a.id} album={a} />
            ))}
          </div>
        ) : (
          <EmptyState title="ยังไม่มีอัลบั้มภาพกิจกรรม" />
        )}
      </div>
    </>
  );
}
