"use server";
import { invalidatePublicContent } from "@/lib/public-cache";
import { requireAdmin } from "@/lib/auth";

import { validateImageSource } from "@/lib/image-input";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
  const result = await prisma.siteSetting.upsert({
    where: { id: "default" },
    update: data,
    create: { id: "default", ...data },
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
  const safeData = { ...data, imageUrl: await validateImageSource(data.imageUrl) };
  const result = await prisma.profile.upsert({
    where: { id: "default" },
    update: safeData,
    create: { id: "default", ...safeData },
  });
  invalidatePublicContent("profile");
  revalidatePath("/", "layout");
  return { success: true, data: result };
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
  const result = await prisma.fAQ.create({ data });
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
  const result = await prisma.fAQ.update({
    where: { id },
    data,
  });
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
  const result = await prisma.service.create({ data });
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
  const result = await prisma.service.update({
    where: { id },
    data,
  });
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
  const result = await prisma.campaign.create({ data });
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
  const result = await prisma.campaign.update({
    where: { id },
    data,
  });
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
