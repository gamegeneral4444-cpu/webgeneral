import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

/**
 * Next.js 16 Proxy (เดิมคือ middleware)
 * - refresh Supabase session ทุกคำขอ
 * - ป้องกันเส้นทาง /admin
 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * จับทุกเส้นทาง ยกเว้น static / image / favicon / ไฟล์ asset
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
