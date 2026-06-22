import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { LucideIcon } from "@/components/lucide-icon";
import { Badge } from "@/components/ui/badge";
import { SERVICE_STATUS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Service } from "@/types/database";

export function ServiceCard({ service }: { service: Service }) {
  const disabled = service.status !== "active";
  const isInternal = service.url.startsWith("/");

  const inner = (
    <>
      <div className="flex items-start justify-between">
        <span className="grid size-12 place-items-center rounded-xl bg-soft-gold text-primary ring-1 ring-primary/10">
          <LucideIcon name={service.icon} className="size-6" aria-hidden />
        </span>
        {service.status !== "active" ? (
          <Badge variant="secondary" className="text-amber-700">
            {SERVICE_STATUS[service.status]}
          </Badge>
        ) : (
          <ArrowUpRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
        )}
      </div>
      <h3 className="mt-4 font-semibold text-foreground group-hover:text-primary">{service.name}</h3>
      {service.description && (
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{service.description}</p>
      )}
    </>
  );

  const className = cn(
    "group flex flex-col rounded-xl border bg-card p-5 shadow-sm transition-all",
    disabled
      ? "cursor-not-allowed opacity-70"
      : "hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
  );

  if (disabled) {
    return (
      <div className={className} aria-disabled>
        {inner}
      </div>
    );
  }

  if (isInternal) {
    return (
      <Link href={service.url} className={className}>
        {inner}
      </Link>
    );
  }

  return (
    <a
      href={service.url}
      target={service.is_external ? "_blank" : undefined}
      rel={service.is_external ? "noopener noreferrer" : undefined}
      className={className}
    >
      {inner}
    </a>
  );
}
