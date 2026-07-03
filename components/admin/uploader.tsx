"use client";

import { useState } from "react";
import Image from "next/image";
import { FileCheck2, Loader2, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { UPLOAD_RULES } from "@/lib/constants";
import { cn } from "@/lib/utils";

type UploadKind = "image" | "document";

export function Uploader({
  bucket,
  kind = "image",
  value,
  onChange,
  onMeta,
}: {
  bucket: string;
  kind?: UploadKind;
  value?: string;
  onChange: (url: string) => void;
  onMeta?: (meta: { name: string; type: string; size: number }) => void;
}) {
  const rules = UPLOAD_RULES[kind];
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    if (!(rules.accept as readonly string[]).includes(file.type)) {
      toast.error(`ชนิดไฟล์ไม่รองรับ (${rules.label})`);
      return;
    }
    if (file.size > rules.maxSize) {
      toast.error(`ไฟล์ใหญ่เกินไป (${rules.label})`);
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) throw error;

      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      onChange(data.publicUrl);
      onMeta?.({ name: file.name, type: file.type, size: file.size });
      toast.success("อัปโหลดสำเร็จ");
    } catch (e) {
      toast.error("อัปโหลดไม่สำเร็จ: " + (e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
    e.target.value = "";
  }

  const fileInput = (
    <input
      type="file"
      accept={rules.accept.join(",")}
      disabled={uploading}
      onChange={onFileChange}
      className="block w-full max-w-md cursor-pointer rounded-md border border-input bg-background text-sm text-muted-foreground file:mr-3 file:cursor-pointer file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-60"
    />
  );

  return (
    <div className="space-y-2">
      {value ? (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/30 p-3">
          {kind === "image" ? (
            <div className="relative size-16 shrink-0 overflow-hidden rounded-md border bg-background">
              <Image src={value} alt="ตัวอย่าง" fill sizes="64px" className="object-cover" />
            </div>
          ) : (
            <FileCheck2 className="size-8 shrink-0 text-emerald-600" aria-hidden />
          )}
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="min-w-0 flex-1 truncate text-sm text-primary hover:underline"
          >
            {value}
          </a>
          <Button type="button" variant="ghost" size="icon" onClick={() => onChange("")} aria-label="ลบไฟล์">
            <X className="size-4" />
          </Button>
          <div className="basis-full">{fileInput}</div>
        </div>
      ) : (
        <div
          className={cn(
            "flex w-full flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed bg-muted/20 px-4 py-8 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent/40",
            uploading && "opacity-70",
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="size-6 animate-spin text-primary" aria-hidden />
              กำลังอัปโหลด...
            </>
          ) : (
            <>
              <UploadCloud className="size-7 text-primary" aria-hidden />
              <span className="font-medium text-foreground">เลือกไฟล์เพื่ออัปโหลด</span>
              <span className="text-xs">{rules.label}</span>
              {fileInput}
            </>
          )}
        </div>
      )}
    </div>
  );
}
