import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { UNITS } from "@/lib/units";
import { getUnitDescriptions } from "@/lib/data";
import { getCurrentUser } from "@/lib/supabase/server";
import { canManageSite } from "@/lib/permissions";
import { DescriptionRow } from "./description-row";

export const dynamic = "force-dynamic";
export const metadata = { title: "คำอธิบายกลุ่มงาน" };

export default async function UnitDetailsPage() {
  const current = await getCurrentUser();
  if (!canManageSite(current?.profile?.role)) redirect("/admin");

  const descriptions = await getUnitDescriptions();

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/admin/unit-posts"
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="size-4" aria-hidden /> กลับไปหน้ากลุ่มงาน
        </Link>
        <h1 className="text-xl font-bold text-[var(--admin-ink)]">คำอธิบายกลุ่มงาน</h1>
        <p className="text-sm text-muted-foreground">
          แก้หน้าที่และความรับผิดชอบของแต่ละงาน ข้อความจะขึ้นบนการ์ดหน้ากลุ่มงานและหน้าย่อยของงานนั้น
          บันทึกทีละงาน
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {UNITS.map((u) => (
          <DescriptionRow
            key={u.slug}
            slug={u.slug}
            label={u.label}
            initial={descriptions[u.slug] ?? ""}
            fallback={u.description}
          />
        ))}
      </div>
    </div>
  );
}
