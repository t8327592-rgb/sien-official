import { isAdminRequest } from "@/lib/admin-api-auth";
import { prisma } from "@/lib/prisma";
import { ApiError, apiErrorResponse, readJson } from "@/lib/api-input";
import { financeDate, financeText } from "@/lib/order-finance-input";
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest(request))) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const body = await readJson(request, 100000);
    if (typeof body.updatedAt !== "string" || !Number.isFinite(new Date(body.updatedAt).getTime()) || typeof body.isInvoiceCompliant !== "boolean") throw new ApiError(400, "入力内容を確認してください。");
    const order = await prisma.order.findUnique({ where: { id }, select: { businessContactId: true } });
    if (!order?.businessContactId) throw new ApiError(404, "法人問い合わせが見つかりません。");
    const result = await prisma.businessContact.updateMany({ where: { id: order.businessContactId, updatedAt: new Date(body.updatedAt) }, data: {
      billedAt: financeDate(body.billedAt || null, true), paymentDeadline: financeDate(body.paymentDeadline || null, true), lastContactedAt: financeDate(body.lastContactedAt || null, true),
      invoiceStatus: financeText(body.invoiceStatus, 120) || null, isInvoiceCompliant: body.isInvoiceCompliant,
      history: financeText(body.history, 20000) || null,
    } });
    if (!result.count) throw new ApiError(409, "別の更新がありました。再読み込みしてください。");
    return Response.json({ success: true });
  } catch (error) { return apiErrorResponse(error) ?? Response.json({ error: "保存に失敗しました。" }, { status: 500 }); }
}
