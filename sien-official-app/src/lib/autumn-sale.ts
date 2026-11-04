import { autumnSale } from "@/config/autumn-sale";
import { prisma } from "@/lib/prisma";

export function saleClock() {
  // The existing isolated QA runner provides a memory-only DB and local SMTP capture.
  const override = process.env.NODE_ENV === "development" && process.env.QA_ISOLATED === "1"
    ? Date.parse(process.env.AUTUMN_SALE_QA_NOW || "")
    : NaN;
  return Number.isFinite(override) ? { now: override, preview: true } : { now: Date.now(), preview: false };
}

export const mixSalePlanFilter = { category: "MIX", isActive: true } as const;

export async function salePlans() {
  return prisma.plan.findMany({
    where: mixSalePlanFilter,
    select: { id: true, name: true, price: true },
    orderBy: { orderIndex: "asc" },
  });
}

export const saleCampaignSnapshot = {
  name: autumnSale.name,
  discount: autumnSale.discount,
  audioDueDay: autumnSale.audioDueDay,
  paymentAfterAudioReview: true,
};
