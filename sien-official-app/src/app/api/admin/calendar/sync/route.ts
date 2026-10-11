import { isAdminRequest } from "@/lib/admin-api-auth";
import { prisma } from "@/lib/prisma";
import { google } from "googleapis";
import { readJson, textField, apiErrorResponse, ApiError } from "@/lib/api-input";
import { deadlineEvent, upsertDeadlineEvent } from "@/lib/calendar-event";
export async function POST(request: Request) {
 if (!(await isAdminRequest(request))) return Response.json({ error: "Unauthorized" }, { status: 401 });
 try {
  const body = await readJson(request);
  const orderId = textField(body, "orderId", true, 100);
  const deadline = textField(body, "deadline", true, 10);
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new ApiError(404, "依頼が見つかりません。");
  const event = deadlineEvent(order, deadline);
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  if (!clientEmail || !privateKey || !calendarId) return Response.json({ success: true, synced: false, message: "カレンダー連携が未設定のため、同期は実施していません。" });
  const auth = new google.auth.JWT({ email: clientEmail, key: privateKey, scopes: ["https://www.googleapis.com/auth/calendar.events"] });
  await upsertDeadlineEvent(google.calendar({ version: "v3", auth }), calendarId, event);
  return Response.json({ success: true, synced: true });
 } catch (error) {
  const response = apiErrorResponse(error); if (response) return response;
  console.error("Calendar synchronization failed");
  return Response.json({ success: false, error: "カレンダー同期に失敗しました。時間をおいて再試行してください。" }, { status: 503 });
 }
}
