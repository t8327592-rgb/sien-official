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
        acceptingOrders: true,
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
  acceptingOrders: boolean;
  announcement: string | null;
}) {
  const setting = await prisma.siteSetting.upsert({
    where: { id: "default" },
    update: {
      acceptingOrders: data.acceptingOrders,
      announcement: data.announcement,
    },
    create: {
      id: "default",
      acceptingOrders: data.acceptingOrders,
      announcement: data.announcement,
    },
  });

  // トップページと設定画面のキャッシュを無効化
  revalidatePath("/");
  revalidatePath("/admin/settings");

  return setting;
}
