"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Uploader } from "@/components/admin/uploader";
import { BUCKETS } from "@/lib/constants";
import { addGalleryImage, deleteGalleryImage } from "@/lib/actions/gallery";
import type { GalleryImage } from "@/types/database";

export function ImageManager({
  albumId,
  images,
}: {
  albumId: string;
  images: GalleryImage[];
}) {
  const [pending, startTransition] = useTransition();
  const [uploadKey, setUploadKey] = useState(0);

  function handleAdd(url: string) {
    if (!url) return;
    startTransition(async () => {
      const res = await addGalleryImage(albumId, url);
      if (res.ok) {
        toast.success("เพิ่มรูปแล้ว");
        setUploadKey((k) => k + 1); // reset uploader
      } else toast.error(res.error ?? "เกิดข้อผิดพลาด");
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const res = await deleteGalleryImage(id);
      if (res.ok) toast.success("ลบรูปแล้ว");
      else toast.error(res.error ?? "เกิดข้อผิดพลาด");
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-4">
        <p className="mb-2 text-sm font-medium text-foreground">เพิ่มรูปเข้าอัลบั้ม</p>
        <Uploader key={uploadKey} bucket={BUCKETS.galleryImages} kind="image" value="" onChange={handleAdd} />
        {pending && (
          <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" /> กำลังบันทึก...
          </p>
        )}
      </div>

      {images.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((img) => (
            <div key={img.id} className="group relative aspect-square overflow-hidden rounded-lg border bg-muted">
              <Image src={img.image_url} alt={img.caption ?? "รูป"} fill sizes="200px" className="object-cover" />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => handleDelete(img.id)}
                className="absolute right-2 top-2 size-8 opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="ลบรูป"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed bg-muted/30 p-8 text-center text-sm text-muted-foreground">
          ยังไม่มีรูปในอัลบั้มนี้
        </p>
      )}
    </div>
  );
}
