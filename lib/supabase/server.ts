import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Profile } from "@/types/database";

/**
 * Supabase client สำหรับ Server Components / Server Actions / Route Handlers
 * อ่าน/เขียน session ผ่าน cookies ของ Next.js
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // ถูกเรียกจาก Server Component — session จะถูก refresh ใน proxy แทน
          }
        },
      },
    },
  );
}

/**
 * Supabase client ที่ใช้ Service Role Key — ฝั่ง server เท่านั้น
 * ใช้สำหรับงาน admin ที่ข้าม RLS (เช่น จัดการผู้ใช้)
 * ห้ามเรียกจาก Client Component เด็ดขาด
 */
export async function createAdminClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          /* no-op */
        },
      },
    },
  );
}

/**
 * ดึง user ปัจจุบัน + profile (role) — คืน null ถ้ายังไม่ login หรือเชื่อม DB ไม่ได้
 */
export async function getCurrentUser(): Promise<{
  userId: string;
  email: string;
  profile: Profile | null;
} | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    return {
      userId: user.id,
      email: user.email ?? "",
      profile: (profile as Profile) ?? null,
    };
  } catch {
    return null;
  }
}
