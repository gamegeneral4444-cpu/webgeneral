"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { GalleryImage } from "@/types/database";

export function GalleryLightbox({ images }: { images: GalleryImage[] }) {
  const [active, setActive] = useState<GalleryImage | null>(null);

  if (!images.length) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/30 p-10 text-center text-muted-foreground">
        ยังไม่มีรูปในอัลบั้มนี้
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((img) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setActive(img)}
            className="group relative aspect-square overflow-hidden rounded-lg border bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <Image
              src={img.image_url}
              alt={img.caption ?? "ภาพกิจกรรม"}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-3xl overflow-hidden p-0">
          <DialogTitle className="sr-only">{active?.caption ?? "ภาพกิจกรรม"}</DialogTitle>
          {active && (
            <div className="relative aspect-video w-full bg-black">
              <Image
                src={active.image_url}
                alt={active.caption ?? "ภาพกิจกรรม"}
                fill
                sizes="(max-width: 1024px) 100vw, 768px"
                className="object-contain"
              />
            </div>
          )}
          {active?.caption && (
            <p className="p-4 text-center text-sm text-muted-foreground">{active.caption}</p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
