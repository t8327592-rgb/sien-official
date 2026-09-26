import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readJson, textField, emailField, ApiError, apiErrorResponse } from "@/lib/api-input";
import { consumeRateLimit } from "@/lib/rate-limit";
import { calculateOrderPrice } from "@/lib/order-pricing";

export async function POST(request: Request) {
  try {
    const body = await readJson(request);
    const clientName = textField(body, "clientName", true, 120);
    const clientEmail = emailField(body, "clientEmail");
    const serviceType = textField(body, "serviceType", true, 20);
    if (!["MIX", "ORIGINAL"].includes(serviceType)) throw new ApiError(400, "サービスを選択してください。");
    const selectedPlanId = textField(body, "planId", true, 150);
    const ids = body.optionIds;
    if (!Array.isArray(ids) || ids.length > 30 || ids.some(id => typeof id !== "string" || id.length > 150) || new Set(ids).size !== ids.length) {
      throw new ApiError(400, "オプションを選び直してください。");
    }
    await consumeRateLimit("orders", 60, 3600);
    await consumeRateLimit("orders-email", 3, 3600, clientEmail);
    const setting = await prisma.siteSetting.findUnique({ where: { id: "default" } });
    if (setting?.orderStatus === "UNAVAILABLE") throw new ApiError(409, "現在、新規受付を停止しております。");
    const plan = await prisma.plan.findFirst({ where: { id: selectedPlanId, isActive: true, category: serviceType } });
    if (!plan) throw new ApiError(400, "プランが変更されています。ページを再読み込みしてください。");
    const selectedOptions = await prisma.option.findMany({ where: { id: { in: ids as string[] }, isActive: true, category: { in: [serviceType, "COMMON"] } } });
    if (selectedOptions.length !== ids.length) throw new ApiError(400, "オプションが変更されています。ページを再読み込みしてください。");
    const estimate = calculateOrderPrice(plan, selectedOptions);
    const { basePrice, optionPrice } = estimate;
    const price = estimate.hasConsultation ? null : estimate.total;
    const planId = plan.name;
    const options = selectedOptions.map(o => o.name + " (" + o.priceText + ")").join(", ");
    const fields = Object.fromEntries([
      "twitterId", "discordId", "contactMethod", "songTitle", "vocalKey", "referenceUrl", "referenceFidelity", "materialsUrl", "paymentMethod", "deadline", "activityPurpose", "genre", "lyricsStatus", "vocalGuideStatus"
    ].map(key => [key, textField(body, key)]));
    const { twitterId, discordId, contactMethod, songTitle, vocalKey, referenceUrl, referenceFidelity, materialsUrl, paymentMethod, deadline, activityPurpose, genre, lyricsStatus, vocalGuideStatus } = fields;
    const message = textField(body, "message", false, 5000);

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
        discordId,
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
        price,
        basePrice,
        optionPrice,
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
            { name: "👤 お客様情報", value: `**名前**: ${clientName} (${repeaterText})\n**Email**: ${clientEmail}\n**Twitter**: ${twitterId || "なし"}\n**Discord ID**: ${discordId || "なし"}\n**連絡手段**: ${contactMethod}` },
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

        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.sien-official.com";
        
        // 管理者向け通知メール
        await sendMail({
          to: process.env.SMTP_USER,
          subject: `【新規依頼】${clientName}様よりご依頼がありました`,
          text: `${clientName}様（${clientEmail}）より、${serviceType === 'MIX' ? 'MIX' : 'オリジナル'}のご依頼がありました。\n管理画面より詳細をご確認ください。\n\n${baseUrl}/admin/orders`,
        });
      }
    } catch (emailError) {
      console.error("Failed to send Email notification:", emailError);
    }

    return NextResponse.json({ success: true, orderId: newOrder.id }, { status: 201 });
  } catch (error) {
    const response = apiErrorResponse(error);
    if (response) return response;
    console.error("Order creation failed:", error);
    return NextResponse.json({ success: false, error: "Failed to create order" }, { status: 500 });
  }
}
