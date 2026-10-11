export type RevenueMode = "created" | "delivered";

// アーカイブは一覧の表示設定であり、売上記録を除外する条件ではない。
export const REVENUE_ORDER_WHERE = { status: { notIn: ["CANCELED", "CANCELLED"] } };
export const DELIVERED_ORDER_WHERE = { status: "COMPLETED" };

export function revenueDate(order: { status: string; createdAt: Date | string; deliveredAt: Date | string | null }, mode: RevenueMode) {
  if (["CANCELED", "CANCELLED"].includes(order.status)) return null;
  if (mode === "delivered" && order.status !== "COMPLETED") return null;
  return mode === "created" ? order.createdAt : order.deliveredAt;
}

const JST_OFFSET = 9 * 60 * 60 * 1000;
export function accountingParts(value: Date | string = new Date()) {
  const date = new Date(new Date(value).getTime() + JST_OFFSET);
  return { year: date.getUTCFullYear(), month: date.getUTCMonth(), day: date.getUTCDate() };
}

export function accountingDate(year: number, month: number, day = 1) {
  return new Date(Date.UTC(year, month, day) - JST_OFFSET);
}
