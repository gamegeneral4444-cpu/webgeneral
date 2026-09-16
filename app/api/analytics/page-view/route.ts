import { NextRequest, NextResponse } from "next/server";
import { normalizeAnalyticsPath } from "@/lib/analytics";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return NextResponse.json({ error: "invalid content type" }, { status: 400 });

  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  if ((origin && origin !== request.nextUrl.origin) || (fetchSite && !["same-origin", "none"].includes(fetchSite))) {
    return NextResponse.json({ error: "cross-site request rejected" }, { status: 403 });
  }

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "invalid json" }, { status: 400 }); }
  const path = normalizeAnalyticsPath((body as { path?: unknown })?.path);
  if (!path) return NextResponse.json({ error: "invalid path" }, { status: 400 });

  try {
    const supabase = createServiceRoleClient();
    const { error } = await supabase.rpc("increment_page_view", { page_path: path });
    if (error) return NextResponse.json({ error: "analytics unavailable" }, { status: 503 });
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "analytics unavailable" }, { status: 503 });
  }
}
