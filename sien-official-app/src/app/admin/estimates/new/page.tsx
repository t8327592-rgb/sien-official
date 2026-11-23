import { randomUUID } from "node:crypto";
import { requireAdminPage } from "@/lib/admin-page-auth";
import { prisma } from "@/lib/prisma";
import { estimateOrderIds, loadEstimateOrders } from "@/lib/estimate-store";
import { createEstimateDraft } from "@/lib/estimate-draft";
import { japanDay, validateEstimate } from "@/lib/estimates";
import { EstimateEditor } from "@/components/admin/EstimateEditor";
import { ApiError } from "@/lib/api-input";
import Link from "next/link";

export const dynamic = "force-dynamic";
export default async function NewEstimatePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdminPage();
  const params = await searchParams;
  const now = new Date();
  const number = `EST-${japanDay(now).replaceAll("-", "")}-${randomUUID().slice(0, 8).toUpperCase()}`;
  let draft;
  try {
    if (typeof params.copy === "string") {
      const original = await prisma.estimate.findUnique({ where: { id: params.copy }, include: { orders: true } });
      if (!original) throw new Error("複製元が見つかりません。");
      const ids = original.orders.map(link => link.orderId);
      await loadEstimateOrders(ids);
      const content = validateEstimate(original.content);
      draft = { content: { ...content, number, issuedOn: japanDay(now), validUntil: japanDay(new Date(now.getTime() + 30 * 86400000)), message: "" }, orderIds: ids, warnings: ["複製元の料金と割引を引き継いでいます。現在の条件と有効期限を確認してください。"] };
    } else {
      const ids = estimateOrderIds(typeof params.orders === "string" ? params.orders.split(",") : []);
      const orders = await loadEstimateOrders(ids);
      const [plans, receipts] = await Promise.all([
        prisma.plan.findMany(),
        prisma.submissionReceipt.findMany({ where: { entityType: "ORDER", entityId: { in: ids } }, select: { entityId: true, quote: true } }),
      ]);
      draft = { ...createEstimateDraft(orders, plans, receipts, number, now), orderIds: ids };
    }
  } catch (error) {
    return <div className="space-y-4"><h1 className="text-2xl font-bold">見積書を作成できませんでした</h1><p role="alert">{error instanceof ApiError || error instanceof Error && !("code" in error) ? error.message : "依頼情報を取得できませんでした。時間をおいて再試行してください。"}</p><Link className="underline" href="/admin/orders">依頼一覧に戻る</Link></div>;
  }
  return <EstimateEditor initial={draft.content} orderIds={draft.orderIds} warnings={draft.warnings} />;
}
