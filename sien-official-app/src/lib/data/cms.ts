import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

// ---------------------------------------------------------
// Site Settings (サイト共通情報)
// ---------------------------------------------------------
export const getSiteSettings = unstable_cache(
  async () => {
    const settings = await prisma.siteSetting.findUnique({
      where: { id: "default" },
    });
    return settings;
  },
  ['site-settings'],
  { revalidate: 60, tags: ['site-settings'] }
);

// ---------------------------------------------------------
// Profile (プロフィール情報)
// ---------------------------------------------------------
export const getProfile = unstable_cache(
  async () => {
    const profile = await prisma.profile.findUnique({
      where: { id: "default" },
    });
    return profile;
  },
  ['profile'],
  { revalidate: 60, tags: ['profile'] }
);

// ---------------------------------------------------------
// Service (サービス情報)
// ---------------------------------------------------------
export const getServices = unstable_cache(
  async (category?: string) => {
    return await prisma.service.findMany({
      where: {
        isPublished: true,
        ...(category ? { category } : {}),
      },
      orderBy: { orderIndex: 'asc' },
    });
  },
  ['services'],
  { revalidate: 60, tags: ['services'] }
);

// ---------------------------------------------------------
// Pricing (料金プラン・オプション)
// ---------------------------------------------------------
export const getPlans = unstable_cache(
  async (category?: string) => {
    return await prisma.plan.findMany({
      where: {
        isActive: true,
        ...(category ? { category } : {}),
      },
      orderBy: { orderIndex: 'asc' },
    });
  },
  ['plans'],
  { revalidate: 60, tags: ['plans'] }
);

export const getOptions = unstable_cache(
  async (category?: string) => {
    return await prisma.option.findMany({
      where: {
        isActive: true,
        // categoryが指定されている場合は、そのカテゴリかCOMMONのものを含める
        ...(category ? { category: { in: [category, "COMMON"] } } : {}),
      },
      orderBy: { orderIndex: 'asc' },
    });
  },
  ['options'],
  { revalidate: 60, tags: ['options'] }
);

// ---------------------------------------------------------
// Portfolio (制作実績)
// ---------------------------------------------------------
export const getPortfolios = unstable_cache(
  async (category?: string, limit?: number) => {
    return await prisma.portfolio.findMany({
      where: {
        isPublished: true,
        ...(category ? { serviceCategory: category } : {}),
      },
      orderBy: { orderIndex: 'asc' },
      ...(limit ? { take: limit } : {}),
    });
  },
  ['portfolios'],
  { revalidate: 60, tags: ['portfolios'] }
);

export const getFeaturedPortfolios = unstable_cache(
  async (category?: string, limit?: number, excludeCategory?: string) => {
    return await prisma.portfolio.findMany({
      where: {
        isPublished: true,
        isFeatured: true,
        ...(category ? { serviceCategory: category } : {}),
        ...(excludeCategory ? { serviceCategory: { not: excludeCategory } } : {}),
      },
      orderBy: { orderIndex: 'asc' },
      ...(limit ? { take: limit } : {}),
    });
  },
  ['featured-portfolios'],
  { revalidate: 60, tags: ['portfolios'] }
);

export const getMixPortfolios = unstable_cache(
  async (limit?: number) => {
    return await prisma.portfolio.findMany({
      where: {
        isPublished: true,
        showOnMix: true,
        serviceCategory: { not: "オリジナル楽曲制作" }, // 念のためカテゴリでも絞る
      },
      orderBy: { orderIndex: 'asc' },
      ...(limit ? { take: limit } : {}),
    });
  },
  ['mix-portfolios'],
  { revalidate: 60, tags: ['portfolios'] }
);

export const getOriginalPortfolios = unstable_cache(
  async (limit?: number) => {
    return await prisma.portfolio.findMany({
      where: {
        isPublished: true,
        showOnOriginal: true,
        serviceCategory: "オリジナル楽曲制作",
      },
      orderBy: { orderIndex: 'asc' },
      ...(limit ? { take: limit } : {}),
    });
  },
  ['original-portfolios'],
  { revalidate: 60, tags: ['portfolios'] }
);

// ---------------------------------------------------------
// FAQ (よくある質問)
// ---------------------------------------------------------
export const getFAQs = unstable_cache(
  async (category?: string) => {
    return await prisma.fAQ.findMany({
      where: {
        isPublished: true,
        ...(category ? { category: { in: [category, "COMMON"] } } : {}),
      },
      orderBy: { orderIndex: 'asc' },
    });
  },
  ['faqs'],
  { revalidate: 60, tags: ['faqs'] }
);

// ---------------------------------------------------------
// Review (お客様の声)
// ---------------------------------------------------------
export const getReviews = unstable_cache(
  async (limit?: number) => {
    return await prisma.review.findMany({
      where: { isPublished: true },
      orderBy: { orderIndex: 'asc' },
      ...(limit ? { take: limit } : {}),
    });
  },
  ['reviews'],
  { revalidate: 60, tags: ['reviews'] }
);

// ---------------------------------------------------------
// Post (ニュース・ブログ)
// ---------------------------------------------------------
export const getNewsPosts = unstable_cache(
  async (limit?: number) => {
    return await prisma.post.findMany({
      where: { type: "NEWS", published: true },
      orderBy: { createdAt: 'desc' },
      ...(limit ? { take: limit } : {}),
    });
  },
  ['news-posts'],
  { revalidate: 60, tags: ['news'] }
);

export const getBlogPosts = unstable_cache(
  async (category?: string, limit?: number) => {
    return await prisma.post.findMany({
      where: { 
        type: "BLOG", 
        published: true,
        ...(category ? { category } : {})
      },
      orderBy: { createdAt: 'desc' },
      ...(limit ? { take: limit } : {}),
    });
  },
  ['blog-posts'],
  { revalidate: 60, tags: ['blog'] }
);

export const getAllPublishedPosts = unstable_cache(
  async () => {
    return await prisma.post.findMany({
      where: { published: true },
      select: { id: true, updatedAt: true },
    });
  },
  ['all-published-posts'],
  { revalidate: 60, tags: ['blog', 'news'] }
);

export const getPostById = unstable_cache(
  async (id: string) => {
    return await prisma.post.findUnique({
      where: { id, published: true }
    });
  },
  ['post-by-id'],
  { revalidate: 60, tags: ['blog', 'news'] }
);

export const getRelatedPosts = unstable_cache(
  async (category: string | null, excludeId: string, limit: number = 3) => {
    return await prisma.post.findMany({
      where: {
        type: "BLOG",
        published: true,
        category: category,
        id: { not: excludeId }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  },
  ['related-posts'],
  { revalidate: 60, tags: ['blog'] }
);

export const getBlogCategories = unstable_cache(
  async () => {
    const posts = await prisma.post.findMany({
      where: { type: "BLOG", published: true },
      select: { category: true },
    });
    return Array.from(new Set(posts.map(p => p.category).filter(Boolean))) as string[];
  },
  ['blog-categories'],
  { revalidate: 60, tags: ['blog'] }
);

// ---------------------------------------------------------
// Campaign (キャンペーン・セール情報)
// ---------------------------------------------------------
export const getCampaigns = unstable_cache(
  async (activeOnly = true) => {
    return await prisma.campaign.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  },
  ['campaigns'],
  { revalidate: 60, tags: ['campaigns'] }
);
