import type { Order, Prisma } from "@prisma/client";
import { accountingDate, accountingParts } from "./admin-finance";

export type RevenueOption = { id: string; name: string; amount: number };
export type RevenueAdjustment = { extra: number; options: RevenueOption[] };

export function readRevenueAdjustment(value: Prisma.JsonValue): RevenueAdjustment {
  if (!value || typeof value !== "object" || Array.isArray(value) || typeof value.extra !== "number" || !Array.isArray(value.options)) {
    return { extra: 0, options: [] };
  }
  const options = value.options.flatMap(option => {
    if (!option || typeof option !== "object" || Array.isArray(option) || typeof option.id !== "string" || typeof option.name !== "string" || typeof option.amount !== "number") return [];
    return [{ id: option.id, name: option.name, amount: option.amount }];
  });
  return { extra: value.extra, options };
}

export function adjustmentAmount(adjustment: RevenueAdjustment) {
  return adjustment.options.reduce((total, option) => total + option.amount, adjustment.extra);
}

export function priceWithAdjustment(order: Pick<Order, "price" | "confirmedPrice" | "revenueAdjustment">, adjustment: RevenueAdjustment) {
  const previous = adjustmentAmount(readRevenueAdjustment(order.revenueAdjustment));
  const base = order.confirmedPrice === null ? order.price : order.confirmedPrice - previous;
  return base === null ? null : base + adjustmentAmount(adjustment);
}

export function fixedRevenueOptions(order: Pick<Order, "options">, options: { id: string; name: string; priceText: string }[]): RevenueOption[] {
  const bookedOptions = order.options?.split(", ") ?? [];
  return options.flatMap(option => {
    if (option.name.includes("エンコード") || bookedOptions.some(booked => booked === option.name || booked.startsWith(`${option.name} (`))) return [];
    const fixed = option.priceText.normalize("NFKC").trim().match(/^(?:\+\s*)?(?:¥\s*)?(\d+|\d{1,3}(?:,\d{3})+)\s*(?:円)?$/);
    const amount = fixed ? Number(fixed[1].replaceAll(",", "")) : 0;
    return amount > 0 && amount <= 2147483647 ? [{ id: option.id, name: option.name, amount }] : [];
  });
}

export function revenueAtDelivery(order: Pick<Order, "isTest" | "revenueOnHold" | "revenueAt" | "confirmedPrice" | "price" | "revenueAdjustment">, deliveredAt: Date) {
  if (order.isTest || order.revenueOnHold || order.revenueAt) return null;
  const confirmedPrice = order.confirmedPrice ?? (order.price === null ? null : order.price + adjustmentAmount(readRevenueAdjustment(order.revenueAdjustment)));
  if (confirmedPrice === null || confirmedPrice > 2147483647) return null;
  const { year, month, day } = accountingParts(deliveredAt);
  return { confirmedPrice, revenueAt: accountingDate(year, month, day) };
}
