import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url;
export function pageMetadata(path: string, content: { title: string; description?: string }): Metadata {
  const description = content.description || siteConfig.description;
  const url = new URL(path, siteOrigin).href;
  const image = new URL("/ogp.png", siteOrigin).href;
  return {
    title: content.title, description,
    alternates: { canonical: url },
    openGraph: { title: content.title, description, url, siteName: siteConfig.name, locale: "ja_JP", type: "website", images: [{ url: image, width: 1200, height: 630, alt: siteConfig.name }] },
    twitter: { card: "summary_large_image", title: content.title, description, images: [image], creator: "@sien_mc09" },
  };
}
export function articleDescription(content: string) {
  return content.replace(/<[^>]*>/g, " ").replace(/[#*`_\[\]]/g, "").replace(/\s+/g, " ").trim().slice(0, 140);
}
