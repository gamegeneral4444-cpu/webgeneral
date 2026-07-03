import type { Metadata } from "next";
import { Noto_Sans_Thai, Sarabun } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { SITE } from "@/lib/constants";
import { getSettings } from "@/lib/data";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-sans",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const sarabun = Sarabun({
  variable: "--font-mono",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  // ดึงชื่อจาก DB ก่อน เพื่อให้ชื่อบนแท็บตรงกับที่ตั้งในหน้าตั้งค่า admin
  // ถ้า DB ไม่มีค่า/เชื่อมไม่ได้ จะ fallback ไปใช้ค่าคงที่ที่ถูกต้อง
  const settings = await getSettings();
  const siteName = settings?.site_name?.trim() || SITE.name;
  const schoolName = settings?.school_name?.trim() || SITE.schoolName;

  return {
    metadataBase: new URL(SITE.url),
    title: {
      default: `${siteName} | ${schoolName}`,
      template: `%s | ${siteName}`,
    },
    description: SITE.description,
    openGraph: {
      title: siteName,
      description: SITE.description,
      url: SITE.url,
      siteName,
      locale: "th_TH",
      type: "website",
    },
    robots: { index: true, follow: true },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      suppressHydrationWarning
      className={`${notoSansThai.variable} ${sarabun.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <Analytics />
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
