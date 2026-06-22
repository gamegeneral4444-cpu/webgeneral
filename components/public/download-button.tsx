"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

/**
 * ปุ่มดาวน์โหลด: เพิ่มยอด download_count แล้วเปิดไฟล์
 */
export function DownloadButton({
  id,
  url,
  children,
}: {
  id: string;
  url: string;
  children: React.ReactNode;
}) {
  async function handleClick() {
    try {
      const supabase = createClient();
      await supabase.rpc("increment_download_count", { doc_id: id });
    } catch {
      /* ไม่ให้พังถ้านับยอดไม่ได้ */
    } finally {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <Button size="sm" variant="outline" className="gap-2" onClick={handleClick}>
      {children}
    </Button>
  );
}
