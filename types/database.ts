import type { Role } from "@/lib/permissions";

export type NewsStatus = "draft" | "published" | "archived";
export type ServiceStatus = "active" | "maintenance" | "inactive";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface CategoryWithCount extends Category {
  usage_count: number;
}

export interface News {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  category_id: string | null;
  status: NewsStatus;
  is_featured: boolean;
  published_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // joined
  category?: Category | null;
}

export interface DocumentItem {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_name: string | null;
  file_type: string | null;
  file_size: number | null;
  category_id: string | null;
  download_count: number;
  is_published: boolean;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
  category?: Category | null;
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  url: string;
  category_id: string | null;
  status: ServiceStatus;
  sort_order: number;
  is_external: boolean;
  created_at: string;
  updated_at: string;
  category?: Category | null;
}

export interface GalleryAlbum {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  event_date: string | null;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  images?: GalleryImage[];
  image_count?: number;
}

export interface GalleryImage {
  id: string;
  album_id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
}

export interface Staff {
  id: string;
  full_name: string;
  position: string;
  department: string | null;
  responsibility: string | null;
  phone: string | null;
  email: string | null;
  image_url: string | null;
  image_position_x?: number | null;
  image_position_y?: number | null;
  image_zoom?: number | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SiteSettings {
  id: string;
  site_name: string;
  school_name: string | null;
  logo_url: string | null;
  banner_image_url: string | null;
  primary_color: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  facebook_url: string | null;
  line_url: string | null;
  youtube_url: string | null;
  map_embed_url: string | null;
  office_hours: string | null;
  vision: string | null;
  /** หลายบรรทัด หนึ่งบรรทัด = พันธกิจหนึ่งข้อ */
  mission: string | null;
  updated_by: string | null;
  updated_at: string;
}

export interface AuditSummary {
  id: string;
  user_id: string | null;
  action: "INSERT" | "UPDATE" | "DELETE" | string;
  table_name: string | null;
  record_id: string | null;
  created_at: string;
  actor_full_name: string | null;
  actor_email: string | null;
}

export interface AuditLog extends AuditSummary {
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
}

export interface AnalyticsDaily {
  date: string;
  path: string;
  page_views: number;
}

export type UnitPostStatus = "draft" | "published";

/** โพสต์งานของแต่ละงานในฝ่าย — แยกจากข่าวประชาสัมพันธ์ */
/** ไฟล์แนบหนึ่งชิ้นในโพสต์งาน */
export interface UnitPostFile {
  url: string;
  name: string;
  /** MIME type เช่น image/png — ใช้ตัดสินว่าจะโชว์เป็นรูปหรือเป็นลิงก์ดาวน์โหลด */
  type: string;
  size: number;
}

export interface UnitPost {
  id: string;
  /** ตรงกับ slug ใน lib/units.ts */
  unit_slug: string;
  title: string;
  body: string;
  /** เลิกใช้แล้ว เก็บไว้เพื่อความเข้ากันได้ย้อนหลัง ใช้ attachments แทน */
  attachment_url: string | null;
  attachments: UnitPostFile[];
  status: UnitPostStatus;
  posted_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type UnitRole = "head" | "assistant";

/** ผูกบุคลากรเข้ากับงานในฝ่าย พร้อมบทบาท */
export interface UnitStaff {
  id: string;
  unit_slug: string;
  staff_id: string;
  role: UnitRole;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/** แถว unit_staff ที่ join ข้อมูลบุคลากรมาด้วย (ใช้บนหน้าเว็บ) */
export interface UnitStaffWithPerson extends UnitStaff {
  staff: Staff | null;
}
