import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/admin-api-auth";
import { ApiError, apiErrorResponse, readJson } from "@/lib/api-input";
import { feedbackVersion, validateFeedbackMemo } from "@/lib/feedback-input";
import { emptyFeedback } from "@/lib/feedback";

export const runtime = "nodejs";
const privateHeaders = { "Cache-Control": "private, no-store" };
type Context = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Context) {
  if (!(await isAdminRequest(request))) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const body = await readJson(request, 24000);
    const memo = validateFeedbackMemo(body);
    const version = feedbackVersion(body.version);
    if (!(await prisma.order.findUnique({ where: { id }, select: { id: true } }))) throw new ApiError(404, "依頼が見つかりません。");
    const current = await prisma.orderFeedback.findUnique({ where: { orderId: id }, select: { content: true } });
    const previous = current?.content && typeof current.content === "object" && !Array.isArray(current.content) ? current.content : emptyFeedback();
    // Update only the working memo. Previously saved reports stay intact.
    const data = { ...previous, ...memo, reviewed: false } as unknown as Prisma.InputJsonValue;
    if (version === 0) {
      await prisma.orderFeedback.create({ data: { orderId: id, content: data } });
    } else {
      const updated = await prisma.orderFeedback.updateMany({ where: { orderId: id, version }, data: { content: data, version: { increment: 1 } } });
      if (!updated.count) throw new ApiError(409, "別の画面で更新されました。入力内容を控え、再読み込みして確認してください。");
    }
    return Response.json({ success: true, version: version + 1 }, { headers: privateHeaders });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return Response.json({ error: "別の画面で作成されました。入力内容を控え、再読み込みしてください。" }, { status: 409 });
    return apiErrorResponse(error) || Response.json({ error: "保存できませんでした。時間をおいて再度お試しください。" }, { status: 500 });
  }
}
