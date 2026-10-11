import type { BusinessContact, Order, Prisma } from "@prisma/client";

type Detail = { name: string; value: string };
const object = (value: Prisma.JsonValue | null | undefined) => value && typeof value === "object" && !Array.isArray(value) ? value : null;
const yen = (value: Prisma.JsonValue | null | undefined) => typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? `${value.toLocaleString("ja-JP")}円（税込）` : "内容確認後にご案内";

export function notificationDetails(record: Order | BusinessContact, quote: Prisma.JsonValue | null) {
  const snapshot = object(quote);
  const details: Detail[] = [];
  const add = (name: string, value: string | null | undefined) => { if (value?.trim()) details.push({ name, value: value.trim() }); };
  let title: string;
  if ("companyName" in record) {
    title = "法人お問い合わせ";
    add("会社名", record.companyName); add("担当者名", record.contactName); add("メールアドレス", record.email);
    add("お問い合わせ種別", record.inquiryType); add("ご予算", record.budget); add("希望納期", record.deadline);
  } else {
    const consultation = snapshot?.intent === "CONSULTATION" || record.planId === "無料相談";
    title = consultation ? "無料相談・お見積もり" : "制作依頼";
    const service = record.serviceType === "MIX" ? "ボーカルMIX" : record.serviceType === "GUIDE" ? "ボーカルガイド" : "オリジナル楽曲制作";
    const plan = object(snapshot?.plan);
    add("依頼者名", record.clientName); add("依頼種別", `${title} / ${service}`); add("メールアドレス", record.clientEmail);
    add("希望する連絡手段", record.contactMethod); add("X ID", record.twitterId); add("Discord ID", record.discordId);
    add("曲名", record.songTitle); add("プラン", typeof plan?.name === "string" ? plan.name : record.planId);
    add("受付時点の概算金額", consultation ? "無料相談（制作契約・料金は発生しません）" : yen(snapshot ? snapshot.price : record.price));
    if (!consultation) {
      add("基本料金", yen(snapshot ? snapshot.basePrice : record.basePrice));
      add("オプション料金", yen(snapshot ? snapshot.optionPrice : record.optionPrice));
      const options = Array.isArray(snapshot?.options) ? snapshot.options.map(option => {
        const item = object(option);
        if (typeof item?.name !== "string") return "";
        const quantity = typeof item.quantity === "number" && (item.quantity > 1 || item.name.includes("カットアップ")) ? ` ×${item.quantity}単位${item.name.includes("カットアップ") ? "（10秒/単位）" : ""}` : "";
        return `${item.name}${typeof item.priceText === "string" ? ` (${item.priceText})` : ""}${quantity}`;
      }).filter(Boolean).join("\n") : record.options;
      add("オプション", options || "なし");
    }
    add("希望納期", record.deadline); add("支払い方法", record.paymentMethod); add("歌唱キー", record.vocalKey);
    add("活動用途", record.activityPurpose); add("ジャンル", record.genre); add("作詞", record.lyricsStatus); add("仮歌", record.vocalGuideStatus);
    add("参考音源の再現度", record.referenceFidelity === "1" ? "基本お任せ" : record.referenceFidelity === "2" ? "雰囲気を参考" : record.referenceFidelity === "3" ? "できるだけ参考音源に近く" : record.referenceFidelity);
    add("素材URL", record.materialsUrl); add("参考URL", record.referenceUrl);
  }
  add("備考・ご要望", record.message);
  return { title, details };
}

function shorten(value: string, max: number) {
  if (value.length <= max) return value;
  const text = value.slice(0, Math.max(0, max - 1)).replace(/[\uD800-\uDBFF]$/, "");
  return `${text}…`;
}

export function discordNotification(record: Order | BusinessContact, quote: Prisma.JsonValue | null, adminUrl: string) {
  const { title, details } = notificationDetails(record, quote);
  // Reserve room under Discord's 6,000-character embed limit. Keep every field
  // visible in the overview; an attachment preserves the full text if shortened.
  const fields: Detail[] = [];
  let budget = 5500 - title.length - details.reduce((sum, field) => sum + field.name.length, 0);
  let truncated = false;
  for (const [index, detail] of details.entries()) {
    const allowance = Math.min(1024, Math.max(1, budget - (details.length - index - 1) * 40));
    const value = shorten(detail.value, allowance);
    truncated ||= value !== detail.value;
    fields.push({ name: detail.name, value }); budget -= value.length;
  }
  const fullText = `${title}\n\n${details.map(field => `${field.name}：\n${field.value}`).join("\n\n")}\n\n管理画面：${adminUrl}`;
  const payload = {
    content: `新しい${title}を受け付けました。\n${adminUrl}${truncated ? "\n長文の全文は添付ファイルで確認できます。" : ""}`,
    embeds: [{ title, color: 0xff7900, fields }],
    allowed_mentions: { parse: [] },
  };
  return { payload, fullText: truncated ? fullText : null };
}
