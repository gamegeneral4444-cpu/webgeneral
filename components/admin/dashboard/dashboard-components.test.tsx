import { render, screen } from "@testing-library/react";
import { Newspaper } from "lucide-react";
import { describe, expect, it } from "vitest";
import { StatCard } from "./stat-card";
import { RecentNewsTable } from "./recent-news-table";
import { QuickActions } from "./quick-actions";
import { RecentDocuments } from "./recent-documents";
import { RecentStaff } from "./recent-staff";
import { ActivityTimeline } from "./activity-timeline";
import { AnalyticsSummary } from "./analytics-summary";

describe("dashboard components", () => {
  it("links a KPI value to its management module", () => {
    render(
      <StatCard
        label="ข่าวทั้งหมด"
        value={24}
        caption="รายการ"
        href="/admin/news"
        icon={Newspaper}
      />,
    );

    expect(screen.getByText("24")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ข่าวทั้งหมด/ })).toHaveAttribute("href", "/admin/news");
  });

  it("shows an honest empty news state", () => {
    render(<RecentNewsTable rows={[]} />);

    expect(screen.getByText("ยังไม่มีข่าว")).toBeInTheDocument();
  });

  it("hides write actions from viewers", () => {
    render(<QuickActions role="viewer" />);

    expect(screen.queryByRole("link", { name: "เพิ่มข่าวใหม่" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ดูข่าวทั้งหมด" })).toBeInTheDocument();
  });

  it("uses explicit empty states for every live dataset", () => {
    render(
      <>
        <RecentDocuments rows={[]} />
        <RecentStaff rows={[]} />
        <ActivityTimeline rows={[]} />
        <AnalyticsSummary rows={[]} />
      </>,
    );

    expect(screen.getByText("ยังไม่มีเอกสาร")).toBeInTheDocument();
    expect(screen.getByText("ยังไม่มีข้อมูลบุคลากร")).toBeInTheDocument();
    expect(screen.getByText("ยังไม่มีกิจกรรมล่าสุด")).toBeInTheDocument();
    expect(screen.getByText("ยังไม่มีข้อมูลการเข้าชม")).toBeInTheDocument();
  });
});
