"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function PageViewTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || lastPath.current === pathname) return;
    lastPath.current = pathname;
    const body = JSON.stringify({ path: pathname });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics/page-view", new Blob([body], { type: "application/json" }));
      return;
    }
    void fetch("/api/analytics/page-view", { method: "POST", headers: { "content-type": "application/json" }, body, keepalive: true });
  }, [pathname]);

  return null;
}
