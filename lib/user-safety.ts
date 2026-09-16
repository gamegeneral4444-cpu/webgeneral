import type { Role } from "@/lib/permissions";

export function removesLastSuperAdmin(input: {
  targetRole: Role;
  targetActive: boolean;
  nextRole: Role;
  nextActive: boolean;
  activeSuperAdmins: number;
}) {
  const targetIsActiveSuperAdmin = input.targetRole === "super_admin" && input.targetActive;
  const remainsActiveSuperAdmin = input.nextRole === "super_admin" && input.nextActive;
  return targetIsActiveSuperAdmin && !remainsActiveSuperAdmin && input.activeSuperAdmins <= 1;
}
