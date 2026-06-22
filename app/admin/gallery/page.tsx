import Link from "next/link";
import Image from "next/image";
import { Pencil, Images } from "lucide-react";
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
import { adminListAlbums } from "@/lib/admin-data";
import { getCurrentUser } from "@/lib/supabase/server";
import { canDelete } from "@/lib/permissions";
import { deleteAlbum } from "@/lib/actions/gallery";
import { formatThaiDate } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "จัดการภาพกิจกรรม" };

export default async function AdminGalleryPage() {
  const [albums, current] = await Promise.all([adminListAlbums(), getCurrentUser()]);
  const allowDelete = canDelete(current?.profile?.role);

  return (
    <div>
      <AdminPageHeader
        title="จัดการภาพกิจกรรม"
        description={`ทั้งหมด ${albums.length} อัลบั้ม`}
        action={{ href: "/admin/gallery/create", label: "สร้างอัลบั้ม" }}
      />

      <div className="rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ปก</TableHead>
              <TableHead>ชื่ออัลบั้ม</TableHead>
              <TableHead className="hidden md:table-cell">วันที่</TableHead>
              <TableHead>จำนวนรูป</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {albums.map((a) => (
              <TableRow key={a.id}>
                <TableCell>
                  <div className="relative size-12 overflow-hidden rounded-md bg-muted">
                    {a.cover_image_url ? (
                      <Image src={a.cover_image_url} alt={a.title} fill sizes="48px" className="object-cover" />
                    ) : (
                      <div className="grid h-full place-items-center text-muted-foreground">
                        <Images className="size-5" aria-hidden />
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{a.title}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {formatThaiDate(a.event_date)}
                </TableCell>
                <TableCell className="text-muted-foreground">{a.image_count ?? 0} รูป</TableCell>
                <TableCell>
                  {a.is_published ? (
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">เผยแพร่</Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600">ซ่อน</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button asChild variant="outline" size="sm" className="gap-1.5">
                      <Link href={`/admin/gallery/${a.id}/edit`}>
                        <Pencil className="size-4" /> จัดการ
                      </Link>
                    </Button>
                    {allowDelete && (
                      <DeleteButton action={deleteAlbum.bind(null, a.id)} itemName={a.title} iconOnly />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {albums.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                  ยังไม่มีอัลบั้ม
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
