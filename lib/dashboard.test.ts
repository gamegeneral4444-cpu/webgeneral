import { describe, expect, it } from "vitest";
import { buildDashboardCards } from "./dashboard";

describe("buildDashboardCards", () => {
  it("maps live counts to stable module destinations", () => {
    const cards = buildDashboardCards({
      news: 4,
      published: 3,
      documents: 5,
      albums: 2,
      services: 6,
      staff: 8,
      pageViews: 10,
    });

    expect(cards).toMatchObject([
      { label: "ข่าวทั้งหมด", value: 4, href: "/admin/news" },
      { label: "เอกสารดาวน์โหลด", value: 5, href: "/admin/documents" },
      { label: "ระบบบริการ", value: 6, href: "/admin/services" },
      { label: "บุคลากร", value: 8, href: "/admin/staff" },
      { label: "ผู้เข้าชม 30 วัน", value: 10, href: "/admin#analytics" },
    ]);
  });
});
