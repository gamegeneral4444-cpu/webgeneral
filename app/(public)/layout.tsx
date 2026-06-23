import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { BackToTop } from "@/components/public/back-to-top";
import { getSettings } from "@/lib/data";
import { PageViewTracker } from "@/components/public/page-view-tracker";

export const revalidate = 60;

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader settings={settings} />
      <main className="flex-1">{children}</main>
      <SiteFooter settings={settings} />
      <BackToTop />
      <PageViewTracker />
    </div>
  );
}
