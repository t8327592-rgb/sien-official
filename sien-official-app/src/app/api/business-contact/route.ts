import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      companyName,
      contactName,
      email,
      inquiryType,
      budget,
      deadline,
      message
    } = body;

    // DBへの保存
    const newContact = await prisma.businessContact.create({
      data: {
        companyName,
        contactName,
        email,
        inquiryType,
        budget,
        deadline,
        message,
        status: "PENDING",
      },
    });

    // Discord Webhook 通知
    try {
      const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
      if (webhookUrl) {
        const embed = {
          title: `🏢 法人・企業様 お問い合わせ: ${inquiryType}`,
          color: 15105570, // Orange color
          fields: [
            { name: "🏢 貴社名 / 担当者名", value: `**${companyName}**\n${contactName} 様` },
            { name: "📧 連絡先", value: email },
            { name: "💰 予算感 / 納期", value: `**予算**: ${budget || "未定"}\n**納期**: ${deadline || "未定"}` },
            { name: "📝 お問い合わせ内容", value: message },
          ],
          timestamp: new Date().toISOString()
        };

        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: "🏢 **法人・企業様からの新規お問い合わせが届きました！**",
            embeds: [embed]
          }),
        });
        console.log("Business contact Discord notification sent successfully.");
      }
    } catch (discordError) {
      console.error("Failed to send Discord notification for business contact:", discordError);
    }

    return NextResponse.json({ success: true, contact: newContact }, { status: 201 });
  } catch (error) {
    console.error("Business contact creation failed:", error);
    return NextResponse.json({ success: false, error: "Failed to create business contact" }, { status: 500 });
  }
}
