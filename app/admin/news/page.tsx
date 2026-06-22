import Link from "next/link";
import { Pencil, Eye } from "lucide-react";
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
import { adminListNews } from "@/lib/admin-data";
import { getCurrentUser } from "@/lib/supabase/server";
import { canDelete } from "@/lib/permissions";
import { deleteNews } from "@/lib/actions/news";
import { NEWS_STATUS } from "@/lib/constants";
import { formatThaiDate } from "@/lib/format";
import type { NewsStatus } from "@/types/database";

export const dynamic = "force-dynamic";
export const metadata = { title: "จัดการข่าว" };

const STATUS_STYLE: Record<NewsStatus, string> = {
  published: "bg-emerald-100 text-emerald-700",
  draft: "bg-amber-100 text-amber-700",
  archived: "bg-slate-100 text-slate-600",
};

export default async function AdminNewsPage() {
  const [news, current] = await Promise.all([adminListNews(), getCurrentUser()]);
  const allowDelete = canDelete(current?.profile?.role);

  return (
    <div>
      <AdminPageHeader
        title="จัดการข่าวประชาสัมพันธ์"
        description={`ทั้งหมด ${news.length} รายการ`}
        action={{ href: "/admin/news/create", label: "เพิ่มข่าว" }}
      />

      <div className="rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>หัวข้อ</TableHead>
              <TableHead className="hidden md:table-cell">หมวดหมู่</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead className="hidden lg:table-cell">วันที่เผยแพร่</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {news.map((n) => (
              <TableRow key={n.id}>
                <TableCell className="font-medium">{n.title}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {n.category?.name ?? "-"}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={STATUS_STYLE[n.status]}>
                    {NEWS_STATUS[n.status]}
                  </Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground">
                  {n.published_at ? formatThaiDate(n.published_at) : "-"}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    {n.status === "published" && (
                      <Button asChild variant="outline" size="icon" aria-label="ดูข่าว">
                        <Link href={`/news/${n.slug}`} target="_blank">
                          <Eye className="size-4" />
                        </Link>
                      </Button>
                    )}
                    <Button asChild variant="outline" size="sm" className="gap-1.5">
                      <Link href={`/admin/news/${n.id}/edit`}>
                        <Pencil className="size-4" /> แก้ไข
                      </Link>
                    </Button>
                    {allowDelete && (
                      <DeleteButton action={deleteNews.bind(null, n.id)} itemName={n.title} iconOnly />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {news.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                  ยังไม่มีข่าว — กดปุ่ม &quot;เพิ่มข่าว&quot; เพื่อเริ่มต้น
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
