import { Prisma } from "@prisma/client";
import { isAdminRequest } from "@/lib/admin-api-auth";
import { readJson, apiErrorResponse } from "@/lib/api-input";
import { saveEstimate } from "@/lib/estimate-store";

export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const estimate = await saveEstimate(await readJson(request, 900000));
    return Response.json({ success: true, id: estimate.id, revision: estimate.revision }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return Response.json({ error: "別の画面で改訂されました。保存済み一覧から最新版を開いてください。" }, { status: 409 });
    return apiErrorResponse(error) || Response.json({ error: "保存できませんでした。入力内容を保持しています。時間をおいて再試行してください。" }, { status: 500 });
  }
}
