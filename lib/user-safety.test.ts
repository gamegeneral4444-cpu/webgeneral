import { describe, expect, it } from "vitest";
import { removesLastSuperAdmin } from "./user-safety";

describe("removesLastSuperAdmin", () => {
  it("protects the final active super administrator", () => {
    expect(removesLastSuperAdmin({ targetRole: "super_admin", targetActive: true, nextRole: "admin", nextActive: true, activeSuperAdmins: 1 })).toBe(true);
    expect(removesLastSuperAdmin({ targetRole: "super_admin", targetActive: true, nextRole: "super_admin", nextActive: false, activeSuperAdmins: 2 })).toBe(false);
  });
});
