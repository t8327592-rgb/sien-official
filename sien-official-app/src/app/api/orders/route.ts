import { validateConsent, validateOrderFields, enumField, validateOptionQuantities } from "@/lib/order-validation";
import { submissionIdentity, existingSubmission, acceptSubmission, submissionResponse } from "@/lib/submission";
import { processPendingNotifications } from "@/lib/notifications";
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
import { emptyTrackFields, isPackagePlan, MAX_ORDER_TRACKS } from "@/lib/order-tracks";

async function quoteTrack(body: Record<string, unknown>, serviceType: string, sale: boolean) {
  const selectedPlanId = textField(body, "planId", true, 150);
  const ids = body.optionIds;
  if (!Array.isArray(ids) || ids.length > 30 || ids.some(id => typeof id !== "string" || id.length > 150) || new Set(ids).size !== ids.length) {
    throw new ApiError(400, "オプションを選び直してください。");
  }
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
  const fields = validateOrderFields(body, serviceType, plan.name, sale);
  if (serviceType === "ORIGINAL" && fields.vocalGuideStatus.includes("人間") && !selectedOptions.some(isHumanVocalGuide)) throw new ApiError(400, "仮歌の選択が一致しません。選び直してください。");
  const { songTitle, materialsUrl, referenceUrl, twitterId, discordId, contactMethod, paymentMethod, ...details } = fields;
  return {
    songTitle: songTitle || (sale ? "未定" : ""), materialsUrl, referenceUrl, contact: { twitterId, discordId, contactMethod, paymentMethod },
    details: { ...details, vocalGuideStatus: serviceType === "ORIGINAL" ? vocalGuideFromOptions(fields.vocalGuideStatus, selectedOptions) : "不要" },
    options: selectedOptions.map(o => o.name + " (" + o.priceText + ")" + (quantities[o.id] ? ` ×${quantities[o.id]}単位（10秒/単位）` : "")).join(", "),
    quote: { plan: { id: plan.id, name: plan.name, price: planPrice, period: plan.period, revisions: plan.revisions }, options: selectedOptions.map(o => ({ id: o.id, name: o.name, priceText: o.priceText, quantity: quantities[o.id] ?? 1 })), basePrice, optionPrice: total - basePrice, price: estimate.hasConsultation ? null : total, hasConsultation: estimate.hasConsultation },
    normalTotal: estimate.total,
  };
}

