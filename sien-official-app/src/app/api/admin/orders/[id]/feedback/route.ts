import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/admin-api-auth";
import { ApiError, apiErrorResponse, readJson } from "@/lib/api-input";
import { feedbackVersion, validateFeedback } from "@/lib/feedback-input";
import { feedbackExportErrors } from "@/lib/feedback";

export const runtime = "nodejs";
const privateHeaders = { "Cache-Control": "private, no-store" };
type Context = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Context) {
  if (!(await isAdminRequest(request))) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const body = await readJson(request, 64000);
    const content = validateFeedback(body.content);
    const version = feedbackVersion(body.version);
    if (!(await prisma.order.findUnique({ where: { id }, select: { id: true } }))) throw new ApiError(404, "依頼が見つかりません。");
    const data = content as unknown as Prisma.InputJsonValue;
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

export async function GET(request: Request, { params }: Context) {
  if (!(await isAdminRequest(request))) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({ where: { id }, select: { id: true, clientName: true, songTitle: true, feedback: true } });
    if (!order) throw new ApiError(404, "依頼が見つかりません。");
    if (!order.feedback) throw new ApiError(404, "先にフィードバックを保存してください。");
    const content = validateFeedback(order.feedback.content);
    const errors = feedbackExportErrors(content);
    if (errors.length) throw new ApiError(400, errors.join("\n"));
    const [{ createFeedbackPdf }, { readFile }, path] = await Promise.all([import("@/lib/feedback-pdf"), import("node:fs/promises"), import("node:path")]);
    const font = await readFile(path.join(process.cwd(), "public/fonts/ZenKakuGothicNew-Regular.ttf"));
    const bytes = await createFeedbackPdf(order, content, font);
    const filename = encodeURIComponent(`フィードバック_${order.songTitle || order.id}.pdf`);
    const disposition = new URL(request.url).searchParams.get("inline") === "1" ? "inline" : "attachment";
    return new Response(new Uint8Array(bytes), { headers: {
      ...privateHeaders, "Content-Type": "application/pdf", "X-Content-Type-Options": "nosniff",
      "Content-Disposition": `${disposition}; filename="feedback.pdf"; filename*=UTF-8''${filename}`,
    } });
  } catch (error) {
    return apiErrorResponse(error) || Response.json({ error: "PDFを作成できませんでした。時間をおいて再度お試しください。" }, { status: 500 });
  }
}
