"use server";
import { requireAdmin } from "@/lib/auth";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updatePortfolio(id: string, data: any) {
  await requireAdmin();
  try {
    await prisma.portfolio.update({
      where: { id },
      data: {
        title: data.title,
        url: data.url,
        serviceCategory: data.serviceCategory,
        tags: data.tags,
        isFeatured: data.isFeatured,
        showOnMix: data.showOnMix,
        showOnOriginal: data.showOnOriginal,
        isPublished: data.isPublished !== undefined ? data.isPublished : undefined,
        orderIndex: data.orderIndex !== undefined ? parseInt(data.orderIndex) : undefined,
      },
    });
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

export async function createPortfolio(data: any) {
  await requireAdmin();
  try {
    const maxOrder = await prisma.portfolio.findFirst({
      orderBy: { orderIndex: 'desc' }
    });
    const nextOrder = maxOrder ? maxOrder.orderIndex + 1 : 0;

    const newPortfolio = await prisma.portfolio.create({
      data: {
        title: data.title || "新規実績",
        url: data.url || "",
        serviceCategory: data.serviceCategory || "MIX",
        tags: data.tags || "",
        isFeatured: data.isFeatured || false,
        showOnMix: data.showOnMix || false,
        showOnOriginal: data.showOnOriginal || false,
        isPublished: data.isPublished !== undefined ? data.isPublished : true,
        orderIndex: nextOrder,
      },
    });
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
    for (const item of orders) {
      await prisma.portfolio.update({
        where: { id: item.id },
        data: { orderIndex: item.orderIndex },
      });
    }
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