export async function POST(request: Request) {
  try {
    const receivedAt = saleClock().now;
    const body = await readJson(request, 112000);
    const identity = submissionIdentity(body, "ORDER");
    const existing = await existingSubmission(identity);
    if (existing) return NextResponse.json(submissionResponse(existing));
    const consent = validateConsent(body);
    const clientName = textField(body, "clientName", true, 120);
    const clientEmail = emailField(body, "clientEmail");
    const serviceType = textField(body, "serviceType", true, 20);
    if (!["MIX", "ORIGINAL", "GUIDE"].includes(serviceType)) throw new ApiError(400, "サービスを選択してください。");
    const intent = body.intent === undefined ? "ORDER" : enumField(body, "intent", ["ORDER", "CONSULTATION"]);
    const extras = body.extraTracks ?? [];
    const trackKeys = new Set([...Object.keys(emptyTrackFields), "planId", "optionIds", "optionQuantities"]);
    if (!Array.isArray(extras) || extras.length >= MAX_ORDER_TRACKS || (intent === "CONSULTATION" && extras.length) || extras.some(track => !track || typeof track !== "object" || Array.isArray(track) || Object.keys(track).some(key => !trackKeys.has(key)))) {
      throw new ApiError(400, `申し込める楽曲は1〜${MAX_ORDER_TRACKS}曲です。曲ごとの入力内容を確認してください。`);
    }
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
      throw new ApiError(409, `${autumnSale.name}の受付条件が変わりました。ページを再読み込みし、料金を確認してください。`);
    }
    const setting = await prisma.siteSetting.findUnique({ where: { id: "default" } });
    if (setting?.orderStatus === "UNAVAILABLE") throw new ApiError(409, "現在、新規受付を停止しております。");
    const first = await quoteTrack(body, serviceType, sale);
    const notes = textField(body, "message", false, 5000);
    await consumeRateLimit("orders-client", 10, 3600, requestIdentity(request.headers, clientEmail));
    await consumeRateLimit("orders-email", 5, 3600, clientEmail);
    await consumeRateLimit("orders-emergency", 10000, 3600);
    const { twitterId, discordId, contactMethod, paymentMethod } = first.contact;
    const tracks = [{ ...first, note: "" }];
    for (const [index, track] of extras.entries()) {
      try { tracks.push({ ...await quoteTrack({ ...track, ...first.contact }, serviceType, sale), note: textField(track, "note", false, 1000) }); }
      catch (error) { if (error instanceof ApiError) throw new ApiError(error.status, `${index + 2}曲目：${error.message}`); throw error; }
    }
    const grouped = tracks.length > 1;
    if (grouped && tracks.some(track => isPackagePlan(track.quote.plan.name))) throw new ApiError(400, "セットプランは単独でお申し込みください。複数曲を追加する場合は1曲ごとのプランを選択してください。");
    const basePrice = tracks.reduce((total, track) => total + track.quote.basePrice, 0);
    const optionPrice = tracks.reduce((total, track) => total + track.quote.optionPrice, 0);
    if (basePrice + optionPrice > 2147483647 || !Number.isSafeInteger(basePrice + optionPrice)) throw new ApiError(400, "見積額をご確認ください。");
    const hasConsultation = tracks.some(track => track.quote.hasConsultation);
    const price = hasConsultation ? null : basePrice + optionPrice;
    const message = sale
      ? [`【${autumnSale.name}】通常見積もり総額から${autumnSale.discount}%OFF。音源提出期限は原則 ${audioDeadline}（日本時間）。`, notes].filter(Boolean).join("\n\n")
      : notes;

    const { checkIsRepeater, updateAllClientOrdersToRepeater } = await import("@/lib/repeater");
    const isRepeater = await checkIsRepeater(clientEmail, twitterId, clientName, undefined, new Date());

    if (isRepeater) {
      // 2回目以降の依頼があった場合、そのクライアントの過去の依頼も含めてすべて「リピーター」として更新する
      await updateAllClientOrdersToRepeater(clientEmail, twitterId);
    }

    const trackRows = tracks.map((track, index) => ({ position: index + 1, songTitle: track.songTitle || "未定", planName: track.quote.plan.name, options: track.options, materialsUrl: track.materialsUrl, referenceUrl: track.referenceUrl, details: { ...track.details, note: track.note }, price: track.quote.price }));
    const receiptQuote = {
      ...first.quote, basePrice, optionPrice, price, hasConsultation,
      ...(grouped ? { tracks: trackRows.map((row, index) => ({ ...row, basePrice: tracks[index].quote.basePrice, optionPrice: tracks[index].quote.optionPrice })) } : {}),
      ...(sale ? { autumnSale: { ...saleCampaignSnapshot, normalTotal: hasConsultation ? null : tracks.reduce((total, track) => total + track.normalTotal, 0) }, salePolicyVersion } : {}),
    };
    const receipt = await acceptSubmission(identity, receiptQuote, async tx => {
      const record = await tx.order.create({
      data: {
        clientName,
        clientEmail,
        twitterId,
        discordId,
        contactMethod,
        isRepeater,
        serviceType,
        planId: first.quote.plan.name,
        songTitle: first.songTitle,
        options: first.options,
        referenceUrl: first.referenceUrl,
        materialsUrl: first.materialsUrl,
        paymentMethod,
        message,
        ...first.details,
        price,
        basePrice,
        optionPrice,
        status: "PENDING",
        ...(grouped ? { trackCount: tracks.length, tracks: { create: trackRows } } : {}),
        },
      });
      return record;
    }, consent);
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
