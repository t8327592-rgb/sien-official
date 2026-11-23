import { isAdminRequest } from "@/lib/admin-api-auth";
import { prisma } from "@/lib/prisma";
import { validateEstimate } from "@/lib/estimates";
import { estimatePdfResponse } from "@/lib/estimate-pdf-response";

export const runtime = "nodejs";
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest(request))) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const estimate = await prisma.estimate.findUnique({ where: { id } });
  if (!estimate) return Response.json({ error: "見積書が見つかりません。" }, { status: 404 });
  try { return await estimatePdfResponse(validateEstimate(estimate.content), estimate.revision); }
  catch { return Response.json({ error: "PDFを作成できませんでした。時間をおいて再試行してください。" }, { status: 500 }); }
}
