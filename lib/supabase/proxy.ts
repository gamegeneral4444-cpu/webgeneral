import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refresh session ของ Supabase ในชั้น Proxy (Next.js 16 — เดิมชื่อ middleware)
 * และป้องกันเส้นทาง /admin สำหรับผู้ที่ยังไม่ได้ login
 *
 * เขียนแบบ defensive: ถ้า env ยังเป็น placeholder หรือเชื่อม Supabase ไม่ได้
 * จะไม่ทำให้คำขอล้ม — ปล่อยผ่านตามปกติ
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // ยังไม่ได้ตั้งค่า Supabase จริง → ปล่อยผ่าน (ใช้ตอน dev/build ก่อนเชื่อม DB)
  if (!url || !anonKey || url.includes("placeholder")) {
    return supabaseResponse;
  }

  try {
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const isAdminPath = request.nextUrl.pathname.startsWith("/admin");

    if (isAdminPath && !user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  } catch {
    // เชื่อม Supabase ไม่ได้ — ไม่ block คำขอ
  }

  return supabaseResponse;
}
