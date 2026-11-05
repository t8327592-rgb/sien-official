import { isAdminRequest } from "@/lib/admin-api-auth";
import { prisma } from "@/lib/prisma";
import { ApiError, apiErrorResponse, readJson } from "@/lib/api-input";
import { validateOrderSequence } from "@/lib/admin-content-input";
import { invalidatePublicContent } from "@/lib/public-cache";
export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await readJson(request, 500000);
    const sequence = validateOrderSequence(body.sequence);
    const previous = validateOrderSequence(body.previous);
    if (sequence.length !== previous.length || sequence.some(row => !previous.some(p => p.id === row.id))) throw new ApiError(400, "並び順の対象が一致しません。");
    await prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(202611050002::bigint)`;
      const current = await tx.review.findMany({ orderBy: [{ orderIndex: "asc" }, { id: "asc" }], select: { id: true } });
      if (current.length !== previous.length || current.some((row, i) => row.id !== previous[i].id)) throw new ApiError(409, "一覧が更新されています。再読み込みしてから並べ替えてください。");
      for (const row of sequence) await tx.review.update({ where: { id: row.id }, data: { orderIndex: row.orderIndex } });
    });
    invalidatePublicContent("reviews");
    return Response.json({ success: true });
  } catch (error) { return apiErrorResponse(error) ?? Response.json({ error: "並び順を保存できませんでした。一覧を再読み込みしてください。" }, { status: 500 }); }
}
