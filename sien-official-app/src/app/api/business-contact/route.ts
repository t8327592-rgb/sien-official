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
      }
    } catch (discordError) {
      console.error("Failed to send Discord notification for business contact:", discordError);
    }

    // Send Email notification
    try {
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        const { sendMail } = await import("@/lib/mail");
        
        // お客様向け確認メール
        await sendMail({
          to: email,
          subject: `【Sien-Official】法人・企業様 お問い合わせ受付完了のご案内`,
          text: `${companyName}
${contactName} 様

この度はSien-Officialへお問い合わせいただき、誠にありがとうございます。
以下の内容で送信を承りました。

担当者より通常1〜2営業日以内にご連絡いたしますので、今しばらくお待ちくださいませ。

■お問い合わせ内容
ご用件：${inquiryType}
ご予算感：${budget || "未定"}
希望納期：${deadline || "未定"}
詳細：
${message}

--------------------------------------------------
Sien-Official
https://www.sien-official.com
--------------------------------------------------`,
        });

        // 管理者向け通知メール
        await sendMail({
          to: process.env.SMTP_USER,
          subject: `【法人お問い合わせ】${companyName} ${contactName}様よりお問い合わせがありました`,
          text: `${companyName} の ${contactName}様（${email}）より、法人・企業様向けのお問い合わせがありました。

ご用件: ${inquiryType}
管理画面より詳細をご確認ください。

https://www.sien-official.com/admin/business`,
        });
      }
    } catch (emailError) {
      console.error("Failed to send Email notification:", emailError);
    }

    return NextResponse.json({ success: true, contact: newContact }, { status: 201 });
  } catch (error) {
    console.error("Business contact creation failed:", error);
    return NextResponse.json({ success: false, error: "Failed to create business contact" }, { status: 500 });
  }
}
