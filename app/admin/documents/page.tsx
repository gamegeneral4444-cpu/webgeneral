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
import { AdminPageHeader } from "@/components/admin/page-header";
import { DeleteButton } from "@/components/admin/delete-button";
import { adminListDocuments } from "@/lib/admin-data";
import { getCurrentUser } from "@/lib/supabase/server";
import { canDelete } from "@/lib/permissions";
import { deleteDocument } from "@/lib/actions/documents";
import { formatThaiDate, formatFileSize, fileExtLabel, formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "จัดการเอกสาร" };

export default async function AdminDocumentsPage() {
  const [documents, current] = await Promise.all([adminListDocuments(), getCurrentUser()]);
  const allowDelete = canDelete(current?.profile?.role);

  return (
    <div>
      <AdminPageHeader
        title="จัดการเอกสารดาวน์โหลด"
        description={`ทั้งหมด ${documents.length} รายการ`}
        action={{ href: "/admin/documents/create", label: "เพิ่มเอกสาร" }}
      />

      <div className="rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ชื่อเอกสาร</TableHead>
              <TableHead className="hidden md:table-cell">หมวดหมู่</TableHead>
              <TableHead>ชนิด</TableHead>
              <TableHead className="hidden lg:table-cell">ขนาด</TableHead>
              <TableHead className="hidden lg:table-cell">ดาวน์โหลด</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="font-medium">{d.title}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {d.category?.name ?? "-"}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{fileExtLabel(d.file_name, d.file_type)}</Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground">
                  {formatFileSize(d.file_size)}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground">
                  {formatNumber(d.download_count)}
                </TableCell>
                <TableCell>
                  {d.is_published ? (
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                      เผยแพร่
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                      ซ่อน
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button asChild variant="outline" size="sm" className="gap-1.5">
                      <Link href={`/admin/documents/${d.id}/edit`}>
                        <Pencil className="size-4" /> แก้ไข
                      </Link>
                    </Button>
                    {allowDelete && (
                      <DeleteButton action={deleteDocument.bind(null, d.id)} itemName={d.title} iconOnly />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {documents.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                  ยังไม่มีเอกสาร
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
