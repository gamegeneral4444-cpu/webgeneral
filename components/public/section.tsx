import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  title,
  subtitle,
  moreHref,
  moreLabel = "ดูทั้งหมด",
  center,
}: {
  title: string;
  subtitle?: string;
  moreHref?: string;
  moreLabel?: string;
  center?: boolean;
}) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-wrap items-end justify-between gap-3",
        center && "flex-col items-center text-center",
      )}
    >
      <div>
        <div className="mb-1 h-1 w-12 rounded-full bg-gold" aria-hidden />
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">{title}</h2>
        {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
      </div>
      {moreHref && (
        <Link
          href={moreHref}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          {moreLabel} <ArrowRight className="size-4" aria-hidden />
        </Link>
      )}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-xl border border-dashed bg-muted/30 p-10 text-center">
      <p className="font-medium text-foreground">{title}</p>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}
