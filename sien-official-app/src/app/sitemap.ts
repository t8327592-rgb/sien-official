import { MetadataRoute } from "next";
import { getAllPublishedPosts } from "@/lib/data/cms";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.sien-official.com";

  // 静的ページのルート一覧
  const routes = [
    "",
    "/pricing",
    "/mix",
    "/original",
    "/business",
    "/profile",
    "/works",
    "/blog",
    "/news",
    "/faq",
    "/policy/privacy",
    "/policy/law",
    "/policy/guidelines",
  ];

  const staticUrls = routes.map((route) => ({
    url: `${baseUrl}${route}`,
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  // ブログ記事や実績を取得して動的にサイトマップに追加
  const posts = await getAllPublishedPosts();

  const postUrls = posts.filter(post => post.type === "BLOG" || post.type === "NEWS").map((post) => ({
    url: `${baseUrl}/${post.type === "NEWS" ? "news" : "blog"}/${post.id}`,
    lastModified: post.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticUrls, ...postUrls];
}
