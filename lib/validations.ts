import { z } from "zod";

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

export const settingsSchema = z.object({
  site_name: z.string().min(1, "กรุณากรอกชื่อเว็บไซต์"),
  school_name: z.string().optional().or(z.literal("")),
  logo_url: z.string().url().optional().or(z.literal("")),
  primary_color: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  email: z.string().email("อีเมลไม่ถูกต้อง").optional().or(z.literal("")),
  facebook_url: z.string().url().optional().or(z.literal("")),
  map_embed_url: z.string().optional().or(z.literal("")),
  office_hours: z.string().optional().or(z.literal("")),
});
export type SettingsInput = z.infer<typeof settingsSchema>;
