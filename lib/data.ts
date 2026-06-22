import { createClient } from "@/lib/supabase/server";
import type {
  News,
  DocumentItem,
  Service,
  GalleryAlbum,
  GalleryImage,
  Staff,
  SiteSettings,
  Category,
} from "@/types/database";

/**
 * Data-access layer (อ่านข้อมูลฝั่ง public)
 * ทุกฟังก์ชันเขียนแบบ defensive: ถ้าเชื่อม Supabase ไม่ได้ จะคืนค่าว่าง
 * เพื่อให้หน้าเว็บแสดง empty state แทนที่จะ crash ตอน build/runtime
 */

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

export async function getSettings(): Promise<SiteSettings | null> {
  return safe(async () => {
    const supabase = await createClient();
    const { data } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();
    return (data as SiteSettings) ?? null;
  }, null);
}

export async function getPublishedNews(opts?: {
  limit?: number;
  featured?: boolean;
  categorySlug?: string;
  search?: string;
}): Promise<News[]> {
  return safe(async () => {
    const supabase = await createClient();
    let query = supabase
      .from("news")
      .select("*, category:news_categories(*)")
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (opts?.featured) query = query.eq("is_featured", true);
    if (opts?.search) query = query.ilike("title", `%${opts.search}%`);
    if (opts?.limit) query = query.limit(opts.limit);

    const { data } = await query;
    let rows = (data as News[]) ?? [];
    if (opts?.categorySlug) {
      rows = rows.filter((n) => n.category?.slug === opts.categorySlug);
    }
    return rows;
  }, []);
}

export async function getNewsBySlug(slug: string): Promise<News | null> {
  return safe(async () => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("news")
      .select("*, category:news_categories(*)")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    return (data as News) ?? null;
  }, null);
}

export async function getNewsCategories(): Promise<Category[]> {
  return safe(async () => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("news_categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    return (data as Category[]) ?? [];
  }, []);
}

export async function getDocuments(opts?: {
  categorySlug?: string;
  search?: string;
}): Promise<DocumentItem[]> {
  return safe(async () => {
    const supabase = await createClient();
    let query = supabase
      .from("documents")
      .select("*, category:document_categories(*)")
      .eq("is_published", true)
      .order("created_at", { ascending: false });
    if (opts?.search) query = query.ilike("title", `%${opts.search}%`);
    const { data } = await query;
    let rows = (data as DocumentItem[]) ?? [];
    if (opts?.categorySlug) rows = rows.filter((d) => d.category?.slug === opts.categorySlug);
    return rows;
  }, []);
}

export async function getDocumentCategories(): Promise<Category[]> {
  return safe(async () => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("document_categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    return (data as Category[]) ?? [];
  }, []);
}

export async function getServices(): Promise<Service[]> {
  return safe(async () => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("services")
      .select("*")
      .neq("status", "inactive")
      .order("sort_order");
    return (data as Service[]) ?? [];
  }, []);
}

export async function getAlbums(): Promise<GalleryAlbum[]> {
  return safe(async () => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("gallery_albums")
      .select("*, images:gallery_images(*)")
      .eq("is_published", true)
      .order("event_date", { ascending: false });
    return ((data as GalleryAlbum[]) ?? []).map((a) => ({
      ...a,
      image_count: a.images?.length ?? 0,
    }));
  }, []);
}

export async function getAlbumBySlug(slug: string): Promise<GalleryAlbum | null> {
  return safe(async () => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("gallery_albums")
      .select("*, images:gallery_images(*)")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();
    if (!data) return null;
    const album = data as GalleryAlbum;
    album.images = (album.images ?? []).sort((a, b) => a.sort_order - b.sort_order);
    return album;
  }, null);
}

export async function getStaff(): Promise<Staff[]> {
  return safe(async () => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("staff")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    return (data as Staff[]) ?? [];
  }, []);
}

/** สถิติสำหรับ Dashboard หลังบ้าน */
export async function getDashboardStats() {
  return safe(
    async () => {
      const supabase = await createClient();
      const count = async (table: string, col?: string, val?: string | boolean) => {
        let q = supabase.from(table).select("*", { count: "exact", head: true });
        if (col !== undefined) q = q.eq(col, val as string | boolean);
        const { count: c } = await q;
        return c ?? 0;
      };
      const [news, published, documents, albums, services, staff] = await Promise.all([
        count("news"),
        count("news", "status", "published"),
        count("documents"),
        count("gallery_albums"),
        count("services", "status", "active"),
        count("staff"),
      ]);
      return { news, published, documents, albums, services, staff };
    },
    { news: 0, published: 0, documents: 0, albums: 0, services: 0, staff: 0 },
  );
}

export type { GalleryImage };
