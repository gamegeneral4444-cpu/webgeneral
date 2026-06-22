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
import { newsSchema, type NewsInput } from "@/lib/validations";

type NewsFormValues = z.input<typeof newsSchema>;
import { makeSlug } from "@/lib/slug";
import { BUCKETS, NEWS_STATUS } from "@/lib/constants";
import { createNews, updateNews } from "@/lib/actions/news";
import type { News, Category } from "@/types/database";

function toFormData(values: NewsFormValues): FormData {
  const fd = new FormData();
  Object.entries(values).forEach(([k, v]) => fd.append(k, v == null ? "" : String(v)));
  return fd;
}

export function NewsForm({
  categories,
  initial,
}: {
  categories: Category[];
  initial?: News;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [cover, setCover] = useState(initial?.cover_image_url ?? "");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<NewsFormValues, unknown, NewsInput>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      title: initial?.title ?? "",
      slug: initial?.slug ?? "",
      excerpt: initial?.excerpt ?? "",
      content: initial?.content ?? "",
      cover_image_url: initial?.cover_image_url ?? "",
      category_id: initial?.category_id ?? "",
      status: initial?.status ?? "draft",
      is_featured: initial?.is_featured ?? false,
      published_at: initial?.published_at ? initial.published_at.slice(0, 10) : "",
    },
  });

  const status = watch("status");
  const isFeatured = watch("is_featured");

  function onSubmit(values: NewsInput) {
    startTransition(async () => {
      const res = initial
        ? await updateNews(initial.id, toFormData(values))
        : await createNews(toFormData(values));
      if (res.ok) {
        toast.success(initial ? "บันทึกการแก้ไขแล้ว" : "เพิ่มข่าวเรียบร้อยแล้ว");
        router.push("/admin/news");
        router.refresh();
      } else {
        toast.error(res.error ?? "เกิดข้อผิดพลาด");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        <div className="space-y-1.5">
          <Label htmlFor="title">หัวข้อข่าว *</Label>
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
          <Input id="slug" {...register("slug")} placeholder="news-slug" />
          {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="excerpt">คำอธิบายสั้น</Label>
          <Textarea id="excerpt" rows={2} {...register("excerpt")} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="content">เนื้อหา *</Label>
          <Textarea id="content" rows={12} {...register("content")} />
          {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
        </div>
      </div>

      <div className="space-y-5">
        <div className="rounded-xl border bg-card p-4">
          <Label className="mb-2 block">รูปหน้าปก</Label>
          <Uploader
            bucket={BUCKETS.newsCovers}
            kind="image"
            value={cover}
            onChange={(url) => {
              setCover(url);
              setValue("cover_image_url", url);
            }}
          />
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

        <div className="space-y-1.5">
          <Label>สถานะ *</Label>
          <Select value={status} onValueChange={(v) => setValue("status", v as NewsInput["status"])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(NEWS_STATUS).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="published_at">วันที่เผยแพร่</Label>
          <Input id="published_at" type="date" {...register("published_at")} />
        </div>

        <div className="flex items-center justify-between rounded-lg border p-3">
          <Label htmlFor="is_featured">ข่าวเด่น</Label>
          <Switch
            id="is_featured"
            checked={isFeatured}
            onCheckedChange={(v) => setValue("is_featured", v)}
          />
        </div>

        <Button type="submit" className="w-full gap-2" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {initial ? "บันทึกการแก้ไข" : "เพิ่มข่าว"}
        </Button>
      </div>
    </form>
  );
}
