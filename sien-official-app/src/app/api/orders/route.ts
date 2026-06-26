import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      clientName, clientEmail, twitterId, contactMethod,
      serviceType, planId, songTitle, options, vocalKey,
      referenceUrl, referenceFidelity, materialsUrl, paymentMethod, deadline, message,
      activityPurpose, genre, lyricsStatus, vocalGuideStatus
    } = body;

    // 基本的なバリデーション（必須項目の空チェック）
    if (!clientName || !clientEmail || !serviceType) {
      return NextResponse.json(
        { success: false, error: "必須項目（お名前、メールアドレス、サービス名）が入力されていません。" },
        { status: 400 }
      );
    }

    const { checkIsRepeater, updateAllClientOrdersToRepeater } = await import("@/lib/repeater");
    const isRepeater = await checkIsRepeater(clientEmail, twitterId, clientName, undefined, new Date());

    if (isRepeater) {
      // 2回目以降の依頼があった場合、そのクライアントの過去の依頼も含めてすべて「リピーター」として更新する
      await updateAllClientOrdersToRepeater(clientEmail, twitterId);
    }

    const newOrder = await prisma.order.create({
      data: {
        clientName,
        clientEmail,
        twitterId,
        contactMethod,
        isRepeater,
        serviceType,
        planId,
        songTitle,
        options,
        vocalKey,
        referenceUrl,
        referenceFidelity,
        materialsUrl,
        paymentMethod,
        deadline,
        message,
        activityPurpose,
        genre,
        lyricsStatus,
        vocalGuideStatus,
        status: "PENDING",
      },
    });

    // Send Discord Webhook notification
    try {
      const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
      if (webhookUrl) {
        const serviceName = serviceType === 'MIX' ? 'ミックス／マスタリング' : 'オリジナル楽曲制作';
        const repeaterText = isRepeater ? 'リピーター' : '新規';

        const embed = {
          title: `📨 新規ご依頼: ${serviceName}`,
          color: 3447003, // Blue color
          fields: [
            { name: "👤 お客様情報", value: `**名前**: ${clientName} (${repeaterText})\n**Email**: ${clientEmail}\n**Twitter**: ${twitterId || "なし"}\n**連絡手段**: ${contactMethod}` },
            { name: "🎵 依頼内容", value: `**用途**: ${activityPurpose || "未指定"}\n**プランID**: ${planId}\n**曲名**: ${songTitle || "なし"}\n**希望納期**: ${deadline || "指定なし"}\n**オプション**: ${options || "なし"}` },
          ],
          timestamp: new Date().toISOString()
        } as any;

        if (serviceType === 'MIX') {
          embed.fields.push(
            { name: "🎤 楽曲情報 (MIX)", value: `**歌唱キー**: ${vocalKey || "なし"}\n**参考曲**: ${referenceUrl || "なし"}\n**再現度**: ${referenceFidelity || "なし"}` },
            { name: "📁 素材・支払い", value: `**素材URL**: ${materialsUrl || "未提出"}\n**支払方法**: ${paymentMethod || "銀行振込"}` }
          );
        } else {
          embed.fields.push(
            { name: "🎸 楽曲情報 (ORIGINAL)", value: `**希望ジャンル**: ${genre || "なし"}\n**参考曲**: ${referenceUrl || "なし"}\n**作詞の有無**: ${lyricsStatus || "なし"}\n**仮歌の有無**: ${vocalGuideStatus || "なし"}` },
            { name: "📁 支払い", value: `**支払方法**: ${paymentMethod || "銀行振込"}` }
          );
        }

        if (message) {
          embed.fields.push({ name: "📝 自由記述", value: message });
        }

        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: "🎉 **Sien-Official Webから新しいご依頼が届きました！**",
            embeds: [embed]
          }),
        });
      }
    } catch (discordError) {
      console.error("Failed to send Discord notification:", discordError);
    }

    // Send Email notification
    try {
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        const { sendMail } = await import("@/lib/mail");
        
        // ユーザー向け確認メールは送信しない（Sien様のみに通知）

        // 管理者向け通知メール
        await sendMail({
          to: process.env.SMTP_USER,
          subject: `【新規依頼】${clientName}様よりご依頼がありました`,
          text: `${clientName}様（${clientEmail}）より、${serviceType === 'MIX' ? 'MIX' : 'オリジナル'}のご依頼がありました。\n管理画面より詳細をご確認ください。\n\nhttps://sien-official.com/admin/orders`,
        });
      }
    } catch (emailError) {
      console.error("Failed to send Email notification:", emailError);
    }

    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (error) {
    console.error("Order creation failed:", error);
    return NextResponse.json({ success: false, error: "Failed to create order" }, { status: 500 });
  }
}
