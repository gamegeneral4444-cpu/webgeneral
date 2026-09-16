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
import { Uploader } from "@/components/admin/uploader";
import { galleryAlbumSchema, type GalleryAlbumInput } from "@/lib/validations";
import { makeSlug } from "@/lib/slug";
import { BUCKETS } from "@/lib/constants";
import { createAlbum, updateAlbum } from "@/lib/actions/gallery";
import type { GalleryAlbum } from "@/types/database";

type FormValues = z.input<typeof galleryAlbumSchema>;

function toFormData(v: FormValues): FormData {
  const fd = new FormData();
  Object.entries(v).forEach(([k, val]) => fd.append(k, val == null ? "" : String(val)));
  return fd;
}

export function AlbumForm({ initial }: { initial?: GalleryAlbum }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [cover, setCover] = useState(initial?.cover_image_url ?? "");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues, unknown, GalleryAlbumInput>({
    resolver: zodResolver(galleryAlbumSchema),
    defaultValues: {
      title: initial?.title ?? "",
      slug: initial?.slug ?? "",
      description: initial?.description ?? "",
      cover_image_url: initial?.cover_image_url ?? "",
      event_date: initial?.event_date ? initial.event_date.slice(0, 10) : "",
      is_published: initial?.is_published ?? true,
    },
  });

  function onSubmit(values: GalleryAlbumInput) {
    startTransition(async () => {
      if (initial) {
        const res = await updateAlbum(initial.id, toFormData(values));
        if (res.ok) {
          toast.success("บันทึกแล้ว");
          router.refresh();
        } else toast.error(res.error ?? "เกิดข้อผิดพลาด");
      } else {
        const res = await createAlbum(toFormData(values));
        if (res.ok && res.id) {
          toast.success("สร้างอัลบั้มแล้ว เพิ่มรูปได้เลย");
          router.push(`/admin/gallery/${res.id}/edit`);
          router.refresh();
        } else toast.error(res.error ?? "เกิดข้อผิดพลาด");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid max-w-2xl gap-5">
      <div className="space-y-1.5">
        <Label htmlFor="title">ชื่ออัลบั้ม *</Label>
        <Input
          id="title"
          {...register("title")}
          onBlur={(e) => {
            if (!watch("slug") && e.target.value) setValue("slug", makeSlug(e.target.value));
          }}
        />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="slug">Slug (URL) *</Label>
        <Input id="slug" {...register("slug")} />
        {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">คำอธิบาย</Label>
        <Textarea id="description" rows={2} {...register("description")} />
      </div>

      <div className="rounded-xl border bg-card p-4">
        <Label className="mb-2 block">รูปปกอัลบั้ม</Label>
        <Uploader
          bucket={BUCKETS.galleryImages}
          kind="image"
          value={cover}
          onChange={(url) => {
            setCover(url);
            setValue("cover_image_url", url);
          }}
        />
      </div>

      <div className="grid items-end gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="event_date">วันที่จัดกิจกรรม</Label>
          <Input id="event_date" type="date" {...register("event_date")} />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3">
          <Label htmlFor="is_published">เผยแพร่</Label>
          <Switch
            id="is_published"
            checked={watch("is_published")}
            onCheckedChange={(v) => setValue("is_published", v)}
          />
        </div>
      </div>

      <Button type="submit" className="w-fit gap-2" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
        {initial ? "บันทึกการแก้ไข" : "สร้างอัลบั้ม"}
      </Button>
    </form>
  );
}
