import { describe, expect, it } from "vitest";
import { categorySchema, unitPostSchema } from "./validations";

describe("categorySchema", () => {
  it("rejects an empty category name", () => {
    expect(categorySchema.safeParse({ name: "", slug: "announcement", sort_order: 0, is_active: true }).success).toBe(false);
  });
});

describe("unitPostSchema", () => {
  const ok = {
    unit_slug: "building",
    title: "ซ่อมหลังคาอาคาร 2",
    body: "เริ่มดำเนินการ 1 ต.ค. 2569",
    status: "draft" as const,
  };

  it("ผ่านเมื่อข้อมูลครบ", () => {
    expect(unitPostSchema.safeParse(ok).success).toBe(true);
  });

  it("ไม่ผ่านเมื่อไม่มีหัวข้อ", () => {
    expect(unitPostSchema.safeParse({ ...ok, title: "" }).success).toBe(false);
  });

  it("ไม่ผ่านเมื่อ unit_slug ไม่อยู่ในรายการงาน", () => {
    expect(unitPostSchema.safeParse({ ...ok, unit_slug: "ไม่มีงานนี้" }).success).toBe(false);
  });

  it("ไม่ผ่านเมื่อ status ไม่ใช่ draft หรือ published", () => {
    expect(unitPostSchema.safeParse({ ...ok, status: "archived" }).success).toBe(false);
  });

  it("ไม่มีไฟล์แนบก็ผ่าน", () => {
    expect(unitPostSchema.safeParse({ ...ok, attachments: [] }).success).toBe(true);
  });

  it("แนบหลายไฟล์พร้อมกันได้", () => {
    const files = [
      { url: "https://a.test/1.png", name: "แปลน.png", type: "image/png", size: 1024 },
      { url: "https://a.test/2.pdf", name: "สรุป.pdf", type: "application/pdf", size: 2048 },
    ];
    expect(unitPostSchema.safeParse({ ...ok, attachments: files }).success).toBe(true);
  });

  it("ไม่ผ่านเมื่อ url ของไฟล์แนบไม่ใช่ URL", () => {
    const bad = [{ url: "ไม่ใช่ลิงก์", name: "x", type: "", size: 0 }];
    expect(unitPostSchema.safeParse({ ...ok, attachments: bad }).success).toBe(false);
  });

  it("ไม่ผ่านเมื่อแนบเกิน 20 ไฟล์", () => {
    const many = Array.from({ length: 21 }, (_, i) => ({
      url: `https://a.test/${i}.png`,
      name: `${i}.png`,
      type: "image/png",
      size: 1,
    }));
    expect(unitPostSchema.safeParse({ ...ok, attachments: many }).success).toBe(false);
  });
});
