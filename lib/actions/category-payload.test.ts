import { describe, expect, it } from "vitest";
import { parseCategoryFormData } from "./category-payload";

describe("parseCategoryFormData", () => {
  it("coerces order and active state", () => {
    const form = new FormData();
    form.set("name", "ประกาศ");
    form.set("slug", "announcement");
    form.set("sort_order", "4");
    form.set("is_active", "on");

    expect(parseCategoryFormData(form)).toMatchObject({ success: true, data: { sort_order: 4, is_active: true } });
  });
});
