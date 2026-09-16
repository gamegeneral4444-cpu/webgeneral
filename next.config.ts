import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Supabase Storage (public buckets)
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
      { protocol: "https", hostname: "images.unsplash.com" },
      // โดเมนของเว็บเอง — เผื่อ logo_url/banner_image_url ถูกตั้งเป็น URL เต็ม
      // ที่ชี้กลับมาที่ไฟล์ใน public/ (เช่น /logo.png) ไม่งั้น optimizer ตอบ 400 รูปแตก
      { protocol: "https", hostname: "general-affairs-website.vercel.app" },
      { protocol: "https", hostname: "general-affairs-website-*.vercel.app" },
    ],
  },
};

export default nextConfig;
