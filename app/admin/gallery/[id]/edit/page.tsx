import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AlbumForm } from "../../album-form";
import { ImageManager } from "../../image-manager";
import { adminGetAlbum } from "@/lib/admin-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "จัดการอัลบั้ม" };

export default async function EditAlbumPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const album = await adminGetAlbum(id);
  if (!album) notFound();

  const images = (album.images ?? []).sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="space-y-8">
      <div>
        <AdminPageHeader title="จัดการอัลบั้ม" description={album.title} />
        <AlbumForm initial={album} />
      </div>

      <div>
        <div className="mb-1 h-1 w-12 rounded-full bg-gold" aria-hidden />
        <h2 className="mb-4 text-lg font-bold text-foreground">รูปภาพในอัลบั้ม ({images.length})</h2>
        <ImageManager albumId={album.id} images={images} />
      </div>
    </div>
  );
}
