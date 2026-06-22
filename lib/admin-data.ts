import { createClient } from "@/lib/supabase/server";
import type {
  News,
  DocumentItem,
  Service,
  Staff,
  GalleryAlbum,
  Category,
  SiteSettings,
  Profile,
} from "@/types/database";

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

export async function adminListNews(): Promise<News[]> {
  return safe(async () => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("news")
      .select("*, category:news_categories(*)")
      .order("created_at", { ascending: false });
    return (data as News[]) ?? [];
  }, []);
}

export async function adminGetNews(id: string): Promise<News | null> {
  return safe(async () => {
    const supabase = await createClient();
    const { data } = await supabase.from("news").select("*").eq("id", id).maybeSingle();
    return (data as News) ?? null;
  }, null);
}

export async function adminListDocuments(): Promise<DocumentItem[]> {
  return safe(async () => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("documents")
      .select("*, category:document_categories(*)")
      .order("created_at", { ascending: false });
    return (data as DocumentItem[]) ?? [];
  }, []);
}

export async function adminGetDocument(id: string): Promise<DocumentItem | null> {
  return safe(async () => {
    const supabase = await createClient();
    const { data } = await supabase.from("documents").select("*").eq("id", id).maybeSingle();
    return (data as DocumentItem) ?? null;
  }, null);
}

export async function adminListServices(): Promise<Service[]> {
  return safe(async () => {
    const supabase = await createClient();
    const { data } = await supabase.from("services").select("*").order("sort_order");
    return (data as Service[]) ?? [];
  }, []);
}

export async function adminGetService(id: string): Promise<Service | null> {
  return safe(async () => {
    const supabase = await createClient();
    const { data } = await supabase.from("services").select("*").eq("id", id).maybeSingle();
    return (data as Service) ?? null;
  }, null);
}

export async function adminListStaff(): Promise<Staff[]> {
  return safe(async () => {
    const supabase = await createClient();
    const { data } = await supabase.from("staff").select("*").order("sort_order");
    return (data as Staff[]) ?? [];
  }, []);
}

export async function adminGetStaff(id: string): Promise<Staff | null> {
  return safe(async () => {
    const supabase = await createClient();
    const { data } = await supabase.from("staff").select("*").eq("id", id).maybeSingle();
    return (data as Staff) ?? null;
  }, null);
}

export async function adminListAlbums(): Promise<GalleryAlbum[]> {
  return safe(async () => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("gallery_albums")
      .select("*, images:gallery_images(*)")
      .order("created_at", { ascending: false });
    return ((data as GalleryAlbum[]) ?? []).map((a) => ({
      ...a,
      image_count: a.images?.length ?? 0,
    }));
  }, []);
}

export async function adminGetAlbum(id: string): Promise<GalleryAlbum | null> {
  return safe(async () => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("gallery_albums")
      .select("*, images:gallery_images(*)")
      .eq("id", id)
      .maybeSingle();
    return (data as GalleryAlbum) ?? null;
  }, null);
}

export async function adminListCategories(table: string): Promise<Category[]> {
  return safe(async () => {
    const supabase = await createClient();
    const { data } = await supabase.from(table).select("*").order("sort_order");
    return (data as Category[]) ?? [];
  }, []);
}

export async function adminGetSettings(): Promise<SiteSettings | null> {
  return safe(async () => {
    const supabase = await createClient();
    const { data } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();
    return (data as SiteSettings) ?? null;
  }, null);
}

export async function adminListProfiles(): Promise<Profile[]> {
  return safe(async () => {
    const supabase = await createClient();
    const { data } = await supabase.from("profiles").select("*").order("created_at");
    return (data as Profile[]) ?? [];
  }, []);
}
