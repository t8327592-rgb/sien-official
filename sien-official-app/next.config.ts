import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  outputFileTracingIncludes: { "/api/admin/orders/*/feedback": ["./public/fonts/ZenKakuGothicNew-Regular.ttf", "./public/logo.png"] },
  experimental: { serverActions: { bodySizeLimit: "2mb" } },
  distDir: process.env.QA_ISOLATED === "1" ? ".next-qa" : ".next",
  async headers() {
    const development = process.env.NODE_ENV === "development";
    // Static/ISR pages contain Next.js hydration scripts. Nonces require dynamic
    // rendering; retain inline hydration while restricting script origins.
    const policy = [
      "default-src 'self'", "base-uri 'self'", "object-src 'none'",
      "frame-ancestors 'none'", "form-action 'self'",
      `script-src 'self' 'unsafe-inline'${development ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com`,
      "style-src 'self' 'unsafe-inline'", "font-src 'self'",
      "img-src 'self' data: blob: https:", "media-src 'self' blob:",
      "frame-src https://www.youtube-nocookie.com https://www.youtube.com",
      `connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com${development ? " ws: http://127.0.0.1:*" : ""}`,
      "worker-src 'self' blob:",
    ].join("; ");
    return [{ source: "/:path*", headers: [
      { key: "Content-Security-Policy", value: policy },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ...(!development && (process.env.NEXT_PUBLIC_SITE_URL || "https://www.sien-official.com").startsWith("https:") ? [{ key: "Strict-Transport-Security", value: "max-age=31536000" }] : []),
    ] }, { source: "/:section(admin|login|order)/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      }
    ],
  },
};

export default nextConfig;
