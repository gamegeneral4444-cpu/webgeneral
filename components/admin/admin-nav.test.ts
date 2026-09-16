import { describe, expect, it } from "vitest";
import { visibleNav } from "./admin-nav";

describe("visibleNav", () => {
  it("shows category management and activity to administrators", () => {
    const hrefs = visibleNav("admin").map((item) => item.href);

    expect(hrefs).toContain("/admin/categories");
    expect(hrefs).toContain("/admin/activity");
    expect(hrefs).not.toContain("/admin/users");
  });

  it("shows user management only to the super administrator", () => {
    expect(visibleNav("super_admin").map((item) => item.href)).toContain("/admin/users");
    expect(visibleNav("viewer").map((item) => item.href)).not.toContain("/admin/users");
  });
});
