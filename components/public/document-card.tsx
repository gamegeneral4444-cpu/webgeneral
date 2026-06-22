import { FileText, FileSpreadsheet, FileType, File, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DownloadButton } from "@/components/public/download-button";
import { formatFileSize, fileExtLabel, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DocumentItem } from "@/types/database";

function fileStyle(ext: string) {
  switch (ext) {
    case "PDF":
      return { Icon: FileText, color: "text-red-600", bg: "bg-red-50" };
    case "XLS":
    case "XLSX":
      return { Icon: FileSpreadsheet, color: "text-emerald-600", bg: "bg-emerald-50" };
    case "DOC":
    case "DOCX":
      return { Icon: FileType, color: "text-blue-600", bg: "bg-blue-50" };
    default:
      return { Icon: File, color: "text-slate-500", bg: "bg-slate-100" };
  }
}

export function DocumentCard({ doc }: { doc: DocumentItem }) {
  const ext = fileExtLabel(doc.file_name, doc.file_type);
  const { Icon, color, bg } = fileStyle(ext);

  return (
    <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
      <span className={cn("grid size-12 shrink-0 place-items-center rounded-lg", bg, color)}>
        <Icon className="size-6" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={cn("text-xs", color)}>
            {ext}
          </Badge>
          {doc.category && (
            <Badge variant="secondary" className="text-xs font-normal">
              {doc.category.name}
            </Badge>
          )}
        </div>
        <h3 className="mt-1 truncate font-medium text-foreground">{doc.title}</h3>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(doc.file_size)} · ดาวน์โหลด {formatNumber(doc.download_count)} ครั้ง
        </p>
      </div>
      <DownloadButton id={doc.id} url={doc.file_url}>
        <Download className="size-4" aria-hidden />
        <span className="hidden sm:inline">ดาวน์โหลด</span>
      </DownloadButton>
    </div>
  );
}
