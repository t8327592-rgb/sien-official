import { isAdminRequest } from "@/lib/admin-api-auth";
import { prisma } from "@/lib/prisma";
import { ApiError, apiErrorResponse, readJson, textField } from "@/lib/api-input";
import { consumeRateLimit } from "@/lib/rate-limit";
import { emptyFeedback } from "@/lib/feedback";
import { validateFeedback } from "@/lib/feedback-input";
import { previousFeedbackText } from "@/lib/feedback-history";
import { externalText } from "@/lib/external-text";
import { generateFeedbackDraft } from "@/lib/feedback-ai";

export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest(request))) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const body = await readJson(request, 32000);
    const memo = textField(body, "memo", true, 6000);
    const settings = validateFeedback({ ...emptyFeedback(), date: body.date, comparison: body.comparison });
    const order = await prisma.order.findUnique({ where: { id }, select: { clientName: true } });
    if (!order) throw new ApiError(404, "依頼が見つかりません。");
    if (!process.env.OPENAI_API_KEY) throw new ApiError(503, "OpenAI APIキーが未設定です。管理者が本番環境のOPENAI_API_KEYを設定すると利用できます。メモの保存と手動編集は可能です。");
    await consumeRateLimit("feedback-ai-minute", 6, 60);
    await consumeRateLimit("feedback-ai-day", 80, 86400);
    const previous = settings.comparison === "compare" ? await previousFeedbackText(id) : "";
    // Authorized OpenAI payload is the memo and optional prior report only.
    const safeMemo = externalText(memo, order.clientName);
    const draft = await generateFeedbackDraft(safeMemo, settings.comparison, settings.date, externalText(previous, order.clientName));
    draft.content.memo = memo;
    return Response.json({ success: true, draft }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return apiErrorResponse(error) || Response.json({ error: "文章案を作成できませんでした。入力内容は変更していません。" }, { status: 500 });
  }
}
