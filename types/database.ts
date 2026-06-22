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
  primary_color: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  facebook_url: string | null;
  map_embed_url: string | null;
  office_hours: string | null;
  updated_by: string | null;
  updated_at: string;
}
