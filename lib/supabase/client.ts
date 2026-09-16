import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client สำหรับ Client Components (ฝั่ง browser)
 * ใช้ anon key เท่านั้น — ปลอดภัยที่จะ expose
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
