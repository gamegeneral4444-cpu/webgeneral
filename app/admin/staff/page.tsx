import Link from "next/link";
import Image from "next/image";
import { Pencil, User } from "lucide-react";
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
import { AdminPageHeader } from "@/components/admin/page-header";
import { DeleteButton } from "@/components/admin/delete-button";
import { adminListStaff } from "@/lib/admin-data";
import { deleteStaff } from "@/lib/actions/staff";
import { getStaffImageSrc, getStaffImageStyle } from "@/lib/staff-image";

export const dynamic = "force-dynamic";
export const metadata = { title: "จัดการบุคลากร" };

export default async function AdminStaffPage() {
  const staff = await adminListStaff();

  return (
    <div>
      <AdminPageHeader
        title="จัดการบุคลากร"
        description={`ทั้งหมด ${staff.length} คน`}
        action={{ href: "/admin/staff/create", label: "เพิ่มบุคลากร" }}
      />

      <div className="rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">รูป</TableHead>
              <TableHead>ชื่อ-นามสกุล</TableHead>
              <TableHead className="hidden md:table-cell">ตำแหน่ง</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead className="hidden md:table-cell">ลำดับ</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  <div className="relative size-10 overflow-hidden rounded-full bg-muted">
                    {s.image_url ? (
                      <Image
                        src={getStaffImageSrc(s)}
                        alt={s.full_name}
                        fill
                        sizes="40px"
                        className="object-cover"
                        style={getStaffImageStyle(s)}
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-muted-foreground">
                        <User className="size-5" aria-hidden />
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{s.full_name}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{s.position}</TableCell>
                <TableCell>
                  {s.is_active ? (
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">แสดง</Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600">ซ่อน</Badge>
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{s.sort_order}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button asChild variant="outline" size="sm" className="gap-1.5">
                      <Link href={`/admin/staff/${s.id}/edit`}>
                        <Pencil className="size-4" /> แก้ไข
                      </Link>
                    </Button>
                    <DeleteButton action={deleteStaff.bind(null, s.id)} itemName={s.full_name} iconOnly />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {staff.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                  ยังไม่มีข้อมูลบุคลากร
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
