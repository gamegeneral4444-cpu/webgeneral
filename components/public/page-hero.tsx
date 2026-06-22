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
    <section className="relative overflow-hidden border-b bg-gradient-to-r from-[#0f172a] to-[#1e293b] text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(250,204,21,0.5) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-4 py-10">
        <nav aria-label="breadcrumb" className="mb-2 flex flex-wrap items-center gap-1 text-sm text-slate-300">
          <Link href="/" className="hover:text-gold">
            หน้าแรก
          </Link>
          {crumbs.map((c) => (
            <span key={c.label} className="flex items-center gap-1">
              <ChevronRight className="size-4 text-slate-500" aria-hidden />
              {c.href ? (
                <Link href={c.href} className="hover:text-gold">
                  {c.label}
                </Link>
              ) : (
                <span className="text-gold">{c.label}</span>
              )}
            </span>
          ))}
        </nav>
        <div className="mb-1 h-1 w-12 rounded-full bg-gold" aria-hidden />
        <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-slate-300">{subtitle}</p>}
      </div>
    </section>
  );
}
