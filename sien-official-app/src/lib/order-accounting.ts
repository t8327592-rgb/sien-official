import { accountingParts } from "./admin-finance";

export type AccountingPayment = {
  id: string; kind: string; amount: number; fee: number; withholding: number;
  paidAt: Date | string; voidedAt: Date | string | null;
};
export type AccountingOrder = {
  id: string; status: string; isTest: boolean; confirmedPrice: number | null;
  revenueAt: Date | string | null; payments: AccountingPayment[];
};
export const signedCash = (p: AccountingPayment) => (p.kind === "REFUND" ? -1 : 1) * p.amount;
export const settledAmount = (p: AccountingPayment) => signedCash(p) + (p.kind === "REFUND" ? 0 : p.fee + p.withholding);
export const activePayments = (order: AccountingOrder) => order.payments.filter(p => !p.voidedAt);
export const isRevenue = (order: AccountingOrder) => !order.isTest && !["CANCELED", "CANCELLED"].includes(order.status) && order.confirmedPrice !== null && order.revenueAt !== null;

export function accountingSummary(orders: AccountingOrder[], year: number) {
  const months = Array.from({ length: 12 }, (_, month) => ({ month, revenue: 0, cash: 0, count: 0, average: null as number | null }));
  for (const order of orders) {
    if (order.isTest) continue;
    if (isRevenue(order)) {
      const d = accountingParts(order.revenueAt!);
      if (d.year === year) { months[d.month].revenue += order.confirmedPrice!; months[d.month].count++; }
    }
    // Actual money is retained even for canceled orders, net of recorded refunds.
    for (const payment of activePayments(order)) {
      const d = accountingParts(payment.paidAt);
      if (d.year === year) months[d.month].cash += signedCash(payment);
    }
  }
  for (const month of months) month.average = month.count ? month.revenue / month.count : null;
  const revenue = months.reduce((s, m) => s + m.revenue, 0);
  const count = months.reduce((s, m) => s + m.count, 0);
  return { months, revenue, count, average: count ? revenue / count : null, cash: months.reduce((s, m) => s + m.cash, 0) };
}

export function percentChange(current: number, previous: number): number | null {
  return previous === 0 ? null : (current - previous) / Math.abs(previous) * 100;
}
