import Link from "next/link";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center bg-gradient-to-br from-soft-gold to-background px-4 text-center">
      <div>
        <p className="text-7xl font-bold text-primary">404</p>
        <h1 className="mt-3 text-2xl font-bold text-foreground">ไม่พบหน้าที่คุณค้นหา</h1>
        <p className="mt-2 text-muted-foreground">หน้านี้อาจถูกย้ายหรือไม่มีอยู่แล้ว</p>
        <Button asChild className="mt-6 gap-2">
          <Link href="/">
            <Home className="size-4" aria-hidden /> กลับสู่หน้าแรก
          </Link>
        </Button>
      </div>
    </div>
  );
}
