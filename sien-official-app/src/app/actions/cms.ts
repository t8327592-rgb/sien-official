"use server";
import { invalidatePublicContent } from "@/lib/public-cache";
import { requireAdmin } from "@/lib/auth";

import { validateImageSource } from "@/lib/image-input";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { validateProfileContent, validateSiteContent, validateFAQContent, validateServiceContent, validateCampaignContent } from "@/lib/admin-content-input";
import { ApiError } from "@/lib/api-input";

// ---------------------------------------------------------
// Site Settings
// ---------------------------------------------------------
export async function updateSiteSettings(data: {
  twitterUrl?: string | null;
  youtubeUrl?: string | null;
  contactEmail?: string | null;
  ctaTitle?: string | null;
  ctaDescription?: string | null;
  footerText?: string | null;
}) {
  await requireAdmin();
  const safeData = validateSiteContent(data);
  const result = await prisma.siteSetting.upsert({
    where: { id: "default" },
    update: safeData,
    create: { id: "default", ...safeData },
  });
  invalidatePublicContent("site-settings");
  revalidatePath("/", "layout");
  return { success: true, data: result };
}

// ---------------------------------------------------------
// Profile
// ---------------------------------------------------------
export async function updateProfile(data: {
  name: string;
  title?: string | null;
  bioShort?: string | null;
  bioLong?: string | null;
  imageUrl?: string | null;
  achievements?: string | null;
}) {
  await requireAdmin();
  const safeData = { ...validateProfileContent(data), imageUrl: await validateImageSource(data.imageUrl) };
  const result = await prisma.profile.upsert({
    where: { id: "default" },
    update: safeData,
    create: { id: "default", ...safeData },
  });
  invalidatePublicContent("profile");
  revalidatePath("/", "layout");
  return { success: true, data: result };
}

// The screen has one Save button, so profile and site content must commit together.
export async function updateProfileAndSiteSettings(profile: Parameters<typeof updateProfile>[0], settings: Parameters<typeof updateSiteSettings>[0]) {
  await requireAdmin();
  try {
    const profileData = { ...validateProfileContent(profile), imageUrl: await validateImageSource(profile.imageUrl) };
    const siteData = validateSiteContent(settings);
    await prisma.$transaction(async tx => {
      await tx.profile.upsert({ where: { id: "default" }, update: profileData, create: { id: "default", ...profileData } });
      await tx.siteSetting.upsert({ where: { id: "default" }, update: siteData, create: { id: "default", ...siteData } });
    });
    invalidatePublicContent("profile", "site-settings");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof ApiError ? error.message : "保存できませんでした。再読み込みして保存状態を確認してください。" };
  }
}

// ---------------------------------------------------------
// FAQ
// ---------------------------------------------------------
export async function createFAQ(data: {
  question: string;
  answer: string;
  category: string;
  isPublished?: boolean;
  orderIndex?: number;
}) {
  await requireAdmin();
  const result = await prisma.fAQ.create({ data: validateFAQContent(data) });
  invalidatePublicContent("faqs");
  revalidatePath("/", "layout");
  return { success: true, data: result };
}

export async function updateFAQ(id: string, data: {
  question?: string;
  answer?: string;
  category?: string;
  isPublished?: boolean;
  orderIndex?: number;
}) {
  await requireAdmin();
  const current = await prisma.fAQ.findUnique({ where: { id } });
  if (!current) throw new ApiError(404, "FAQが見つかりません。");
  const safeData = validateFAQContent({ ...current, ...data });
  const result = await prisma.fAQ.update({ where: { id }, data: safeData });
  invalidatePublicContent("faqs");
  revalidatePath("/", "layout");
  return { success: true, data: result };
}

export async function deleteFAQ(id: string) {
  await requireAdmin();
  await prisma.fAQ.delete({ where: { id } });
  invalidatePublicContent("faqs");
  revalidatePath("/", "layout");
  return { success: true };
}

// ---------------------------------------------------------
// Service
// ---------------------------------------------------------
export async function createService(data: {
  name: string;
  category: string;
  description?: string | null;
  iconName?: string | null;
  features?: string | null;
  isPublished?: boolean;
  orderIndex?: number;
}) {
  await requireAdmin();
  const result = await prisma.service.create({ data: validateServiceContent(data) });
  invalidatePublicContent("services");
  revalidatePath("/", "layout");
  return { success: true, data: result };
}

export async function updateService(id: string, data: {
  name?: string;
  category?: string;
  description?: string | null;
  iconName?: string | null;
  features?: string | null;
  isPublished?: boolean;
  orderIndex?: number;
}) {
  await requireAdmin();
  const current = await prisma.service.findUnique({ where: { id } });
  if (!current) throw new ApiError(404, "サービスが見つかりません。");
  const safeData = validateServiceContent({ ...current, ...data });
  const result = await prisma.service.update({ where: { id }, data: safeData });
  invalidatePublicContent("services");
  revalidatePath("/", "layout");
  return { success: true, data: result };
}

export async function deleteService(id: string) {
  await requireAdmin();
  await prisma.service.delete({ where: { id } });
  invalidatePublicContent("services");
  revalidatePath("/", "layout");
  return { success: true };
}

// ---------------------------------------------------------
// Campaign
// ---------------------------------------------------------
export async function createCampaign(data: {
  name: string;
  targetPlanId?: string | null;
  originalPrice?: number | null;
  campaignPrice: number;
  startDate?: Date | null;
  endDate?: Date | null;
  isActive?: boolean;
  description?: string | null;
}) {
  await requireAdmin();
  const safeData = validateCampaignContent(data);
  if (safeData.targetPlanId && !await prisma.plan.findUnique({ where: { id: safeData.targetPlanId }, select: { id: true } })) throw new ApiError(400, "対象プランが見つかりません。");
  const result = await prisma.campaign.create({ data: safeData });
  invalidatePublicContent("campaigns", "plans");
  revalidatePath("/", "layout");
  return { success: true, data: result };
}

export async function updateCampaign(id: string, data: {
  name?: string;
  targetPlanId?: string | null;
  originalPrice?: number | null;
  campaignPrice?: number;
  startDate?: Date | null;
  endDate?: Date | null;
  isActive?: boolean;
  description?: string | null;
}) {
  await requireAdmin();
  const current = await prisma.campaign.findUnique({ where: { id } });
  if (!current) throw new ApiError(404, "キャンペーンが見つかりません。");
  const safeData = validateCampaignContent({ ...current, ...data });
  if (safeData.targetPlanId && !await prisma.plan.findUnique({ where: { id: safeData.targetPlanId }, select: { id: true } })) throw new ApiError(400, "対象プランが見つかりません。");
  const result = await prisma.campaign.update({ where: { id }, data: safeData });
  invalidatePublicContent("campaigns", "plans");
  revalidatePath("/", "layout");
  return { success: true, data: result };
}

export async function deleteCampaign(id: string) {
  await requireAdmin();
  await prisma.campaign.delete({ where: { id } });
  invalidatePublicContent("campaigns", "plans");
  revalidatePath("/", "layout");
  return { success: true };
}
