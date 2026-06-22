import Link from "next/link";
import Image from "next/image";
import { CalendarDays, ArrowRight, Newspaper } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatThaiDate } from "@/lib/format";
import type { News } from "@/types/database";

function dateBadge(value?: string | null) {
  const d = value ? new Date(value) : null;
  if (!d || isNaN(d.getTime())) return null;
  const day = d.getDate();
  const month = new Intl.DateTimeFormat("th-TH", { month: "short" }).format(d);
  const year = (d.getFullYear() + 543).toString().slice(-2);
  return { day, month, year };
}

export function NewsCard({ news }: { news: News }) {
  const badge = dateBadge(news.published_at ?? news.created_at);
  return (
    <Link
      href={`/news/${news.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
        {news.cover_image_url ? (
          <Image
            src={news.cover_image_url}
            alt={news.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-muted-foreground">
            <Newspaper className="size-10" aria-hidden />
          </div>
        )}
        {badge && (
          <div className="absolute left-3 top-3 grid place-items-center rounded-lg bg-gradient-to-br from-gold to-primary px-2.5 py-1.5 text-center text-white shadow-md">
            <span className="text-lg font-bold leading-none">{badge.day}</span>
            <span className="text-[10px] font-medium leading-tight">
              {badge.month} {badge.year}
            </span>
          </div>
        )}
        {news.is_featured && (
          <Badge className="absolute right-3 top-3 bg-[#0f172a] text-white">ข่าวเด่น</Badge>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {news.category && (
            <Badge variant="secondary" className="font-normal">
              {news.category.name}
            </Badge>
          )}
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="size-3.5" aria-hidden />
            {formatThaiDate(news.published_at ?? news.created_at)}
          </span>
        </div>
        <h3 className="line-clamp-2 font-semibold leading-snug text-foreground group-hover:text-primary">
          {news.title}
        </h3>
        {news.excerpt && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{news.excerpt}</p>
        )}
        <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-medium text-primary">
          อ่านต่อ <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
