import { validateConsent, validateOrderFields, enumField, validateOptionQuantities } from "@/lib/order-validation";
import { submissionIdentity, existingSubmission, acceptSubmission, submissionResponse } from "@/lib/submission";
import { processPendingNotifications, queueAutumnSaleNotifications } from "@/lib/notifications";
import { after, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readJson, textField, emailField, ApiError, apiErrorResponse } from "@/lib/api-input";
import { consumeRateLimit } from "@/lib/rate-limit";
import { calculateOrderPrice, priceFromText } from "@/lib/order-pricing";
import { vocalGuideFromOptions, isHumanVocalGuide } from "@/lib/vocal-guide";
import { currentPlanCampaign } from "@/lib/campaign-pricing";
import { requestIdentity } from "@/lib/request-identity";
import { audioDeadline, autumnSale, isAutumnMixSale, salePolicyVersion, salePrice } from "@/config/autumn-sale";
import { saleCampaignSnapshot, saleClock } from "@/lib/autumn-sale";

export async function POST(request: Request) {
  try {
    const receivedAt = saleClock().now;
    const body = await readJson(request);
    const identity = submissionIdentity(body, "ORDER");
    const existing = await existingSubmission(identity);
    if (existing) return NextResponse.json(submissionResponse(existing));
    const consent = validateConsent(body);
    const clientName = textField(body, "clientName", true, 120);
    const clientEmail = emailField(body, "clientEmail");
    const serviceType = textField(body, "serviceType", true, 20);
    if (!["MIX", "ORIGINAL", "GUIDE"].includes(serviceType)) throw new ApiError(400, "サービスを選択してください。");
    const intent = body.intent === undefined ? "ORDER" : enumField(body, "intent", ["ORDER", "CONSULTATION"]);
    if (intent === "CONSULTATION") {
      const message = textField(body, "message", true, 5000);
      await consumeRateLimit("orders-client", 10, 3600, requestIdentity(request.headers, clientEmail));
      await consumeRateLimit("orders-email", 5, 3600, clientEmail);
      await consumeRateLimit("orders-emergency", 10000, 3600);
      const receipt = await acceptSubmission(identity, { intent, serviceType, price: null }, tx => tx.order.create({ data: { clientName, clientEmail, contactMethod: "メール", serviceType, planId: "無料相談", message, price: null, basePrice: 0, optionPrice: 0, status: "PENDING" } }), consent);
      after(async () => { await processPendingNotifications(3); });
      return NextResponse.json(submissionResponse(receipt), { status: 201 });
    }
    const sale = isAutumnMixSale(serviceType, receivedAt);
    if (body.autumnSaleVersion !== undefined && (!sale || body.autumnSaleVersion !== salePolicyVersion)) {
      throw new ApiError(409, "秋のMIXセールの受付条件が変わりました。ページを再読み込みし、料金を確認してください。");
    }
    const selectedPlanId = textField(body, "planId", true, 150);
    const ids = body.optionIds;
    if (!Array.isArray(ids) || ids.length > 30 || ids.some(id => typeof id !== "string" || id.length > 150) || new Set(ids).size !== ids.length) {
      throw new ApiError(400, "オプションを選び直してください。");
    }
    const setting = await prisma.siteSetting.findUnique({ where: { id: "default" } });
    if (setting?.orderStatus === "UNAVAILABLE") throw new ApiError(409, "現在、新規受付を停止しております。");
    const guideOption = serviceType === "GUIDE" ? await prisma.option.findFirst({ where: { id: selectedPlanId, category: "MIX", isActive: true, name: { contains: "ボーカルガイド" } } }) : null;
    const plan = serviceType === "GUIDE" ? guideOption && { id: guideOption.id, name: "ボーカルガイド作成（単独）", price: priceFromText(guideOption.priceText), period: "正式見積でご案内", revisions: "正式見積でご案内", hasConsultation: /[〜～~]|要相談/.test(guideOption.priceText) } : await prisma.plan.findFirst({ where: { id: selectedPlanId, isActive: true, category: serviceType } });
    if (!plan) throw new ApiError(400, "プランが変更されています。ページを再読み込みしてください。");
    const selectedOptions = await prisma.option.findMany({ where: { id: { in: ids as string[] }, isActive: true, category: { in: [serviceType, "COMMON"] } } });
    if (selectedOptions.length !== ids.length) throw new ApiError(400, "オプションが変更されています。ページを再読み込みしてください。");
    const quantities = validateOptionQuantities(body.optionQuantities, selectedOptions);
    const campaigns = sale || serviceType === "GUIDE" ? [] : await prisma.campaign.findMany({ where: { isActive: true, targetPlanId: plan.id } });
    const planPrice = currentPlanCampaign(plan.id, campaigns)?.campaignPrice ?? plan.price;
    const estimate = calculateOrderPrice({ price: planPrice, hasConsultation: "hasConsultation" in plan && plan.hasConsultation }, selectedOptions, quantities);
    const basePrice = sale ? salePrice(estimate.basePrice) : estimate.basePrice;
    const total = sale ? salePrice(estimate.total) : estimate.total;
    const optionPrice = total - basePrice;
    const price = estimate.hasConsultation ? null : total;
    const planId = plan.name;
    const options = selectedOptions.map(o => o.name + " (" + o.priceText + ")" + (quantities[o.id] ? ` ×${quantities[o.id]}単位（10秒/単位）` : "")).join(", ");
    const fields = validateOrderFields(body, serviceType, plan.name, sale);
    const { twitterId, discordId, contactMethod, songTitle, vocalKey, referenceUrl, referenceFidelity, materialsUrl, paymentMethod, deadline, activityPurpose, genre, lyricsStatus } = fields;
    if (serviceType === "ORIGINAL" && fields.vocalGuideStatus.includes("人間") && !selectedOptions.some(isHumanVocalGuide)) throw new ApiError(400, "仮歌の選択が一致しません。選び直してください。");
    const vocalGuideStatus = serviceType === "ORIGINAL" ? vocalGuideFromOptions(fields.vocalGuideStatus, selectedOptions) : "不要";
    const notes = textField(body, "message", false, 5000);
    const message = sale
      ? [`【${autumnSale.name}】通常見積もり総額から${autumnSale.discount}%OFF。音源提出期限は原則 ${audioDeadline}（日本時間）。`, notes].filter(Boolean).join("\n\n")
      : notes;
    await consumeRateLimit("orders-client", 10, 3600, requestIdentity(request.headers, clientEmail));
    await consumeRateLimit("orders-email", 5, 3600, clientEmail);
    await consumeRateLimit("orders-emergency", 10000, 3600);

    const { checkIsRepeater, updateAllClientOrdersToRepeater } = await import("@/lib/repeater");
    const isRepeater = await checkIsRepeater(clientEmail, twitterId, clientName, undefined, new Date());

    if (isRepeater) {
      // 2回目以降の依頼があった場合、そのクライアントの過去の依頼も含めてすべて「リピーター」として更新する
      await updateAllClientOrdersToRepeater(clientEmail, twitterId);
    }

    const receipt = await acceptSubmission(identity, { plan: { id: plan.id, name: plan.name, price: planPrice, period: plan.period, revisions: plan.revisions }, options: selectedOptions.map(o => ({ id: o.id, name: o.name, priceText: o.priceText, quantity: quantities[o.id] ?? 1 })), basePrice, optionPrice, price, hasConsultation: estimate.hasConsultation, ...(sale ? { autumnSale: { ...saleCampaignSnapshot, normalTotal: estimate.hasConsultation ? null : estimate.total }, salePolicyVersion } : {}) }, async tx => {
      const record = await tx.order.create({
      data: {
        clientName,
        clientEmail,
        twitterId,
        discordId,
        contactMethod,
        isRepeater,
        serviceType,
        planId,
        songTitle: sale && !songTitle ? "未定" : songTitle,
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
      return record;
    }, consent, sale ? queueAutumnSaleNotifications : undefined);
    after(async () => { await processPendingNotifications(3); });

    return NextResponse.json(submissionResponse(receipt), { status: 201 });
  } catch (error) {
    const response = apiErrorResponse(error);
    if (response) return response;
    console.error("Order creation failed");
    return NextResponse.json({ success: false, error: "Failed to create order" }, { status: 500 });
  }
}

export const maxDuration = 60;
