import { prisma } from "@/lib/prisma";

// Reading public reception information must never create a database record.
// Authenticated settings actions initialize the record when an admin saves.
export async function getSiteSetting() {
  const setting = await prisma.siteSetting.findUnique({
    where: { id: "default" },
    select: { acceptingOrders: true, orderStatus: true, announcement: true },
  });
  return setting ?? {
    acceptingOrders: true,
    orderStatus: "AVAILABLE",
    announcement: "現在、納品まで約3〜4週間いただいております。",
  };
}
