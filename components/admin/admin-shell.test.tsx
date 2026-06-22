import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminShell } from "./admin-shell";

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin",
}));

vi.mock("@/lib/actions/auth", () => ({
  logoutAction: vi.fn(),
}));

describe("AdminShell", () => {
  beforeEach(() => {
    Element.prototype.setPointerCapture = vi.fn();
    Element.prototype.releasePointerCapture = vi.fn();
  });

  it("presents the approved dashboard identity and navigation", () => {
    render(
      <AdminShell role="admin" fullName="ผู้ดูแลระบบ" email="admin@example.com">
        เนื้อหา
      </AdminShell>,
    );

    expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "เมนูหลังบ้าน" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "เปิดเมนู" })).toHaveClass("lg:hidden");
  });

  it("opens a labeled navigation sheet from the hamburger button", async () => {
    const user = userEvent.setup();
    render(
      <AdminShell role="admin" fullName="ผู้ดูแลระบบ" email="admin@example.com">
        เนื้อหา
      </AdminShell>,
    );

    await user.click(screen.getByRole("button", { name: "เปิดเมนู" }));

    expect(await screen.findByRole("dialog", { name: "เมนูหลังบ้าน" })).toBeInTheDocument();
  });
});
