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

  it("ยอมให้ลิงก์ไฟล์แนบเป็นค่าว่างได้", () => {
    expect(unitPostSchema.safeParse({ ...ok, attachment_url: "" }).success).toBe(true);
  });

  it("ไม่ผ่านเมื่อลิงก์ไฟล์แนบไม่ใช่ URL", () => {
    expect(unitPostSchema.safeParse({ ...ok, attachment_url: "ไม่ใช่ลิงก์" }).success).toBe(false);
  });
});
