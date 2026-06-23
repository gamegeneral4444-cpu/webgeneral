import { describe, expect, it } from "vitest";
import { normalizeImageOrder } from "./gallery-order";

describe("normalizeImageOrder", () => {
  it("assigns consecutive positions", () => {
    expect(normalizeImageOrder(["c", "a", "b"])).toEqual([
      { id: "c", sort_order: 0 },
      { id: "a", sort_order: 1 },
      { id: "b", sort_order: 2 },
    ]);
  });
});
