"use server";
import { requireAdmin } from "@/lib/auth";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * サイト設定を更新する
 */
export async function updateSiteSetting(data: {
  orderStatus?: string;
  announcement: string | null;
}) {
  await requireAdmin();
  const status = data.orderStatus || "AVAILABLE";
  const legacyAccepting = status !== "UNAVAILABLE";
  
  const setting = await prisma.siteSetting.upsert({
    where: { id: "default" },
    update: {
      orderStatus: status,
      acceptingOrders: legacyAccepting, // 旧バージョンとの互換性
      announcement: data.announcement,
    },
    create: {
      id: "default",
      orderStatus: status,
      acceptingOrders: legacyAccepting,
      announcement: data.announcement,
    },
  });

  // トップページと設定画面のキャッシュを無効化
  revalidatePath("/");
  revalidatePath("/admin/settings");

  return setting;
}
