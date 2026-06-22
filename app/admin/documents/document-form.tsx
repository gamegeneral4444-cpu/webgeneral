"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Uploader } from "@/components/admin/uploader";
import { documentSchema, type DocumentInput } from "@/lib/validations";
import { BUCKETS } from "@/lib/constants";
import { createDocument, updateDocument } from "@/lib/actions/documents";
import type { DocumentItem, Category } from "@/types/database";

type FormValues = z.input<typeof documentSchema>;

function toFormData(v: FormValues): FormData {
  const fd = new FormData();
  Object.entries(v).forEach(([k, val]) => fd.append(k, val == null ? "" : String(val)));
  return fd;
}

export function DocumentForm({
  categories,
  initial,
}: {
  categories: Category[];
  initial?: DocumentItem;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [fileUrl, setFileUrl] = useState(initial?.file_url ?? "");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues, unknown, DocumentInput>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      title: initial?.title ?? "",
      description: initial?.description ?? "",
      file_url: initial?.file_url ?? "",
      file_name: initial?.file_name ?? "",
      file_type: initial?.file_type ?? "",
      file_size: initial?.file_size ?? 0,
      category_id: initial?.category_id ?? "",
      is_published: initial?.is_published ?? true,
    },
  });

  function onSubmit(values: DocumentInput) {
    if (!values.file_url) {
      toast.error("กรุณาอัปโหลดไฟล์");
      return;
    }
    startTransition(async () => {
      const res = initial
        ? await updateDocument(initial.id, toFormData(values))
        : await createDocument(toFormData(values));
      if (res.ok) {
        toast.success(initial ? "บันทึกแล้ว" : "เพิ่มเอกสารเรียบร้อยแล้ว");
        router.push("/admin/documents");
        router.refresh();
      } else {
        toast.error(res.error ?? "เกิดข้อผิดพลาด");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid max-w-2xl gap-5">
      <div className="space-y-1.5">
        <Label htmlFor="title">ชื่อเอกสาร *</Label>
        <Input id="title" {...register("title")} />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">รายละเอียด</Label>
        <Textarea id="description" rows={3} {...register("description")} />
      </div>

      <div className="rounded-xl border bg-card p-4">
        <Label className="mb-2 block">ไฟล์เอกสาร *</Label>
        <Uploader
          bucket={BUCKETS.documentFiles}
          kind="document"
          value={fileUrl}
          onChange={(url) => {
            setFileUrl(url);
            setValue("file_url", url);
            if (!url) {
              setValue("file_name", "");
              setValue("file_type", "");
              setValue("file_size", 0);
            }
          }}
          onMeta={(m) => {
            setValue("file_name", m.name);
            setValue("file_type", m.type);
            setValue("file_size", m.size);
          }}
        />
        {errors.file_url && <p className="mt-1 text-sm text-destructive">{errors.file_url.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>หมวดหมู่</Label>
        <Select
          value={watch("category_id") || "none"}
          onValueChange={(v) => setValue("category_id", v === "none" ? "" : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="เลือกหมวดหมู่" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">ไม่ระบุ</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between rounded-lg border p-3">
        <Label htmlFor="is_published">เผยแพร่</Label>
        <Switch
          id="is_published"
          checked={watch("is_published")}
          onCheckedChange={(v) => setValue("is_published", v)}
        />
      </div>

      <Button type="submit" className="w-fit gap-2" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
        {initial ? "บันทึกการแก้ไข" : "เพิ่มเอกสาร"}
      </Button>
    </form>
  );
}
