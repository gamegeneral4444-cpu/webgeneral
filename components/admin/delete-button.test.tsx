import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { DeleteButton } from "./delete-button";

it("disables deletion when a record is still in use", () => {
  render(<DeleteButton action={vi.fn()} itemName="ประกาศ" disabled />);

  expect(screen.getByRole("button", { name: "ลบ" })).toBeDisabled();
});
