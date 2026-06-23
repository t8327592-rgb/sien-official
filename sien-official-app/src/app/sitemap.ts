import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://sien-official.vercel.app"; // 本番環境のURL

  // 静的ページのルート一覧
  const routes = [
    "",
    "/mix",
    "/original",
    "/business",
    "/profile",
    "/works",
    "/faq",
    "/order",
    "/policy/privacy",
    "/policy/law",
    "/policy/guidelines",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));
}
