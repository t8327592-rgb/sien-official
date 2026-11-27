import type { BusinessContact, Order, Prisma } from "@prisma/client";

type Detail = { name: string; value: string };
const object = (value: Prisma.JsonValue | null | undefined) => value && typeof value === "object" && !Array.isArray(value) ? value : null;
const yen = (value: Prisma.JsonValue | null | undefined) => typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? `${value.toLocaleString("ja-JP")}円（税込）` : "内容確認後にご案内";
const text = (value: Prisma.JsonValue | undefined) => typeof value === "string" ? value : "";

export function notificationDetails(record: Order | BusinessContact, quote: Prisma.JsonValue | null) {
  const snapshot = object(quote);
  const details: Detail[] = [];
  const add = (name: string, value: string | null | undefined) => { if (value?.trim()) details.push({ name, value: value.trim() }); };
  let title: string;
  if ("inquiryType" in record) {
    title = "法人お問い合わせ";
    add("会社名", record.companyName); add("担当者名", record.contactName); add("メールアドレス", record.email);
    add("お問い合わせ種別", record.inquiryType); add("ご予算", record.budget); add("希望納期", record.deadline);
  } else {
    const consultation = snapshot?.intent === "CONSULTATION" || record.planId === "無料相談";
    title = consultation ? "無料相談・お見積もり" : "制作依頼";
    const service = record.serviceType === "MIX" ? "ボーカルMIX" : record.serviceType === "GUIDE" ? "ボーカルガイド" : "オリジナル楽曲制作";
    const plan = object(snapshot?.plan);
    const tracks = Array.isArray(snapshot?.tracks) ? snapshot.tracks : [];
    add("依頼者名", record.clientName); add("依頼種別", `${title} / ${service}`); add("メールアドレス", record.clientEmail);
    add("希望する連絡手段", record.contactMethod); add("X ID", record.twitterId); add("Discord ID", record.discordId);
    if (tracks.length) {
      add("依頼と楽曲数", `依頼1件・楽曲${tracks.length}曲`);
      add("受付時点の概算金額", yen(snapshot?.price)); add("支払い方法", record.paymentMethod);
      tracks.forEach((item, index) => {
        const track = object(item);
        if (!track) return;
        const detail = object(track.details);
        const rows = [["曲名", text(track.songTitle)], ["プラン", text(track.planName)], ["概算", yen(track.price)], ["オプション", text(track.options)], ["希望納期", text(detail?.deadline)], ["歌唱キー", text(detail?.vocalKey)], ["活動用途", text(detail?.activityPurpose)], ["ジャンル", text(detail?.genre)], ["作詞", text(detail?.lyricsStatus)], ["仮歌", text(detail?.vocalGuideStatus)], ["素材URL", text(track.materialsUrl)], ["参考URL", text(track.referenceUrl)], ["参考曲との近さ", text(track.referenceUrl) ? text(detail?.referenceFidelity) : ""], ["ご要望", text(detail?.note)]];
        add(`${index + 1}曲目`, rows.filter(([, value]) => value).map(([label, value]) => `${label}：${value}`).join("\n"));
      });
      add("備考・ご要望", record.message);
      return { title, details };
    }
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

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);
function safeLink(value: string) {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password ? escapeHtml(url.href) : null;
  } catch { return null; }
}

export function adminEmailNotification(record: Order | BusinessContact, quote: Prisma.JsonValue | null, adminUrl: string) {
  const { title, details } = notificationDetails(record, quote);
  if (record.createdAt) details.unshift({ name: "受付日時", value: new Intl.DateTimeFormat("ja-JP", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Tokyo" }).format(record.createdAt) + "（日本時間）" });
  if (!("inquiryType" in record)) {
    if (typeof record.isRepeater === "boolean") details.push({ name: "リピーター（受付時点）", value: record.isRepeater ? "はい" : "いいえ" });
    if (record.companyName) details.push({ name: "会社名", value: record.companyName });
    const campaign = object(object(quote)?.autumnSale);
    if (campaign) {
      if (typeof campaign.name === "string") details.push({ name: "セール", value: campaign.name });
      if (typeof campaign.discount === "number") details.push({ name: "割引率", value: `${campaign.discount}%OFF` });
      details.push({ name: "割引前の概算金額", value: yen(campaign.normalTotal) });
      if (typeof campaign.audioDueDay === "string") details.push({ name: "音源提出期限", value: `${campaign.audioDueDay} 23:59（日本時間）` });
    }
  }
  const notice = "記載の金額は受付時点の概算です。音源や依頼内容を確認してから正式なお見積もりをご案内ください。素材URLがあっても、音源確認済みとは限りません。";
  const text = `新しい${title}を受け付けました。\n\n${notice}\n\n${details.map(field => `【${field.name}】\n${field.value}`).join("\n\n")}\n\n管理画面：${adminUrl}`;
  const rows = details.map(field => {
    const link = field.name.endsWith("URL") ? safeLink(field.value) : null;
    const value = escapeHtml(field.value).replace(/\r?\n/g, "<br>");
    return `<tr><th scope="row" style="width:132px;padding:14px 12px;border-bottom:1px solid #e2e8f0;text-align:left;vertical-align:top;font-weight:600;background:#f8fafc">${escapeHtml(field.name)}</th><td style="padding:14px 12px;border-bottom:1px solid #e2e8f0;vertical-align:top;overflow-wrap:anywhere;word-break:break-word">${link ? `<a href="${link}" style="color:#c2410c">${value}</a>` : value}</td></tr>`;
  }).join("");
  const adminLink = safeLink(adminUrl);
  const html = `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#f1f5f9;color:#0f172a;font-family:Arial,'Hiragino Kaku Gothic ProN',Meiryo,sans-serif;font-size:14px;line-height:1.7"><div style="max-width:680px;margin:24px auto;background:#fff;border-top:5px solid #f97316;padding:24px 16px"><p style="margin:0;color:#c2410c;font-weight:700">SIEN.OFFICIAL</p><h1 style="font-size:23px;margin:8px 0 16px">新しい${escapeHtml(title)}が届きました</h1><p style="padding:14px;background:#fff7ed;border:1px solid #fed7aa;border-radius:8px">${notice}</p><table style="width:100%;border-collapse:collapse;table-layout:fixed">${rows}</table><p style="margin:24px 0 0">${adminLink ? `<a href="${adminLink}" style="display:inline-block;background:#ea580c;color:#fff;text-decoration:none;padding:10px 18px;border-radius:6px;font-weight:700">管理画面で依頼を開く</a>` : escapeHtml(adminUrl)}</p></div></body></html>`;
  return { text, html };
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
