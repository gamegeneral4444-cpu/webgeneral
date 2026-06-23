"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Loader2, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Uploader } from "@/components/admin/uploader";
import { BUCKETS } from "@/lib/constants";
import { addGalleryImage, deleteGalleryImage, reorderGalleryImages, updateGalleryImage } from "@/lib/actions/gallery";
import type { GalleryImage } from "@/types/database";

export function ImageManager({ albumId, images }: { albumId: string; images: GalleryImage[] }) {
  const [pending, startTransition] = useTransition();
  const [ordered, setOrdered] = useState(() => [...images].sort((a, b) => a.sort_order - b.sort_order));
  const [captions, setCaptions] = useState(() => Object.fromEntries(images.map((image) => [image.id, image.caption ?? ""])));
  const [uploadKey, setUploadKey] = useState(0);

  function handleAdd(url: string) {
    if (!url) return;
    startTransition(async () => {
      const result = await addGalleryImage(albumId, url);
      if (result.ok) { toast.success("เพิ่มรูปแล้ว"); setUploadKey((key) => key + 1); }
      else toast.error(result.error ?? "เกิดข้อผิดพลาด");
    });
  }

  function saveCaption(imageId: string) {
    startTransition(async () => {
      const result = await updateGalleryImage(imageId, albumId, captions[imageId] ?? "");
      result.ok ? toast.success("บันทึกคำบรรยายแล้ว") : toast.error(result.error ?? "เกิดข้อผิดพลาด");
    });
  }

  function move(index: number, direction: -1 | 1) {
    const destination = index + direction;
    if (destination < 0 || destination >= ordered.length) return;
    const next = [...ordered];
    [next[index], next[destination]] = [next[destination], next[index]];
    setOrdered(next);
    startTransition(async () => {
      const result = await reorderGalleryImages(albumId, next.map((image) => image.id));
      if (result.ok) toast.success("เปลี่ยนลำดับรูปแล้ว");
      else { setOrdered(ordered); toast.error(result.error ?? "เกิดข้อผิดพลาด"); }
    });
  }

  function remove(imageId: string) {
    if (!window.confirm("ยืนยันการลบรูปนี้")) return;
    startTransition(async () => {
      const result = await deleteGalleryImage(imageId);
      if (result.ok) { setOrdered((current) => current.filter((image) => image.id !== imageId)); toast.success("ลบรูปแล้ว"); }
      else toast.error(result.error ?? "เกิดข้อผิดพลาด");
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--admin-border)] bg-white p-4">
        <p className="mb-2 text-sm font-medium text-[var(--admin-ink)]">เพิ่มรูปเข้าอัลบั้ม</p>
        <Uploader key={uploadKey} bucket={BUCKETS.galleryImages} kind="image" value="" onChange={handleAdd} />
        {pending && <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground"><Loader2 className="size-3.5 animate-spin" /> กำลังบันทึก...</p>}
      </div>

      {ordered.length ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {ordered.map((image, index) => (
            <article key={image.id} className="overflow-hidden rounded-xl border border-[var(--admin-border)] bg-white shadow-sm">
              <div className="relative aspect-video bg-muted"><Image src={image.image_url} alt={captions[image.id] || `รูปที่ ${index + 1}`} fill sizes="400px" className="object-cover" /></div>
              <div className="space-y-3 p-3">
                <label className="block text-xs font-medium text-slate-600">คำบรรยายรูป
                  <Input value={captions[image.id] ?? ""} onChange={(event) => setCaptions((current) => ({ ...current, [image.id]: event.target.value }))} maxLength={500} className="mt-1" />
                </label>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => saveCaption(image.id)} disabled={pending}><Save className="size-4" /> บันทึก</Button>
                  <Button type="button" size="icon-sm" variant="outline" aria-label="เลื่อนรูปไปก่อนหน้า" onClick={() => move(index, -1)} disabled={pending || index === 0}><ChevronLeft className="size-4" /></Button>
                  <Button type="button" size="icon-sm" variant="outline" aria-label="เลื่อนรูปไปถัดไป" onClick={() => move(index, 1)} disabled={pending || index === ordered.length - 1}><ChevronRight className="size-4" /></Button>
                  <Button type="button" size="icon-sm" variant="outline" aria-label="ลบรูป" onClick={() => remove(image.id)} disabled={pending} className="ml-auto text-destructive"><Trash2 className="size-4" /></Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : <p className="rounded-lg border border-dashed bg-muted/30 p-8 text-center text-sm text-muted-foreground">ยังไม่มีรูปในอัลบั้มนี้</p>}
    </div>
  );
}
