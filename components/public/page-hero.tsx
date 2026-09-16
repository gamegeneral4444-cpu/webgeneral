import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function PageHero({
  title,
  subtitle,
  crumbs = [],
}: {
  title: string;
  subtitle?: string;
  crumbs?: { label: string; href?: string }[];
}) {
  return (
    <section className="relative overflow-hidden border-b border-gold bg-gradient-to-r from-brand-navy to-navy-deep text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(230,201,128,0.5) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-4 py-10">
        <nav aria-label="breadcrumb" className="mb-2 flex flex-wrap items-center gap-1 text-sm text-white/75">
          <Link href="/" className="hover:text-gold-light">
            หน้าแรก
          </Link>
          {crumbs.map((c) => (
            <span key={c.label} className="flex items-center gap-1">
              <ChevronRight className="size-4 text-white/40" aria-hidden />
              {c.href ? (
                <Link href={c.href} className="hover:text-gold-light">
                  {c.label}
                </Link>
              ) : (
                <span className="text-gold-light">{c.label}</span>
              )}
            </span>
          ))}
        </nav>
        <div className="mb-1 h-1 w-12 rounded-full bg-gold" aria-hidden />
        <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-white/80">{subtitle}</p>}
      </div>
    </section>
  );
}
