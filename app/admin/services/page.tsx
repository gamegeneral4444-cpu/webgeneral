import Link from "next/link";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LucideIcon } from "@/components/lucide-icon";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DeleteButton } from "@/components/admin/delete-button";
import { adminListServices } from "@/lib/admin-data";
import { deleteService } from "@/lib/actions/services";
import { SERVICE_STATUS } from "@/lib/constants";
import type { ServiceStatus } from "@/types/database";

export const dynamic = "force-dynamic";
export const metadata = { title: "จัดการบริการ" };

const STATUS_STYLE: Record<ServiceStatus, string> = {
  active: "bg-emerald-100 text-emerald-700",
  maintenance: "bg-amber-100 text-amber-700",
  inactive: "bg-slate-100 text-slate-600",
};

export default async function AdminServicesPage() {
  const services = await adminListServices();

  return (
    <div>
      <AdminPageHeader
        title="จัดการระบบบริการ"
        description={`ทั้งหมด ${services.length} รายการ`}
        action={{ href: "/admin/services/create", label: "เพิ่มบริการ" }}
      />

      <div className="rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">ไอคอน</TableHead>
              <TableHead>ชื่อบริการ</TableHead>
              <TableHead className="hidden lg:table-cell">ลิงก์</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead className="hidden md:table-cell">ลำดับ</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  <span className="grid size-9 place-items-center rounded-md bg-soft-gold text-primary">
                    <LucideIcon name={s.icon} className="size-5" />
                  </span>
                </TableCell>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell className="hidden lg:table-cell max-w-[200px] truncate text-muted-foreground">
                  {s.url}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={STATUS_STYLE[s.status]}>
                    {SERVICE_STATUS[s.status]}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{s.sort_order}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button asChild variant="outline" size="sm" className="gap-1.5">
                      <Link href={`/admin/services/${s.id}/edit`}>
                        <Pencil className="size-4" /> แก้ไข
                      </Link>
                    </Button>
                    <DeleteButton action={deleteService.bind(null, s.id)} itemName={s.name} iconOnly />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {services.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                  ยังไม่มีบริการ
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
