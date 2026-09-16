import Image from "next/image";
import { Phone, Mail, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getStaffImageSrc, getStaffImageStyle } from "@/lib/staff-image";
import type { Staff } from "@/types/database";

export function StaffCard({
  staff,
  showDetailButton,
}: {
  staff: Staff;
  showDetailButton?: boolean;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border bg-card p-5 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative size-24 overflow-hidden rounded-full bg-muted ring-2 ring-soft-gold">
        {staff.image_url ? (
          <Image
            src={getStaffImageSrc(staff)}
            alt={staff.full_name}
            fill
            sizes="96px"
            className="object-cover"
            style={getStaffImageStyle(staff)}
          />
        ) : (
          <div className="grid h-full place-items-center text-muted-foreground">
            <User className="size-10" aria-hidden />
          </div>
        )}
      </div>
      <h3 className="mt-3 font-semibold text-foreground">{staff.full_name}</h3>
      <p className="text-sm font-medium text-primary">{staff.position}</p>
      {staff.responsibility && (
        <p className="mt-1 text-xs text-muted-foreground">{staff.responsibility}</p>
      )}
      <div className="mt-3 flex flex-col items-center gap-1 text-xs text-muted-foreground">
        {staff.phone && (
          <a href={`tel:${staff.phone}`} className="inline-flex items-center gap-1.5 hover:text-primary">
            <Phone className="size-3.5" aria-hidden /> {staff.phone}
          </a>
        )}
        {staff.email && (
          <a href={`mailto:${staff.email}`} className="inline-flex items-center gap-1.5 hover:text-primary">
            <Mail className="size-3.5" aria-hidden /> {staff.email}
          </a>
        )}
      </div>
      {showDetailButton && (
        <Button asChild variant="outline" size="sm" className="mt-4 gap-1">
          <a href={`mailto:${staff.email ?? ""}`}>
            ดูข้อมูลเพิ่มเติม <ArrowRight className="size-3.5" aria-hidden />
          </a>
        </Button>
      )}
    </div>
  );
}
