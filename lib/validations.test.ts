import { describe, expect, it } from "vitest";
import { categorySchema } from "./validations";

describe("categorySchema", () => {
  it("rejects an empty category name", () => {
    expect(categorySchema.safeParse({ name: "", slug: "announcement", sort_order: 0, is_active: true }).success).toBe(false);
  });
});
