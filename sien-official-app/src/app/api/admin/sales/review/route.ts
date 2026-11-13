import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/admin-api-auth";
import { ApiError, apiErrorResponse, readJson, textField } from "@/lib/api-input";
import { financeDate, financeMoney, financeVersion } from "@/lib/order-finance-input";
import { loadSalesData } from "@/lib/sales-data";
import { buildSalesState, salesPairHash, type SalesMode } from "@/lib/sales-dashboard";

export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const b = await readJson(request);
    const action = textField(b, "action", true, 20), pxEntryId = textField(b, "pxEntryId", true, 100);
    const reason = textField(b, "reason", true, 1000), version = financeVersion(b.version);
    const sourceHash = textField(b, "sourceHash", true, 1000);
    if (!["px-date", "review"].includes(action) || b.confirmed !== true) throw new ApiError(400, "確認内容に同意してください。");
    await prisma.$transaction(async tx => {
      // Also serializes with CSV imports. All metadata writers acquire locks in this order.
      await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(hashtextextended('pxstudio-import-v1', 0))`;
      const directId = action === "review" ? textField(b, "directId", true, 100) : "";
      if (directId) {
        const orderId = b.mode === "CASH" ? (await tx.paymentRecord.findUnique({ where: { id: directId }, select: { orderId: true } }))?.orderId : directId;
        if (!orderId) throw new ApiError(409, "対象の入金が見つかりません。");
        await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(hashtextextended(${`order-finance:${orderId}`}, 0))`;
      }
      const data = await loadSalesData(tx), px = data.px.find(p => p.id === pxEntryId);
      if (!px) throw new ApiError(409, "対象のCSV明細が見つかりません。");
      if (action === "px-date") {
        if (px.hash !== sourceHash || px.accountingVersion !== version) throw new ApiError(409, "明細が更新されています。再読み込みしてください。");
        financeDate(b.revenueOn, true);
        const before = await tx.salesPxAccounting.findUnique({ where: { pxEntryId } });
        const values = { revenueOn: b.revenueOn as string | null, sourceHash, reason };
        const after = await tx.salesPxAccounting.upsert({ where: { pxEntryId }, create: { pxEntryId, ...values }, update: { ...values, version: { increment: 1 } } });
        await tx.salesReviewAudit.create({ data: { entityKind: "PX_DATE", entityKey: pxEntryId, ...(before ? { before: JSON.parse(JSON.stringify(before)) } : {}), after: JSON.parse(JSON.stringify(after)), reason } });
        return;
      }
      if (b.mode !== "CASH" && b.mode !== "REVENUE") throw new ApiError(400, "集計基準を確認してください。");
      const mode: SalesMode = b.mode;
      const direct = data.direct.find(d => d.id === directId && (mode === "CASH" ? d.kind === "RECEIPT" : d.kind === "SALE" && d.amount !== null && !!d.date));
      if (!direct) throw new ApiError(409, "対象の入金・売上は確認できません。");
      const key = { mode, directId, pxEntryId };
      const before = await tx.salesReview.findUnique({ where: { mode_directId_pxEntryId: key } });
      if (salesPairHash(mode, direct, px) !== sourceHash || (before?.version || 0) !== version) throw new ApiError(409, "明細または確認結果が更新されています。再読み込みしてください。");
      const status = textField(b, "status", true, 20);
      if (!["PENDING", "DISTINCT", "DUPLICATE"].includes(status)) throw new ApiError(400, "判定を確認してください。");
      const amount = financeMoney(b.amount)!, fee = financeMoney(b.fee)!, withholding = financeMoney(b.withholding)!;
      if (status !== "DUPLICATE" && (amount || fee || withholding)) throw new ApiError(400, "重複以外には除外額を指定できません。");
      if (mode === "REVENUE" && (fee || withholding)) throw new ApiError(400, "売上基準では制作費のみ指定してください。");
      if (status === "DUPLICATE" && (amount + fee + withholding === 0 || (mode === "CASH" ? px.paymentStatus !== "送金済み" : !px.revenueOn || !px.accountingCurrent))) throw new ApiError(400, "除外額と送金・計上日の確認が必要です。");
      const review = { ...key, status, amount, fee, withholding, sourceHash, reason, version: version + 1 };
      const list = mode === "CASH" ? "cashReviews" : "revenueReviews";
      const next = { ...data, [list]: [...data[list].filter(r => !(r.directId === directId && r.pxEntryId === pxEntryId)), review] };
      const pairs = buildSalesState(next, mode).pairs;
      if (status === "DUPLICATE" && pairs.find(p => p.direct.id === directId && p.px.id === pxEntryId)?.state !== "DUPLICATE") throw new ApiError(400, "割当額の合計が元明細を超えています。既存の重複判定も確認してください。");
      const values = { status, amount, fee, withholding, sourceHash, reason };
      const after = await tx.salesReview.upsert({ where: { mode_directId_pxEntryId: key }, create: { ...key, ...values }, update: { ...values, version: { increment: 1 } } });
      await tx.salesReviewAudit.create({ data: { entityKind: mode, entityKey: JSON.stringify([directId, pxEntryId]), ...(before ? { before: JSON.parse(JSON.stringify(before)) } : {}), after: JSON.parse(JSON.stringify(after)), reason } });
    }, { maxWait: 10000, timeout: 60000 });
    return Response.json({ success: true });
  } catch (error) {
    return apiErrorResponse(error) ?? Response.json({ error: "確認結果を保存できませんでした。再読み込みして確認してください。" }, { status: 500 });
  }
}
