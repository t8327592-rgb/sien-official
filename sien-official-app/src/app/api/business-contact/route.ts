import { readJson, textField, emailField, apiErrorResponse } from "@/lib/api-input";
import { consumeRateLimit } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await readJson(request);
    const companyName = textField(body, "companyName", true, 120);
    const contactName = textField(body, "contactName", true, 120);
    const email = emailField(body, "email");
    const inquiryType = textField(body, "inquiryType", true, 120);
    const budget = textField(body, "budget", false, 120);
    const deadline = textField(body, "deadline", false, 120);
    const message = textField(body, "message", true, 5000);
    await consumeRateLimit("business-global", 30, 3600);
    await consumeRateLimit("business-email", 2, 3600, email);

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
      }
    } catch (discordError) {
      console.error("Failed to send Discord notification for business contact:", discordError);
    }

    // Send Email notification
    try {
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        const { sendMail } = await import("@/lib/mail");
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.sien-official.com";
        
        // お客様向け確認メール
        await sendMail({
          to: email,
          subject: `【Sien-Official】法人・企業様 お問い合わせ受付完了のご案内`,
          text: `Sien-Officialへのお問い合わせを受け付けました。
担当者より通常1〜2営業日以内にご連絡いたします。

このメールに心当たりがない場合は破棄してください。

${baseUrl}
`,
        });

        // 管理者向け通知メール
        await sendMail({
          to: process.env.SMTP_USER,
          subject: `【法人お問い合わせ】${companyName} ${contactName}様よりお問い合わせがありました`,
          text: `${companyName} の ${contactName}様（${email}）より、法人・企業様向けのお問い合わせがありました。

ご用件: ${inquiryType}
管理画面より詳細をご確認ください。

${baseUrl}/admin/business`,
        });
      }
    } catch (emailError) {
      console.error("Failed to send Email notification:", emailError);
    }

    return NextResponse.json({ success: true, contactId: newContact.id }, { status: 201 });
  } catch (error) {
    const response = apiErrorResponse(error);
    if (response) return response;
    console.error("Business contact creation failed:", error);
    return NextResponse.json({ success: false, error: "Failed to create business contact" }, { status: 500 });
  }
}
