import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value: number | string;
  caption?: string;
  href: string;
  icon: LucideIcon;
};

export function StatCard({ label, value, caption, href, icon: Icon }: StatCardProps) {
  return (
    <Link
      href={href}
      aria-label={`${label}: ${value}`}
      className="group rounded-xl border border-[var(--admin-border)] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--admin-gold)] hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-10 place-items-center rounded-lg bg-amber-50 text-[var(--admin-gold)]">
          <Icon className="size-5" aria-hidden />
        </span>
        <ArrowRight className="size-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[var(--admin-gold)]" aria-hidden />
      </div>
      <strong className="mt-3 block text-2xl text-[var(--admin-ink)]">{value}</strong>
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      {caption && <small className="mt-1 block text-xs text-muted-foreground">{caption}</small>}
    </Link>
  );
}
