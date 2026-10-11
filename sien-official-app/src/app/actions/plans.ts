"use server";
import { invalidatePublicContent } from "@/lib/public-cache";
import { requireAdmin } from "@/lib/auth";

import type { PlanInput, OptionInput } from "@/lib/admin-types";
import { validatePlanContent, validateOptionContent } from "@/lib/admin-plan-input";
import { ApiError } from "@/lib/api-input";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- Plans ---

export async function updatePlan(id: string, data: PlanInput) {
  await requireAdmin();
  try {
    const updatedPlan = await prisma.plan.update({ where: { id }, data: validatePlanContent(data) });
    invalidatePublicContent("plans");
  revalidatePath("/admin/plans");
    revalidatePath("/mix");
    revalidatePath("/original");
    revalidatePath("/order");
    return { success: true, data: updatedPlan };
  } catch (error) {
    console.error("Plan/option operation failed");
    return { success: false, error: error instanceof ApiError ? error.message : "保存に失敗しました。" };
  }
}

export async function createPlan(data: PlanInput) {
  await requireAdmin();
  try {
    const maxOrder = await prisma.plan.findFirst({
      orderBy: { orderIndex: 'desc' }
    });
    const nextOrder = maxOrder ? maxOrder.orderIndex + 1 : 0;

    const newPlan = await prisma.plan.create({ data: { ...validatePlanContent(data), orderIndex: nextOrder } });
    invalidatePublicContent("plans");
  revalidatePath("/admin/plans");
    revalidatePath("/mix");
    revalidatePath("/original");
    revalidatePath("/order");
    return { success: true, data: newPlan };
  } catch (error) {
    console.error("Plan/option operation failed");
    return { success: false, error: error instanceof ApiError ? error.message : "保存に失敗しました。" };
  }
}

export async function deletePlan(id: string) {
  await requireAdmin();
  try {
    await prisma.plan.delete({ where: { id } });
    invalidatePublicContent("plans");
  revalidatePath("/admin/plans");
    revalidatePath("/mix");
    return { success: true };
  } catch {
    console.error("Plan/option operation failed");
    return { success: false, error: "Failed to delete plan" };
  }
}

export async function updatePlanOrders(orders: { id: string, orderIndex: number }[]) {
  await requireAdmin();
  try {
    for (const item of orders) {
      await prisma.plan.update({
        where: { id: item.id },
        data: { orderIndex: item.orderIndex },
      });
    }
    invalidatePublicContent("plans");
  revalidatePath("/admin/plans");
    revalidatePath("/mix");
    revalidatePath("/original");
    return { success: true };
  } catch {
    console.error("Plan/option operation failed");
    return { success: false, error: "Failed to update plan orders" };
  }
}

// --- Options ---

export async function updateOption(id: string, data: OptionInput) {
  await requireAdmin();
  try {
    const updatedOption = await prisma.option.update({ where: { id }, data: validateOptionContent(data) });
    invalidatePublicContent("options");
  revalidatePath("/admin/plans");
    revalidatePath("/mix");
    revalidatePath("/original");
    revalidatePath("/order");
    return { success: true, data: updatedOption };
  } catch (error) {
    console.error("Plan/option operation failed");
    return { success: false, error: error instanceof ApiError ? error.message : "保存に失敗しました。" };
  }
}

export async function createOption(data: OptionInput) {
  await requireAdmin();
  try {
    const maxOrder = await prisma.option.findFirst({
      orderBy: { orderIndex: 'desc' }
    });
    const nextOrder = maxOrder ? maxOrder.orderIndex + 1 : 0;

    const newOption = await prisma.option.create({ data: { ...validateOptionContent(data), orderIndex: nextOrder } });
    invalidatePublicContent("options");
  revalidatePath("/admin/plans");
    revalidatePath("/mix");
    revalidatePath("/original");
    revalidatePath("/order");
    return { success: true, data: newOption };
  } catch (error) {
    console.error("Plan/option operation failed");
    return { success: false, error: error instanceof ApiError ? error.message : "保存に失敗しました。" };
  }
}

export async function deleteOption(id: string) {
  await requireAdmin();
  try {
    await prisma.option.delete({ where: { id } });
    invalidatePublicContent("options");
  revalidatePath("/admin/plans");
    revalidatePath("/mix");
    return { success: true };
  } catch {
    console.error("Plan/option operation failed");
    return { success: false, error: "Failed to delete option" };
  }
}

export async function updateOptionOrders(orders: { id: string, orderIndex: number }[]) {
  await requireAdmin();
  try {
    for (const item of orders) {
      await prisma.option.update({
        where: { id: item.id },
        data: { orderIndex: item.orderIndex },
      });
    }
    invalidatePublicContent("options");
  revalidatePath("/admin/plans");
    revalidatePath("/mix");
    revalidatePath("/original");
    return { success: true };
  } catch {
    console.error("Plan/option operation failed");
    return { success: false, error: "Failed to update option orders" };
  }
}
