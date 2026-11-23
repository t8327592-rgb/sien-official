import { isAdminRequest } from "@/lib/admin-api-auth";
import { readJson, apiErrorResponse, ApiError } from "@/lib/api-input";
import { validateEstimate } from "@/lib/estimates";
import { estimatePdfResponse } from "@/lib/estimate-pdf-response";
import { estimateOrderIds, loadEstimateOrders } from "@/lib/estimate-store";

export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await readJson(request, 900000);
    let content;
    try { content = validateEstimate(body.content); } catch (error) { throw new ApiError(400, error instanceof Error ? error.message : "入力を確認してください。"); }
    const ids = estimateOrderIds(body.orderIds);
    await loadEstimateOrders(ids);
    if (content.lines.some(line => !ids.includes(line.orderId))) throw new ApiError(400, "明細の依頼が一致しません。");
    const revision = body.revision === undefined ? 1 : body.revision;
    if (!Number.isInteger(revision) || Number(revision) < 1 || Number(revision) > 1000000) throw new ApiError(400, "版番号を確認してください。");
    return await estimatePdfResponse(content, Number(revision));
  } catch (error) { return apiErrorResponse(error) || Response.json({ error: "PDFを作成できませんでした。" }, { status: 500 }); }
}
