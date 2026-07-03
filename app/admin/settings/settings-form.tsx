"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Uploader } from "@/components/admin/uploader";
import { settingsSchema, type SettingsInput } from "@/lib/validations";
import { BUCKETS } from "@/lib/constants";
import { updateSettings } from "@/lib/actions/settings";
import {
  decorateBannerImageUrl,
  getBannerImageCrop,
  stripBannerImageCrop,
} from "@/lib/banner-image";
import type { SiteSettings } from "@/types/database";

function toFormData(v: SettingsInput): FormData {
  const fd = new FormData();
  Object.entries(v).forEach(([k, val]) => fd.append(k, val == null ? "" : String(val)));
  return fd;
}

export function SettingsForm({ initial }: { initial: SiteSettings | null }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [logo, setLogo] = useState(initial?.logo_url ?? "");
  const initialBannerCrop = getBannerImageCrop(initial?.banner_image_url);
  const [banner, setBanner] = useState(stripBannerImageCrop(initial?.banner_image_url));
  const [bannerX, setBannerX] = useState(initialBannerCrop.x);
  const [bannerY, setBannerY] = useState(initialBannerCrop.y);
  const [bannerZoom, setBannerZoom] = useState(initialBannerCrop.zoom);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      site_name: initial?.site_name ?? "กลุ่มบริหารงานทั่วไป",
      school_name: initial?.school_name ?? "",
      logo_url: initial?.logo_url ?? "",
      banner_image_url: initial?.banner_image_url ?? "",
      primary_color: initial?.primary_color ?? "#b45309",
      address: initial?.address ?? "",
      phone: initial?.phone ?? "",
      email: initial?.email ?? "",
      facebook_url: initial?.facebook_url ?? "",
      line_url: initial?.line_url ?? "",
      youtube_url: initial?.youtube_url ?? "",
      map_embed_url: initial?.map_embed_url ?? "",
      office_hours: initial?.office_hours ?? "",
    },
  });

  function onSubmit(values: SettingsInput) {
    startTransition(async () => {
      const payload = {
        ...values,
        banner_image_url: decorateBannerImageUrl(banner || values.banner_image_url || "", {
          x: bannerX,
          y: bannerY,
          zoom: bannerZoom,
        }),
      };
      const res = await updateSettings(toFormData(payload));
      if (res.ok) {
        toast.success("บันทึกการตั้งค่าแล้ว");
        router.refresh();
      } else {
        toast.error(res.error ?? "เกิดข้อผิดพลาด");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid max-w-3xl gap-6">
      <section className="rounded-xl border bg-card p-5">
        <h2 className="mb-4 font-semibold text-foreground">ข้อมูลทั่วไป</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="site_name">ชื่อเว็บไซต์ *</Label>
            <Input id="site_name" {...register("site_name")} />
            {errors.site_name && <p className="text-sm text-destructive">{errors.site_name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="school_name">ชื่อโรงเรียน</Label>
            <Input id="school_name" {...register("school_name")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="primary_color">สีหลัก</Label>
            <Input id="primary_color" {...register("primary_color")} placeholder="#b45309" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="office_hours">เวลาทำการ</Label>
            <Input id="office_hours" {...register("office_hours")} />
          </div>
        </div>
        <div className="mt-5">
          <Label className="mb-2 block">โลโก้</Label>
          <Uploader
            bucket={BUCKETS.siteAssets}
            kind="image"
            value={logo}
            onChange={(url) => {
              setLogo(url);
              setValue("logo_url", url);
            }}
          />
        </div>
        <div className="mt-5">
          <Label className="mb-2 block">แบนเนอร์หน้าแรก</Label>
          <Uploader
            bucket={BUCKETS.siteAssets}
            kind="image"
            value={banner}
            onChange={(url) => {
              const src = stripBannerImageCrop(url);
              setBanner(src);
              setValue("banner_image_url", src);
            }}
          />
          {banner && (
            <div className="mt-4 grid gap-4 rounded-lg border bg-muted/20 p-4">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg border bg-background">
                <Image
                  src={banner}
                  alt="ตัวอย่างตำแหน่งแบนเนอร์"
                  fill
                  sizes="(min-width: 768px) 640px, 100vw"
                  className="object-cover"
                  style={{
                    objectPosition: `${bannerX}% ${bannerY}%`,
                    transform: `scale(${bannerZoom})`,
                    transformOrigin: `${bannerX}% ${bannerY}%`,
                  }}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="banner_position_x">ขยับซ้าย-ขวา</Label>
                  <Input
                    id="banner_position_x"
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={bannerX}
                    onChange={(e) => setBannerX(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="banner_position_y">ขยับขึ้น-ลง</Label>
                  <Input
                    id="banner_position_y"
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={bannerY}
                    onChange={(e) => setBannerY(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="banner_zoom">ซูมแบนเนอร์</Label>
                  <Input
                    id="banner_zoom"
                    type="range"
                    min="1"
                    max="2"
                    step="0.05"
                    value={bannerZoom}
                    onChange={(e) => setBannerZoom(Number(e.target.value))}
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-fit"
                onClick={() => {
                  setBannerX(50);
                  setBannerY(50);
                  setBannerZoom(1);
                }}
              >
                รีเซ็ตตำแหน่ง
              </Button>
            </div>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            แนะนำภาพแนวนอน สัดส่วนประมาณ 4:3 หรือ 16:9 สำหรับแสดงในส่วนบนของหน้าแรก
          </p>
        </div>
      </section>

      <section className="rounded-xl border bg-card p-5">
        <h2 className="mb-4 font-semibold text-foreground">ข้อมูลติดต่อ</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="address">ที่อยู่</Label>
            <Textarea id="address" rows={2} {...register("address")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">เบอร์โทร</Label>
            <Input id="phone" {...register("phone")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">อีเมล</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="facebook_url">Facebook URL</Label>
            <Input id="facebook_url" {...register("facebook_url")} placeholder="https://facebook.com/..." />
            {errors.facebook_url && <p className="text-sm text-destructive">{errors.facebook_url.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="line_url">LINE</Label>
            <Input id="line_url" {...register("line_url")} placeholder="https://lin.ee/xxxx หรือ @yourschool" />
            {errors.line_url ? (
              <p className="text-sm text-destructive">{errors.line_url.message}</p>
            ) : (
              <p className="text-xs text-muted-foreground">ใส่ลิงก์เพิ่มเพื่อน (คลิกได้) หรือ LINE ID เช่น @yourschool</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="youtube_url">YouTube URL</Label>
            <Input id="youtube_url" {...register("youtube_url")} placeholder="https://youtube.com/@yourchannel" />
            {errors.youtube_url && <p className="text-sm text-destructive">{errors.youtube_url.message}</p>}
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="map_embed_url">Google Map Embed URL</Label>
            <Input id="map_embed_url" {...register("map_embed_url")} placeholder="วางโค้ด <iframe> หรือลิงก์ embed จาก Google Maps" />
            {errors.map_embed_url ? (
              <p className="text-sm text-destructive">{errors.map_embed_url.message}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                เปิด Google Maps → <b>แชร์</b> → <b>ฝังแผนที่</b> → คัดลอก HTML แล้ววางทั้งก้อนได้เลย (อย่าใช้ลิงก์แชร์ maps.app.goo.gl)
              </p>
            )}
          </div>
        </div>
      </section>

      <Button type="submit" className="w-fit gap-2" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
        บันทึกการตั้งค่า
      </Button>
    </form>
  );
}
