"use client";

import { useState } from "react";
import Image from "next/image";
import { FileText, Loader2, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { formatFileSize } from "@/lib/format";
import type { UnitPostFile } from "@/types/database";

const MAX_FILES = 20;
const MAX_SIZE = 20 * 1024 * 1024; // 20MB ต่อไฟล์ เท่ากับกฎของเมนูเอกสาร

export function isImage(type: string, url = "") {
  return type.startsWith("image/") || /\.(png|jpe?g|webp|gif|avif)$/i.test(url);
}

/**
 * อัปโหลดได้หลายไฟล์ต่อหนึ่งรายการ รองรับทั้งรูปและเอกสาร
 * เก็บผลเป็น array ของ {url, name, type, size} ส่งกลับผ่าน onChange
 */
export function MultiUploader({
  bucket,
  value,
  onChange,
}: {
  bucket: string;
  value: UnitPostFile[];
  onChange: (files: UnitPostFile[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  async function uploadAll(files: File[]) {
    if (!files.length) return;
    if (value.length + files.length > MAX_FILES) {
      toast.error(`แนบได้สูงสุด ${MAX_FILES} ไฟล์ต่อหนึ่งรายการ`);
      return;
    }

    setUploading(true);
    const supabase = createClient();
    const added: UnitPostFile[] = [];

    for (const file of files) {
      if (file.size > MAX_SIZE) {
        toast.error(`${file.name} ใหญ่เกิน 20MB`);
        continue;
      }
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) {
        toast.error(`${file.name} อัปโหลดไม่สำเร็จ: ${error.message}`);
        continue;
      }
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      added.push({ url: data.publicUrl, name: file.name, type: file.type, size: file.size });
    }

    setUploading(false);
    if (added.length) {
      onChange([...value, ...added]);
      toast.success(`อัปโหลดสำเร็จ ${added.length} ไฟล์`);
    }
  }

  return (
    <div className="space-y-3">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          if (!uploading) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (!uploading) void uploadAll([...e.dataTransfer.files]);
        }}
        className={cn(
          "flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-muted/20 px-4 py-6 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent/40",
          dragOver && "border-primary bg-accent/60",
          uploading && "cursor-not-allowed opacity-70",
        )}
      >
        {uploading ? (
          <>
            <Loader2 className="size-6 animate-spin text-primary" aria-hidden />
            กำลังอัปโหลด...
          </>
        ) : (
          <>
            <UploadCloud className="size-6 text-primary" aria-hidden />
            <span className="font-medium text-foreground">
              คลิกเพื่อเลือกไฟล์ หรือลากมาวาง (เลือกทีละหลายไฟล์ได้)
            </span>
            <span className="text-xs">รูปภาพหรือเอกสาร ไม่เกิน 20MB ต่อไฟล์</span>
          </>
        )}
        <input
          type="file"
          multiple
          disabled={uploading}
          onChange={(e) => {
            void uploadAll([...(e.target.files ?? [])]);
            e.target.value = "";
          }}
          className="sr-only"
        />
      </label>

      {value.length > 0 && (
        <ul className="grid gap-2 sm:grid-cols-2">
          {value.map((f, i) => (
            <li
              key={f.url}
              className="flex items-center gap-3 rounded-lg border bg-muted/20 p-2"
            >
              <span className="relative size-12 shrink-0 overflow-hidden rounded-md border bg-background">
                {isImage(f.type, f.url) ? (
                  <Image src={f.url} alt="" fill sizes="48px" className="object-cover" />
                ) : (
                  <span className="grid size-full place-items-center text-muted-foreground">
                    <FileText className="size-5" aria-hidden />
                  </span>
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-foreground">{f.name || "ไฟล์แนบ"}</span>
                <span className="block text-xs text-muted-foreground">
                  {f.size ? formatFileSize(f.size) : ""}
                </span>
              </span>
              <button
                type="button"
                aria-label={`ลบ ${f.name}`}
                onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
