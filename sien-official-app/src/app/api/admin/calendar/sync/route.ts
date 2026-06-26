import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { google } from "googleapis";

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { orderId, deadline } = await request.json();
    
    if (!orderId || !deadline) {
      return NextResponse.json({ success: false, error: "orderId and deadline are required" }, { status: 400 });
    }

    // 依頼情報を取得
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    // 環境変数のチェック
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const calendarId = process.env.GOOGLE_CALENDAR_ID;

    if (!clientEmail || !privateKey || !calendarId) {
      console.warn("Google Calendar API keys are missing. Synchronization skipped.");
      // 致命的エラーではなく、フロントエンド側で無視するか警告を出せるようにする
      return NextResponse.json({ success: true, message: "Deadline saved, but calendar sync skipped due to missing credentials." });
    }

    // Google API 認証
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/calendar.events"],
    });

    const calendar = google.calendar({ version: "v3", auth });

    // スケジュール内容を作成
    const serviceName = order.serviceType === "MIX" ? "ボーカルMIX" : "オリジナル楽曲";
    const songName = order.songTitle ? ` (${order.songTitle})` : "";
    
    const event = {
      summary: `[納品期限] ${order.clientName}様 - ${serviceName}${songName}`,
      description: `【Sien Official 依頼】\n\nプラン: ${order.planId || 'なし'}\n金額: ${order.price ? `¥${order.price}` : '未定'}\n\n管理画面リンク: https://sien-official.com/admin/orders/${order.id}`,
      start: {
        date: deadline, // YYYY-MM-DD フォーマットの終日予定
      },
      end: {
        date: deadline, // 終日予定の場合、startとendを同日に設定
      },
      colorId: order.serviceType === "MIX" ? "3" : "5", // 3: 紫, 5: 黄色 (Googleカレンダーの色)
    };

    // Googleカレンダーへ追加
    await calendar.events.insert({
      calendarId: calendarId,
      requestBody: event,
    });

    return NextResponse.json({ success: true, message: "Calendar event created" });
  } catch (error) {
    console.error("Failed to sync to calendar:", error);
    return NextResponse.json({ success: false, error: "Failed to sync to calendar" }, { status: 500 });
  }
}
