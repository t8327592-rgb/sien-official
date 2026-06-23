"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- Plans ---

export async function updatePlan(id: string, data: any) {
  try {
    await prisma.plan.update({
      where: { id },
      data: {
        name: data.name,
        category: data.category,
        price: data.price ? parseInt(data.price) : null,
        description: data.description,
        period: data.period,
        revisions: data.revisions,
        orderIndex: data.orderIndex !== undefined ? parseInt(data.orderIndex) : undefined,
      },
    });
    revalidatePath("/admin/plans");
    revalidatePath("/mix");
    revalidatePath("/original");
    revalidatePath("/order");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update plan" };
  }
}

export async function createPlan(data: any) {
  try {
    const maxOrder = await prisma.plan.findFirst({
      orderBy: { orderIndex: 'desc' }
    });
    const nextOrder = maxOrder ? maxOrder.orderIndex + 1 : 0;

    const newPlan = await prisma.plan.create({
      data: {
        name: data.name || "新規プラン",
        category: data.category || "MIX",
        price: data.price ? parseInt(data.price) : null,
        description: data.description || "",
        period: data.period || "",
        revisions: data.revisions || "",
        isActive: true,
        orderIndex: nextOrder,
      },
    });
    revalidatePath("/admin/plans");
    revalidatePath("/mix");
    revalidatePath("/original");
    revalidatePath("/order");
    return { success: true, data: newPlan };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to create plan" };
  }
}

export async function deletePlan(id: string) {
  try {
    await prisma.plan.delete({ where: { id } });
    revalidatePath("/admin/plans");
    revalidatePath("/mix");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to delete plan" };
  }
}

export async function updatePlanOrders(orders: { id: string, orderIndex: number }[]) {
  try {
    for (const item of orders) {
      await prisma.plan.update({
        where: { id: item.id },
        data: { orderIndex: item.orderIndex },
      });
    }
    revalidatePath("/admin/plans");
    revalidatePath("/mix");
    revalidatePath("/original");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update plan orders" };
  }
}

// --- Options ---

export async function updateOption(id: string, data: any) {
  try {
    await prisma.option.update({
      where: { id },
      data: {
        name: data.name,
        priceText: data.priceText,
        description: data.description,
        orderIndex: data.orderIndex !== undefined ? parseInt(data.orderIndex) : undefined,
      },
    });
    revalidatePath("/admin/plans");
    revalidatePath("/mix");
    revalidatePath("/original");
    revalidatePath("/order");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update option" };
  }
}

export async function createOption(data: any) {
  try {
    const maxOrder = await prisma.option.findFirst({
      orderBy: { orderIndex: 'desc' }
    });
    const nextOrder = maxOrder ? maxOrder.orderIndex + 1 : 0;

    const newOption = await prisma.option.create({
      data: {
        name: data.name || "新規オプション",
        priceText: data.priceText || "要相談",
        description: data.description || "",
        isActive: true,
        orderIndex: nextOrder,
      },
    });
    revalidatePath("/admin/plans");
    revalidatePath("/mix");
    revalidatePath("/original");
    revalidatePath("/order");
    return { success: true, data: newOption };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to create option" };
  }
}

export async function deleteOption(id: string) {
  try {
    await prisma.option.delete({ where: { id } });
    revalidatePath("/admin/plans");
    revalidatePath("/mix");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to delete option" };
  }
}

export async function updateOptionOrders(orders: { id: string, orderIndex: number }[]) {
  try {
    for (const item of orders) {
      await prisma.option.update({
        where: { id: item.id },
        data: { orderIndex: item.orderIndex },
      });
    }
    revalidatePath("/admin/plans");
    revalidatePath("/mix");
    revalidatePath("/original");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update option orders" };
  }
}
