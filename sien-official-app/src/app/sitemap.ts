import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://sien-official.vercel.app";

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

  const staticUrls = routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  // ブログ記事や実績を取得して動的にサイトマップに追加
  const posts = await prisma.post.findMany({
    where: { published: true },
    select: { id: true, updatedAt: true },
  });

  const postUrls = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.id}`,
    lastModified: post.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticUrls, ...postUrls];
}
