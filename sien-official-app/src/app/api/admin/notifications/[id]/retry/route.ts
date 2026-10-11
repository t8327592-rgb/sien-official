import { isAdminRequest } from "@/lib/admin-api-auth";
import { prisma } from "@/lib/prisma";
import { ApiError, apiErrorResponse } from "@/lib/api-input";
import { canRetryNotification, NOTIFICATION_STATUSES } from "@/lib/admin-notifications";
import { processPendingNotifications } from "@/lib/notifications";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest(request))) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const job = await prisma.notificationJob.findUnique({ where: { id } });
    if (!job) throw new ApiError(404, "通知が見つかりません。");
    const now = new Date();
    if (!canRetryNotification(job, now)) throw new ApiError(409, "この通知は再試行対象ではないか、別の処理が実行中です。状態を再読み込みしてください。");
    const result = await prisma.notificationJob.updateMany({ where: { id, status: job.status, updatedAt: job.updatedAt, OR: [{ lockedUntil: null }, { lockedUntil: { lte: now } }] }, data: { status: "PENDING", attempts: 0, nextAttemptAt: now, lockedUntil: null, lastError: null } });
    if (result.count !== 1) throw new ApiError(409, "別の更新がありました。状態を再読み込みしてください。");
    // This operation can process only the selected job, never other waiting mail.
    await processPendingNotifications(1, 20000, id);
    const current = await prisma.notificationJob.findUnique({ where: { id } });
    return Response.json({ success: true, status: current?.status, message: `再試行結果：${NOTIFICATION_STATUSES[current?.status || ""] || "状態を確認してください"}` });
  } catch (error) {
    return apiErrorResponse(error) || Response.json({ success: false, error: "再試行処理に失敗しました。状態を確認してから再度操作してください。" }, { status: 500 });
  }
}
