import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-api-auth";
import { processPendingNotifications } from "@/lib/notifications";
import { cleanupExpiredRateLimits } from "@/lib/rate-limit";

async function processNotifications(request: Request) {
  const expected = process.env.CRON_SECRET;
  const supplied = request.headers.get("authorization")?.replace(/^Bearer /, "") || "";
  const cronAuthorized = !!expected && expected.length >= 32 && timingSafeEqual(createHash("sha256").update(expected).digest(), createHash("sha256").update(supplied).digest());
  if (!cronAuthorized && !(await isAdminRequest(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const notifications = await processPendingNotifications(20);
    const expiredCounters = await cleanupExpiredRateLimits();
    return NextResponse.json({ ...notifications, expiredCounters });
  }
  catch { console.error("Notification worker unavailable"); return NextResponse.json({ error: "通知処理を実行できませんでした。" }, { status: 503 }); }
}

export const POST = processNotifications;
export const GET = processNotifications;

export const maxDuration = 60;
