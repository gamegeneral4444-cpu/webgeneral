import Link from "next/link";
import Image from "next/image";
import { Images, CalendarDays } from "lucide-react";
import { formatThaiDate } from "@/lib/format";
import type { GalleryAlbum } from "@/types/database";

export function GalleryCard({ album }: { album: GalleryAlbum }) {
  const cover = album.cover_image_url ?? album.images?.[0]?.image_url ?? null;
  return (
    <Link
      href={`/gallery/${album.slug}`}
      className="group relative block aspect-[4/3] overflow-hidden rounded-xl border bg-muted shadow-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      {cover ? (
        <Image
          src={cover}
          alt={album.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="grid h-full place-items-center text-muted-foreground">
          <Images className="size-10" aria-hidden />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
        <h3 className="line-clamp-1 font-semibold">{album.title}</h3>
        <div className="mt-1 flex items-center gap-3 text-xs text-white/80">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="size-3.5" aria-hidden />
            {formatThaiDate(album.event_date)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Images className="size-3.5" aria-hidden />
            {album.image_count ?? album.images?.length ?? 0} รูป
          </span>
        </div>
      </div>
    </Link>
  );
}
