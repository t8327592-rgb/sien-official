import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

// Reading public reception information must never create a database record.
// Authenticated settings actions initialize the record when an admin saves.
export async function getSiteSetting() {
  const setting = await prisma.siteSetting.findUnique({
    where: { id: "default" },
    select: { acceptingOrders: true, orderStatus: true, announcement: true },
  });
  return setting ?? {
    acceptingOrders: false,
    orderStatus: "UNAVAILABLE",
    announcement: "受付状況を確認中です。無料相談からお問い合わせください。",
  };
}

export const getPublicReception = unstable_cache(getSiteSetting, ["public-reception"], { revalidate: 60, tags: ["site-settings"] });
