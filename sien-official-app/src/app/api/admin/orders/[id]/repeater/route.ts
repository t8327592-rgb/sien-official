import { isAdminRequest } from "@/lib/admin-api-auth";
import { prisma } from "@/lib/prisma";
import { ApiError, readJson, apiErrorResponse } from "@/lib/api-input";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest(request))) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const input = await readJson(request, 1000);
    if (Object.keys(input).length !== 1 || typeof input.isRepeater !== "boolean") throw new ApiError(400, "顧客種別の入力を確認してください。");
    const { id } = await params;
    const isRepeater = input.isRepeater;
    const ids = await prisma.$transaction(async tx => {
      const order = await tx.order.findUnique({ where: { id } });
      if (!order) throw new ApiError(404, "依頼が見つかりません。");
      // Empty addresses must never group unrelated customers together.
      const where = order.clientEmail?.trim()
        ? { clientEmail: { equals: order.clientEmail, mode: "insensitive" as const } }
        : { id };
      const rows = await tx.order.findMany({ where, select: { id: true } });
      await tx.order.updateMany({ where: { id: { in: rows.map(row => row.id) } }, data: { isRepeater } });
      return rows.map(row => row.id);
    });
    return Response.json({ success: true, ids, isRepeater });
  } catch (error) {
    return apiErrorResponse(error) || Response.json({ success: false, error: "顧客種別の更新に失敗しました。" }, { status: 500 });
  }
}
