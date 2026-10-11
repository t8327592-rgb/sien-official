import { createHash } from "node:crypto";
import { ApiError } from "@/lib/api-input";

export function deadlineEvent(order: { id: string; serviceType: string; clientName: string; songTitle: string | null }, deadline: string) {
  const start = new Date(`${deadline}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(deadline) || !Number.isFinite(start.getTime()) || start.toISOString().slice(0, 10) !== deadline) throw new ApiError(400, "納期の日付を確認してください。");
  const end = new Date(start); end.setUTCDate(end.getUTCDate() + 1);
  const service = order.serviceType === "MIX" ? "ボーカルMIX" : order.serviceType === "GUIDE" ? "ボーカルガイド" : "オリジナル楽曲";
  const name = order.clientName.trim();
  const customer = name ? (name.endsWith("様") ? name : `${name}様`) : `受付 ${order.id}`;
  const songTitle = order.songTitle?.trim();
  return {
    id: createHash("sha256").update(`sien-deadline:${order.id}`).digest("hex"),
    summary: `[納品期限] ${customer} - ${service}${songTitle ? ` (${songTitle})` : ""}`,
    description: `受付情報は管理画面で確認してください。\n${process.env.NEXT_PUBLIC_SITE_URL || "https://www.sien-official.com"}/admin/orders/${encodeURIComponent(order.id)}`,
    start: { date: deadline }, end: { date: end.toISOString().slice(0, 10) },
    colorId: order.serviceType === "MIX" ? "3" : "5",
  };
}

export async function upsertDeadlineEvent(calendar: { events: {
  update: (params: { calendarId: string; eventId: string; requestBody: ReturnType<typeof deadlineEvent> }, options: { timeout: number }) => Promise<unknown>;
  insert: (params: { calendarId: string; requestBody: ReturnType<typeof deadlineEvent> }, options: { timeout: number }) => Promise<unknown>;
} }, calendarId: string, event: ReturnType<typeof deadlineEvent>) {
  const update = () => calendar.events.update({ calendarId, eventId: event.id, requestBody: event }, { timeout: 10000 });
  try { await update(); }
  catch (error) {
    if (!error || typeof error !== "object" || !("code" in error) || error.code !== 404) throw error;
    try { await calendar.events.insert({ calendarId, requestBody: event }, { timeout: 10000 }); }
    catch (insertError) {
      if (!insertError || typeof insertError !== "object" || !("code" in insertError) || insertError.code !== 409) throw insertError;
      await update();
    }
  }
}
