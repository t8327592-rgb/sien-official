import type { Prisma } from "@prisma/client";
import { confirmedDeadline } from "@/lib/admin-order-filters";

export const NOTIFICATION_KINDS: Record<string, string> = {
  ORDER_ADMIN_EMAIL: "依頼・管理者メール", ORDER_RECEIPT_EMAIL: "依頼・受付メール", ORDER_DISCORD: "依頼・Discord",
  BUSINESS_ADMIN_EMAIL: "法人・管理者メール", BUSINESS_RECEIPT_EMAIL: "法人・受付メール", BUSINESS_DISCORD: "法人・Discord",
};
export const NOTIFICATION_STATUSES: Record<string, string> = { PENDING: "送信待ち", PROCESSING: "処理中", DELIVERED: "送信処理完了", FAILED: "失敗・再試行待ち", EXHAUSTED: "再試行上限" };
export function notificationFilters(params: Record<string, string | string[] | undefined>) {
  const status = typeof params.status === "string" && ["failed", "pending", "DELIVERED", "EXHAUSTED"].includes(params.status) ? params.status : "ALL";
  const kind = typeof params.kind === "string" && Object.hasOwn(NOTIFICATION_KINDS, params.kind) ? params.kind : "ALL";
  const from = typeof params.from === "string" ? params.from : "";
  const to = typeof params.to === "string" ? params.to : "";
  const error = (from && (!/^\d{4}-\d{2}-\d{2}$/.test(from) || confirmedDeadline(from) !== from)) || (to && (!/^\d{4}-\d{2}-\d{2}$/.test(to) || confirmedDeadline(to) !== to)) || (from && to && from > to) ? "期間は実在する日付で、開始日から終了日の順に指定してください。" : "";
  const where: Prisma.NotificationJobWhereInput = {};
  if (status !== "ALL") where.status = status === "failed" ? { in: ["FAILED", "EXHAUSTED"] } : status === "pending" ? { in: ["PENDING", "PROCESSING"] } : status;
  if (kind !== "ALL") where.kind = kind;
  if (!error && (from || to)) where.createdAt = { ...(from ? { gte: new Date(`${from}T00:00:00+09:00`) } : {}), ...(to ? { lt: new Date(new Date(`${to}T00:00:00+09:00`).getTime() + 86400000) } : {}) };
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 254) : "";
  const rawPage = typeof params.page === "string" && /^\d{1,6}$/.test(params.page) ? Number(params.page) : 1;
  return { status, kind, from, to, q, page: Math.max(1, rawPage), error, where };
}
export function canRetryNotification(job: { status: string; lockedUntil: Date | string | null }, now = new Date()) {
  return ["FAILED", "EXHAUSTED"].includes(job.status) && (!job.lockedUntil || new Date(job.lockedUntil) <= now);
}
export function notificationPageUrl(filters: ReturnType<typeof notificationFilters>, page: number) {
  const params = new URLSearchParams();
  for (const key of ["status", "kind", "from", "to", "q"] as const) if (filters[key] && filters[key] !== "ALL") params.set(key, filters[key]);
  params.set("page", String(page));
  return "/admin/notifications?" + params.toString();
}
