"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * サイト設定を取得する
 * レコードが存在しない場合はデフォルト値で作成する
 */
export async function getSiteSetting() {
  let setting = await prisma.siteSetting.findUnique({
    where: { id: "default" },
  });

  if (!setting) {
    setting = await prisma.siteSetting.create({
      data: {
        id: "default",
        orderStatus: "AVAILABLE",
        announcement: "現在、納品まで約3〜4週間いただいております。",
      },
    });
  }

  return setting;
}

/**
 * サイト設定を更新する
 */
export async function updateSiteSetting(data: {
  orderStatus?: string;
  announcement: string | null;
}) {
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
