"use server";
import { invalidatePublicContent } from "@/lib/public-cache";
import { requireAdmin } from "@/lib/auth";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { validateReception } from "@/lib/admin-content-input";
import { ApiError } from "@/lib/api-input";

/**
 * サイト設定を更新する
 */
export async function updateSiteSetting(data: {
  orderStatus?: string;
  announcement: string | null;
}) {
  await requireAdmin();
  try {
    const safeData = validateReception(data);

    const setting = await prisma.siteSetting.upsert({
      where: { id: "default" },
      update: safeData,
      create: {
        id: "default",
        ...safeData,
      },
    });

    // トップページと設定画面のキャッシュを無効化
    invalidatePublicContent("site-settings");
    revalidatePath("/");
    revalidatePath("/admin/settings");

    return { success: true, setting };
  } catch (error) {
    return { success: false, error: error instanceof ApiError ? error.message : "設定を保存できませんでした。再読み込みして保存状態を確認してください。" };
  }
}
