import { siteConfig } from "@/config/site";
import { getSiteSettings } from "@/lib/data/cms";

export function safePublicUrl(value: string | null | undefined, fallback: string) {
  try { const url = new URL(value || fallback); return url.protocol === "https:" ? url.href : fallback; } catch { return fallback; }
}
export async function getPublicSettings() {
  const settings = await getSiteSettings().catch(() => null);
  return {
    twitterUrl: safePublicUrl(settings?.twitterUrl, siteConfig.social.twitter),
    youtubeUrl: safePublicUrl(settings?.youtubeUrl, siteConfig.social.youtube),
    contactEmail: settings?.contactEmail || siteConfig.contact.email,
    ctaTitle: settings?.ctaTitle || undefined,
    ctaDescription: settings?.ctaDescription || undefined,
    footerText: settings?.footerText || siteConfig.description,
  };
}
export type PublicSettings = Awaited<ReturnType<typeof getPublicSettings>>;
