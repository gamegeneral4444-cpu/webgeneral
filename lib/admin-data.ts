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
  AuditSummary,
  AnalyticsDaily,
  CategoryWithCount,
} from "@/types/database";
import { CATEGORY_CONFIG, type CategoryTable } from "@/lib/actions/category-config";
import { sanitizeAuditData } from "@/lib/audit";

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

export async function adminListCategoriesWithCount(table: CategoryTable): Promise<CategoryWithCount[]> {
  return safe(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase.from(table).select("*").order("sort_order");
    if (error) return [];
    const categories = (data as Category[]) ?? [];
    return Promise.all(categories.map(async (category) => {
      const { count } = await supabase
        .from(CATEGORY_CONFIG[table].foreignTable)
        .select("id", { count: "exact", head: true })
        .eq("category_id", category.id);
      return { ...category, usage_count: count ?? 0 };
    }));
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

export async function adminListRecentAudit(limit = 6): Promise<AuditSummary[]> {
  return safe(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("list_audit_summaries", {
      result_limit: Math.min(Math.max(limit, 1), 100),
      result_offset: 0,
      action_filter: null,
      table_filter: null,
    });
    if (error) return [];
    return (data as AuditSummary[]) ?? [];
  }, []);
}

export async function adminListAuditLogs(options: { page?: number; action?: string; table?: string } = {}) {
  return safe(async () => {
    const page = Math.max(options.page ?? 1, 1);
    const pageSize = 20;
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("list_audit_summaries", {
      result_limit: pageSize,
      result_offset: (page - 1) * pageSize,
      action_filter: options.action || null,
      table_filter: options.table || null,
    });
    if (error) return { rows: [], total: 0, page, pageSize };
    const rows = (data as (AuditSummary & { total_count?: number })[]) ?? [];
    return { rows, total: Number(rows[0]?.total_count ?? 0), page, pageSize };
  }, { rows: [] as AuditSummary[], total: 0, page: 1, pageSize: 20 });
}

export async function adminListAuditDetails(ids: string[]): Promise<Record<string, { old_data: unknown; new_data: unknown }>> {
  return safe(async () => {
    if (ids.length === 0) return {};
    const supabase = await createClient();
    const { data, error } = await supabase.from("audit_logs").select("id,old_data,new_data").in("id", ids);
    if (error) return {};
    return Object.fromEntries((data ?? []).map((row) => [row.id, {
      old_data: sanitizeAuditData(row.old_data),
      new_data: sanitizeAuditData(row.new_data),
    }]));
  }, {});
}

export async function adminListAnalytics(days = 30): Promise<AnalyticsDaily[]> {
  return safe(async () => {
    const boundedDays = Math.min(Math.max(days, 1), 90);
    const from = new Date();
    from.setDate(from.getDate() - boundedDays + 1);
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("analytics_daily")
      .select("date,path,page_views")
      .gte("date", from.toISOString().slice(0, 10))
      .order("date", { ascending: true });
    if (error) return [];
    return (data as AnalyticsDaily[]) ?? [];
  }, []);
}
