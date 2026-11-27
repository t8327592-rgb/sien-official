import { isAdminRequest } from "@/lib/admin-api-auth";
import { ApiError, apiErrorResponse, readJson } from "@/lib/api-input";
import { updateOrderFromTracks } from "@/lib/admin-track-delivery";
import { financeVersion } from "@/lib/order-finance-input";
import { TRACK_STATUS_LABELS } from "@/lib/order-tracks";
import { urlField } from "@/lib/order-validation";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; trackId: string }> }) {
  if (!(await isAdminRequest(request))) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id, trackId } = await params;
    const body = await readJson(request, 4000);
    const { status } = body;
    if (typeof status !== "string" || !Object.hasOwn(TRACK_STATUS_LABELS, status)) throw new ApiError(400, "楽曲の進捗を選び直してください。");
    const version = financeVersion(body.version);
    const requestedUrl = body.deliveryUrl === undefined ? undefined : urlField(body, "deliveryUrl") || null;
    await prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(hashtextextended(${`order-finance:${id}`}, 0))`;
      const order = await tx.order.findUnique({ where: { id }, include: { tracks: true } });
      const track = order?.tracks.find(track => track.id === trackId);
      if (!order || !track) throw new ApiError(404, "楽曲が見つかりません。");
      if (["CANCELED", "CANCELLED"].includes(order.status)) throw new ApiError(409, "依頼のキャンセルを解除してから楽曲の進捗を更新してください。");
      if (track.version !== version) throw new ApiError(409, "楽曲の進捗が更新されています。再読み込みしてください。");
      const deliveryUrl = requestedUrl === undefined ? track.deliveryUrl : requestedUrl;
      if (track.status === status && track.deliveryUrl === deliveryUrl) return;
      const deliveredAt = status === "COMPLETED" ? track.deliveredAt ?? new Date() : null;
      const saved = await tx.orderTrack.update({ where: { id: trackId }, data: { status, deliveryUrl, deliveredAt, version: { increment: 1 } } });
      await tx.order.update({ where: { id }, data: updateOrderFromTracks(order, order.tracks.map(item => item.id === trackId ? saved : item)) });
    });
    return Response.json({ success: true });
  } catch (error) {
    return apiErrorResponse(error) ?? Response.json({ success: false, error: "楽曲の進捗を保存できませんでした。" }, { status: 500 });
  }
}
