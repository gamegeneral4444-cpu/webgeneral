import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { FALLBACK_UNITS, type Unit } from "@/lib/units";
import type {
  News,
  DocumentItem,
  Service,
  GalleryAlbum,
  GalleryImage,
  Staff,
  SiteSettings,
  Category,
  UnitPost,
  UnitStaffWithPerson,
  UnitRole,
  UnitRow,
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

// ห่อด้วย cache() เพื่อ dedupe query เมื่อถูกเรียกหลายครั้งใน request เดียว
// (generateMetadata ใน root layout + PublicLayout เรียก getSettings ทั้งคู่)
export const getSettings = cache(async (): Promise<SiteSettings | null> => {
  return safe(async () => {
    const supabase = await createClient();
    const { data } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();
    return (data as SiteSettings) ?? null;
  }, null);
});

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

/**
 * โพสต์งานของกลุ่มงาน เรียงใหม่ก่อน
 * ค่า posted_at ที่เป็น null จะถูกดันไปท้ายสุด แล้วเรียงต่อด้วย created_at
 */
export async function getUnitPosts(opts?: {
  unitSlug?: string;
  limit?: number;
  includeDrafts?: boolean;
}): Promise<UnitPost[]> {
  return safe(async () => {
    const supabase = await createClient();
    let query = supabase.from("unit_posts").select("*");

    if (opts?.unitSlug) query = query.eq("unit_slug", opts.unitSlug);
    if (!opts?.includeDrafts) query = query.eq("status", "published");

    query = query
      .order("posted_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (opts?.limit) query = query.limit(opts.limit);

    const { data } = await query;
    return (data as UnitPost[]) ?? [];
  }, []);
}

/** นับโพสต์ที่เผยแพร่แล้วของแต่ละงาน คืนเป็น map slug -> จำนวน */
export async function getUnitPostCounts(): Promise<Record<string, number>> {
  const posts = await getUnitPosts();
  const out: Record<string, number> = {};
  for (const p of posts) out[p.unit_slug] = (out[p.unit_slug] ?? 0) + 1;
  return out;
}

export async function getUnitPost(id: string): Promise<UnitPost | null> {
  return safe(async () => {
    const supabase = await createClient();
    const { data } = await supabase.from("unit_posts").select("*").eq("id", id).maybeSingle();
    return (data as UnitPost) ?? null;
  }, null);
}

/**
 * ผู้รับผิดชอบของทุกงาน คืนเป็น map: unit_slug -> { head[], assistant[] }
 * ดึงทีเดียวทั้งตารางเพราะมีแค่หลักสิบแถว ถูกกว่ายิงทีละงาน
 */
export async function getUnitStaffMap(): Promise<
  Record<string, { head: Staff[]; assistant: Staff[] }>
> {
  return safe(async () => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("unit_staff")
      .select("*, staff:staff(*)")
      .order("sort_order", { ascending: true });

    const rows = (data as UnitStaffWithPerson[]) ?? [];
    const out: Record<string, { head: Staff[]; assistant: Staff[] }> = {};
    for (const r of rows) {
      if (!r.staff || r.staff.is_active === false) continue;
      out[r.unit_slug] ??= { head: [], assistant: [] };
      out[r.unit_slug][r.role].push(r.staff);
    }
    return out;
  }, {});
}

/** บทบาทของบุคลากรคนหนึ่ง ใช้ตอนเปิดฟอร์มแก้ไขในหลังบ้าน */
export async function getStaffUnitRoles(
  staffId: string,
): Promise<Record<string, UnitRole>> {
  return safe(async () => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("unit_staff")
      .select("unit_slug, role")
      .eq("staff_id", staffId);

    const out: Record<string, UnitRole> = {};
    for (const r of (data as { unit_slug: string; role: UnitRole }[]) ?? []) {
      out[r.unit_slug] = r.role;
    }
    return out;
  }, {});
}

/**
 * รายชื่อกลุ่มงานจากฐานข้อมูล ถ้าตารางยังไม่มีหรือว่าง จะใช้รายชื่อสำรองในโค้ด
 * includeHidden ใช้ในหลังบ้านเพื่อให้เห็นงานที่ถูกซ่อนด้วย
 */
export async function getUnits(opts?: { includeHidden?: boolean }): Promise<Unit[]> {
  const rows = await safe(async () => {
    const supabase = await createClient();
    let query = supabase.from("units").select("*").order("sort_order", { ascending: true });
    if (!opts?.includeHidden) query = query.eq("is_active", true);
    const { data } = await query;
    return (data as UnitRow[]) ?? [];
  }, [] as UnitRow[]);

  if (!rows.length) return FALLBACK_UNITS;
  return rows.map((r) => ({
    slug: r.slug,
    label: r.label,
    icon: r.icon,
    description: r.description?.trim() || undefined,
  }));
}

/** แถวดิบจากตาราง units ใช้ในหลังบ้านที่ต้องเห็น sort_order กับ is_active ด้วย */
export async function getUnitRows(): Promise<UnitRow[]> {
  return safe(async () => {
    const supabase = await createClient();
    const { data } = await supabase.from("units").select("*").order("sort_order", { ascending: true });
    return (data as UnitRow[]) ?? [];
  }, []);
}

/** นับโพสต์และผู้รับผิดชอบของแต่ละงาน ใช้เตือนก่อนลบ */
export async function getUnitUsage(): Promise<Record<string, { posts: number; staff: number }>> {
  const out: Record<string, { posts: number; staff: number }> = {};
  const posts = await getUnitPosts({ includeDrafts: true });
  for (const p of posts) {
    out[p.unit_slug] ??= { posts: 0, staff: 0 };
    out[p.unit_slug].posts += 1;
  }
  const staffMap = await getUnitStaffMap();
  for (const [slug, g] of Object.entries(staffMap)) {
    out[slug] ??= { posts: 0, staff: 0 };
    out[slug].staff = g.head.length + g.assistant.length;
  }
  return out;
}
