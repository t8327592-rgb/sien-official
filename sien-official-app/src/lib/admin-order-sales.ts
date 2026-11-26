import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type OrderSale = {
  name: string;
  discount: number;
  normalTotal: number | null;
  price: number | null;
};

function object(value: Prisma.JsonValue | undefined) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function money(value: Prisma.JsonValue | undefined) {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? value : null;
}

export async function loadOrderSales(orderIds: string[]) {
  const sales: Partial<Record<string, OrderSale>> = {};
  if (!orderIds.length) return sales;

  const receipts = await prisma.submissionReceipt.findMany({
    where: { entityType: "ORDER", entityId: { in: orderIds } },
    select: { entityId: true, quote: true },
  });

  for (const { entityId, quote } of receipts) {
    const snapshot = object(quote);
    const sale = object(snapshot?.autumnSale);
    if (typeof sale?.name !== "string" || typeof sale.discount !== "number" || !Number.isFinite(sale.discount) || sale.discount <= 0 || sale.discount > 100) continue;

    sales[entityId] = {
      name: sale.name,
      discount: sale.discount,
      normalTotal: money(sale.normalTotal),
      price: money(snapshot?.price),
    };
  }
  return sales;
}
