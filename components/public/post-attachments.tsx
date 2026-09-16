"use client";

import { useState } from "react";
import Image from "next/image";
import { Download, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { formatFileSize } from "@/lib/format";
import type { UnitPostFile } from "@/types/database";

function isImage(f: UnitPostFile) {
  return f.type?.startsWith("image/") || /\.(png|jpe?g|webp|gif|avif)$/i.test(f.url);
}

/**
 * ไฟล์แนบของโพสต์งาน
 * รูปขึ้นเป็นตารางย่อกดขยายได้ ส่วนเอกสารขึ้นเป็นรายการให้กดดาวน์โหลด
 */
export function PostAttachments({ files }: { files: UnitPostFile[] }) {
  const [active, setActive] = useState<UnitPostFile | null>(null);

  if (!files?.length) return null;

  const images = files.filter(isImage);
  const docs = files.filter((f) => !isImage(f));

  return (
    <div className="mt-4 space-y-3">
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((img) => (
            <button
              key={img.url}
              type="button"
              onClick={() => setActive(img)}
              aria-label={`ขยายรูป ${img.name || ""}`}
              className="group relative aspect-square overflow-hidden rounded-lg border bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <Image
                src={img.url}
                alt={img.name || ""}
                fill
                sizes="(min-width: 640px) 160px, 33vw"
                className="object-cover transition-transform duration-200 group-hover:scale-105"
              />
            </button>
          ))}
        </div>
      )}

      {docs.length > 0 && (
        <ul className="space-y-1.5">
          {docs.map((f) => (
            <li key={f.url}>
              <a
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border bg-secondary px-3 py-2 text-sm transition-colors hover:border-primary/30 hover:bg-accent"
              >
                <FileText className="size-4 shrink-0 text-gold-dark" aria-hidden />
                <span className="min-w-0 flex-1 truncate text-foreground">
                  {f.name || "ไฟล์แนบ"}
                </span>
                {f.size > 0 && (
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatFileSize(f.size)}
                  </span>
                )}
                <Download className="size-4 shrink-0 text-primary" aria-hidden />
              </a>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={!!active} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="max-w-3xl p-2">
          <DialogTitle className="sr-only">{active?.name || "รูปภาพ"}</DialogTitle>
          {active && (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted">
              <Image
                src={active.url}
                alt={active.name || ""}
                fill
                sizes="(min-width: 768px) 768px, 100vw"
                className="object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
