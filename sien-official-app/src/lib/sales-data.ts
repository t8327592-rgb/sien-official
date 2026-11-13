import { createHash } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { accountingDateInput } from "@/lib/admin-finance";
import type { SalesData, SalesDirect, SalesPx } from "@/lib/sales-dashboard";

const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
type Reader = Pick<Prisma.TransactionClient, "order" | "pxEntry" | "salesReview" | "salesPxAccounting">;

export async function loadSalesData(db?: Reader): Promise<SalesData> {
  if (!db) return prisma.$transaction(tx => loadSalesData(tx), { isolationLevel: "RepeatableRead", timeout: 60000 });
  const [orders, entries, reviews, accounting] = await Promise.all([
    db.order.findMany({ where: { isTest: false }, include: { payments: { where: { voidedAt: null } } }, orderBy: { id: "asc" } }),
    db.pxEntry.findMany({ orderBy: [{ sentOn: "desc" }, { id: "asc" }] }),
    db.salesReview.findMany(), db.salesPxAccounting.findMany(),
  ]);
  const direct: SalesDirect[] = [];
  for (const o of orders) {
    const common = { orderId: o.id, clientName: o.companyName || o.clientName, songTitle: o.songTitle || "", customerType: o.customerType };
    if (!["CANCELED", "CANCELLED"].includes(o.status)) {
      const d = { ...common, id: o.id, kind: "SALE" as const, date: o.revenueAt ? accountingDateInput(o.revenueAt) : null, amount: o.confirmedPrice, fee: 0, withholding: 0, grossReference: o.confirmedPrice };
      direct.push({ ...d, hash: hash([d, o.financeVersion, o.status]) });
    }
    for (const p of o.payments) {
      const sign = p.kind === "REFUND" ? -1 : 1;
      const d = { ...common, id: p.id, kind: p.kind as "RECEIPT" | "REFUND", date: accountingDateInput(p.paidAt), amount: sign * p.amount, fee: sign * p.fee, withholding: sign * p.withholding, grossReference: p.amount + p.fee + p.withholding };
      direct.push({ ...d, hash: hash([d, p.kind, o.isTest]) });
    }
  }
  const dates = new Map(accounting.map(a => [a.pxEntryId, a]));
  const px: SalesPx[] = entries.map(e => {
    const sourceHash = hash([e.id, e.version, e.fingerprint, e.sentOn, e.clientName, e.songTitle, e.gross, e.fee, e.withholding, e.net, e.paymentStatus]);
    const a = dates.get(e.id);
    return { id: e.id, clientName: e.clientName, songTitle: e.songTitle, sentOn: e.sentOn, gross: e.gross, fee: e.fee, withholding: e.withholding, net: e.net, paymentStatus: e.paymentStatus,
      hash: sourceHash, revenueOn: a?.revenueOn || null, accountingVersion: a?.version || 0, accountingCurrent: !!a && a.sourceHash === sourceHash };
  });
  const convert = (mode: string) => reviews.filter(r => r.mode === mode).map(r => ({ directId: r.directId, pxEntryId: r.pxEntryId, status: r.status, amount: r.amount, fee: r.fee, withholding: r.withholding, sourceHash: r.sourceHash, reason: r.reason, version: r.version }));
  return { direct, px, cashReviews: convert("CASH"), revenueReviews: convert("REVENUE") };
}
