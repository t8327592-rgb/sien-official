import { isAdminRequest } from "@/lib/admin-api-auth";
import { prisma } from "@/lib/prisma";
import { ApiError, apiErrorResponse, readJson } from "@/lib/api-input";
import { financeDate, financeMoney, financeText, financeVersion } from "@/lib/order-finance-input";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest(request))) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const body = await readJson(request);
    const expectedVersion = financeVersion(body.version);
    const result = await prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(hashtextextended(${`order-finance:${id}`}, 0))`;
      const order = await tx.order.findUnique({ where: { id }, include: { payments: { orderBy: { createdAt: "desc" } } } });
      if (!order) throw new ApiError(404, "依頼が見つかりません。");
      const conflict = () => { throw new ApiError(409, "別の更新がありました。再読み込みしてから保存してください。"); };
      if (body.action === "payment") {
        const requestKey = financeText(body.requestKey, 100, true);
        if (!/^[a-zA-Z0-9_-]{16,100}$/.test(requestKey)) throw new ApiError(400, "登録キーを確認してください。");
        const amount = financeMoney(body.amount)!;
        const fee = financeMoney(body.fee)!;
        const withholding = financeMoney(body.withholding)!;
        const paidAt = financeDate(body.paidAt)!;
        const memo = financeText(body.memo ?? "", 1000) || null;
        if (!["RECEIPT", "REFUND"].includes(String(body.kind)) || amount + fee + withholding === 0 || amount + fee + withholding > 2147483647 || (body.kind === "REFUND" && (fee || withholding))) throw new ApiError(400, "入金・返金の金額を確認してください。");
        const data = { orderId: id, requestKey, kind: body.kind as string, amount, fee, withholding, paidAt, memo };
        const existing = await tx.paymentRecord.findUnique({ where: { requestKey } });
        if (existing) {
          if (existing.orderId !== id || existing.kind !== data.kind || existing.amount !== amount || existing.fee !== fee || existing.withholding !== withholding || existing.paidAt.getTime() !== paidAt.getTime() || existing.memo !== memo) conflict();
          return order; // A retried request never creates a second payment.
        }
        if (order.financeVersion !== expectedVersion) conflict();
        await tx.paymentRecord.create({ data });
      } else if (body.action === "void") {
        const paymentId = financeText(body.paymentId, 100, true);
        const reason = financeText(body.reason, 500, true);
        const payment = order.payments.find(p => p.id === paymentId);
        if (!payment) throw new ApiError(404, "入金記録が見つかりません。");
        if (payment.voidedAt) return order;
        if (order.financeVersion !== expectedVersion) conflict();
        await tx.paymentRecord.update({ where: { id: paymentId }, data: { voidedAt: new Date(), voidReason: reason } });
      } else if (body.action === "confirm") {
        if (order.financeVersion !== expectedVersion) conflict();
        const confirmedPrice = financeMoney(body.confirmedPrice, true);
        const revenueAt = financeDate(body.revenueAt, true);
        if (confirmedPrice === null && revenueAt !== null) throw new ApiError(400, "売上計上日には確定金額が必要です。");
        await tx.order.update({ where: { id }, data: { confirmedPrice, revenueAt, confirmedAt: confirmedPrice === null ? null : new Date() } });
      } else if (body.action === "classify") {
        if (order.financeVersion !== expectedVersion) conflict();
        if (typeof body.isTest !== "boolean") throw new ApiError(400, "テスト区分を確認してください。");
        await tx.order.update({ where: { id }, data: { isTest: body.isTest } });
      } else throw new ApiError(400, "操作を確認してください。");
      return tx.order.update({ where: { id }, data: { financeVersion: { increment: 1 } }, include: { payments: { orderBy: { createdAt: "desc" } } } });
    });
    return Response.json({ success: true, order: result });
  } catch (error) {
    return apiErrorResponse(error) ?? Response.json({ success: false, error: "保存できませんでした。再読み込みして記録をご確認ください。" }, { status: 500 });
  }
}
