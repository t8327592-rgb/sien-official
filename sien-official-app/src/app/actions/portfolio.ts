"use server";
import { invalidatePublicContent } from "@/lib/public-cache";
import { requireAdmin } from "@/lib/auth";

import type { PortfolioInput } from "@/lib/admin-types";
import { prisma } from "@/lib/prisma";
import { validateOrderSequence, adminWebUrl, adminText, adminBoolean, adminInteger } from "@/lib/admin-content-input";
import { revalidatePath } from "next/cache";

export async function updatePortfolio(id: string, data: PortfolioInput) {
  await requireAdmin();
  try {
    await prisma.portfolio.update({
      where: { id },
      data: {
        title: data.title === undefined ? undefined : adminText(data.title, "タイトル", 300, true),
        url: data.url === undefined ? undefined : adminWebUrl(data.url, "実績のURL"),
        serviceCategory: data.serviceCategory,
        tags: data.tags,
        isFeatured: data.isFeatured,
        showOnMix: data.showOnMix,
        showOnOriginal: data.showOnOriginal,
        isPublished: data.isPublished !== undefined ? adminBoolean(data.isPublished) : undefined,
        orderIndex: data.orderIndex !== undefined ? adminInteger(Number(data.orderIndex)) : undefined,
      },
    });
    invalidatePublicContent("portfolios");
  revalidatePath("/admin/portfolio");
    revalidatePath("/works");
    revalidatePath("/");
    revalidatePath("/mix");
    revalidatePath("/original");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update portfolio" };
  }
}

export async function createPortfolio(data: PortfolioInput) {
  await requireAdmin();
  try {
    const maxOrder = await prisma.portfolio.findFirst({
      orderBy: { orderIndex: 'desc' }
    });
    const nextOrder = maxOrder ? maxOrder.orderIndex + 1 : 0;

    const newPortfolio = await prisma.portfolio.create({
      data: {
        title: adminText(data.title || "新規実績", "タイトル", 300, true),
        url: adminWebUrl(data.url, "実績のURL"),
        serviceCategory: data.serviceCategory || "MIX",
        tags: data.tags || "",
        isFeatured: data.isFeatured || false,
        showOnMix: data.showOnMix || false,
        showOnOriginal: data.showOnOriginal || false,
        isPublished: adminBoolean(data.isPublished, false),
        orderIndex: nextOrder,
      },
    });
    invalidatePublicContent("portfolios");
  revalidatePath("/admin/portfolio");
    revalidatePath("/works");
    revalidatePath("/");
    revalidatePath("/mix");
    revalidatePath("/original");
    return { success: true, data: newPortfolio };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to create portfolio" };
  }
}

export async function deletePortfolio(id: string) {
  await requireAdmin();
  try {
    await prisma.portfolio.delete({ where: { id } });
    invalidatePublicContent("portfolios");
  revalidatePath("/admin/portfolio");
    revalidatePath("/works");
    revalidatePath("/");
    revalidatePath("/mix");
    revalidatePath("/original");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to delete portfolio" };
  }
}

export async function updatePortfolioOrders(orders: { id: string, orderIndex: number }[]) {
  await requireAdmin();
  try {
    const sequence = validateOrderSequence(orders);
    await prisma.$transaction(async tx => {
      for (const item of sequence) await tx.portfolio.update({ where: { id: item.id }, data: { orderIndex: item.orderIndex } });
    });
    invalidatePublicContent("portfolios");
  revalidatePath("/admin/portfolio");
    revalidatePath("/works");
    revalidatePath("/");
    revalidatePath("/mix");
    revalidatePath("/original");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update portfolio orders" };
  }
}

// 一括削除
export async function bulkDeletePortfolio(ids: string[]) {
  await requireAdmin();
  try {
    await prisma.portfolio.deleteMany({
      where: { id: { in: ids } },
    });
    invalidatePublicContent("portfolios");
  revalidatePath("/admin/portfolio");
    revalidatePath("/works");
    revalidatePath("/");
    revalidatePath("/mix");
    revalidatePath("/original");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to bulk delete portfolio" };
  }
}

// 一括公開設定
export async function bulkUpdatePublishStatus(ids: string[], isPublished: boolean) {
  await requireAdmin();
  try {
    await prisma.portfolio.updateMany({
      where: { id: { in: ids } },
      data: { isPublished },
    });
    invalidatePublicContent("portfolios");
  revalidatePath("/admin/portfolio");
    revalidatePath("/works");
    revalidatePath("/");
    revalidatePath("/mix");
    revalidatePath("/original");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to bulk update status" };
  }
}
