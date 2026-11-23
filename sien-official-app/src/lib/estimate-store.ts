import { createHash, randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { ApiError, textField } from "./api-input";
import { sameEstimateClient, validateEstimate } from "./estimates";

export function estimateOrderIds(value: unknown) {
  if (!Array.isArray(value) || !value.length || value.length > 100 || value.some(id => typeof id !== "string" || !id || id.length > 100) || new Set(value).size !== value.length) throw new ApiError(400, "依頼は1〜100件、重複なしで選択してください。");
  return value as string[];
}
export async function loadEstimateOrders(ids: string[], db: Pick<Prisma.TransactionClient, "order"> = prisma) {
  const orders = await db.order.findMany({ where: { id: { in: ids } } });
  if (orders.length !== ids.length) throw new ApiError(404, "選択した依頼が見つかりません。");
  if (!sameEstimateClient(orders)) throw new ApiError(400, "同じクライアント・顧客区分の依頼だけをまとめられます。氏名・メール・会社名・テスト区分を確認してください。");
  return ids.map(id => orders.find(order => order.id === id)!);
}
export async function saveEstimate(body: Record<string, unknown>) {
  let content;
  try { content = validateEstimate(body.content); } catch (error) { throw new ApiError(400, error instanceof Error ? error.message : "入力内容を確認してください。"); }
  const ids = estimateOrderIds(body.orderIds).sort();
  if (content.lines.some(line => !ids.includes(line.orderId)) || ids.some(id => !content.lines.some(line => line.orderId === id && line.kind === "BASE"))) throw new ApiError(400, "選択した各依頼の基本料金を残してください。対象外の依頼は追加できません。");
  const previousId = textField(body, "previousId", false, 100) || null;
  const requestKey = textField(body, "requestKey", true, 80);
  if (!/^[a-zA-Z0-9-]{16,80}$/.test(requestKey)) throw new ApiError(400, "保存キーが無効です。");
  const payloadHash = createHash("sha256").update(JSON.stringify({ content, ids, previousId })).digest("hex");
  return prisma.$transaction(async tx => {
    // Serializes identical retries; unique series/revision also arbitrates editors.
    const lock = BigInt.asIntN(64, BigInt(`0x${createHash("sha256").update(requestKey).digest("hex").slice(0, 16)}`));
    await tx.$queryRaw`SELECT 1 AS locked FROM pg_advisory_xact_lock(${lock})`;
    const existing = await tx.estimate.findUnique({ where: { requestKey } });
    if (existing) {
      if (existing.payloadHash !== payloadHash) throw new ApiError(409, "直前の保存は完了しています。保存済み一覧を確認し、新しい画面で変更してください。");
      return existing;
    }
    await loadEstimateOrders(ids, tx);
    const previous = previousId ? await tx.estimate.findUnique({ where: { id: previousId }, include: { orders: true } }) : null;
    if (previousId && !previous) throw new ApiError(404, "改訂元が見つかりません。");
    if (previous && (previous.orders.map(link => link.orderId).sort().join("\n") !== ids.join("\n"))) throw new ApiError(400, "改訂時の対象依頼は変更できません。複製して作成してください。");
    if (previous && await tx.estimate.findFirst({ where: { seriesId: previous.seriesId, revision: { gt: previous.revision } } })) throw new ApiError(409, "新版があります。保存済み一覧から最新版を開いて改訂してください。");
    return tx.estimate.create({ data: { seriesId: previous?.seriesId ?? randomUUID(), revision: (previous?.revision ?? 0) + 1, previousId, requestKey, payloadHash, content: content as unknown as Prisma.InputJsonValue, orders: { create: ids.map(orderId => ({ orderId })) } } });
  }, { timeout: 15000 });
}
