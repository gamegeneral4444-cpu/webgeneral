import { z } from "zod";
import { extractMapEmbedSrc, isValidMapEmbedUrl } from "@/lib/map-embed";

/** ช่อง Google Map: วาง <iframe> ทั้งก้อนก็ได้ (ดึง src ให้) แล้วตรวจว่าเป็น embed URL จริง */
const mapEmbedUrl = z
  .string()
  .transform((v) => extractMapEmbedSrc(v))
  .refine((v) => v === "" || isValidMapEmbedUrl(v), {
    message:
      "ต้องเป็น Embed URL ของ Google Maps (เปิด Google Maps → แชร์ → ฝังแผนที่) วางโค้ด <iframe> ทั้งก้อนได้เลย — อย่าใช้ลิงก์แชร์ maps.app.goo.gl",
  });

/** URL ที่ต้องขึ้นต้นด้วย http:// หรือ https:// เท่านั้น (กัน javascript:/data: ใน href) */
const httpUrl = z
  .string()
  .url("ลิงก์ไม่ถูกต้อง")
  .refine((u) => /^https?:\/\//i.test(u), { message: "ลิงก์ต้องขึ้นต้นด้วย http:// หรือ https://" });

const slug = z
  .string()
  .min(1, "กรุณากรอก slug")
  .regex(/^[a-z0-9ก-๙]+(?:-[a-z0-9ก-๙]+)*$/, "slug ต้องเป็นตัวพิมพ์เล็ก ตัวเลข หรือไทย คั่นด้วย -");

export const loginSchema = z.object({
  email: z.string().email("อีเมลไม่ถูกต้อง"),
  password: z.string().min(6, "รหัสผ่านอย่างน้อย 6 ตัวอักษร"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const newsSchema = z.object({
  title: z.string().min(1, "กรุณากรอกหัวข้อข่าว").max(255),
  slug,
  excerpt: z.string().max(500).optional().or(z.literal("")),
  content: z.string().min(1, "กรุณากรอกเนื้อหาข่าว"),
  cover_image_url: z.string().url("ลิงก์รูปไม่ถูกต้อง").optional().or(z.literal("")),
  category_id: z.string().uuid().optional().or(z.literal("")),
  status: z.enum(["draft", "published", "archived"]),
  is_featured: z.boolean().default(false),
  published_at: z.string().optional().or(z.literal("")),
});
export type NewsInput = z.infer<typeof newsSchema>;

export const documentSchema = z.object({
  title: z.string().min(1, "กรุณากรอกชื่อเอกสาร").max(255),
  description: z.string().max(1000).optional().or(z.literal("")),
  file_url: z.string().url("กรุณาอัปโหลดไฟล์ หรือกรอกลิงก์ไฟล์"),
  file_name: z.string().optional().or(z.literal("")),
  file_type: z.string().optional().or(z.literal("")),
  file_size: z.coerce.number().int().nonnegative().optional(),
  category_id: z.string().uuid().optional().or(z.literal("")),
  is_published: z.boolean().default(true),
});
export type DocumentInput = z.infer<typeof documentSchema>;

export const serviceSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อบริการ").max(255),
  description: z.string().max(1000).optional().or(z.literal("")),
  icon: z.string().optional().or(z.literal("")),
  url: z.string().min(1, "กรุณากรอกลิงก์บริการ"),
  category_id: z.string().uuid().optional().or(z.literal("")),
  status: z.enum(["active", "maintenance", "inactive"]),
  sort_order: z.coerce.number().int().default(0),
  is_external: z.boolean().default(true),
});
export type ServiceInput = z.infer<typeof serviceSchema>;

export const staffSchema = z.object({
  full_name: z.string().min(1, "กรุณากรอกชื่อ-นามสกุล").max(255),
  position: z.string().min(1, "กรุณากรอกตำแหน่ง").max(255),
  department: z.string().max(255).optional().or(z.literal("")),
  responsibility: z.string().max(1000).optional().or(z.literal("")),
  phone: z.string().max(50).optional().or(z.literal("")),
  email: z.string().email("อีเมลไม่ถูกต้อง").optional().or(z.literal("")),
  image_url: z.string().url().optional().or(z.literal("")),
  image_position_x: z.coerce.number().int().min(0).max(100).default(50),
  image_position_y: z.coerce.number().int().min(0).max(100).default(50),
  image_zoom: z.coerce.number().min(1).max(2).default(1),
  sort_order: z.coerce.number().int().default(0),
  is_active: z.boolean().default(true),
});
export type StaffInput = z.infer<typeof staffSchema>;

export const galleryAlbumSchema = z.object({
  title: z.string().min(1, "กรุณากรอกชื่ออัลบั้ม").max(255),
  slug,
  description: z.string().max(1000).optional().or(z.literal("")),
  cover_image_url: z.string().url().optional().or(z.literal("")),
  event_date: z.string().optional().or(z.literal("")),
  is_published: z.boolean().default(true),
});
export type GalleryAlbumInput = z.infer<typeof galleryAlbumSchema>;

export const categorySchema = z.object({
  name: z.string().trim().min(1, "กรุณากรอกชื่อหมวดหมู่").max(120),
  slug,
  description: z.string().max(500).optional().or(z.literal("")),
  sort_order: z.coerce.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const settingsSchema = z.object({
  site_name: z.string().min(1, "กรุณากรอกชื่อเว็บไซต์"),
  school_name: z.string().optional().or(z.literal("")),
  logo_url: z.string().url().optional().or(z.literal("")),
  banner_image_url: z.string().url().optional().or(z.literal("")),
  primary_color: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  email: z.string().email("อีเมลไม่ถูกต้อง").optional().or(z.literal("")),
  facebook_url: httpUrl.optional().or(z.literal("")),
  // LINE: ยืดหยุ่น — ใส่ลิงก์ (คลิกได้) หรือ LINE ID เช่น @school (แสดงเป็นข้อความ)
  line_url: z.string().trim().max(255).optional().or(z.literal("")),
  youtube_url: httpUrl.optional().or(z.literal("")),
  map_embed_url: mapEmbedUrl,
  office_hours: z.string().optional().or(z.literal("")),
});
export type SettingsInput = z.infer<typeof settingsSchema>;
