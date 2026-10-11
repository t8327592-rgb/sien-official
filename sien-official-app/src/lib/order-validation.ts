import { ApiError, textField } from "@/lib/api-input";
import { TERMS_VERSION } from "@/lib/contract-terms";
import { VOCAL_GUIDES } from "@/lib/vocal-guide";

export const CONTACT_METHODS = ["メール", "X (DM)", "Discord"] as const;
import { PAYMENT_METHODS } from "@/lib/order-payment";
export { PAYMENT_METHODS } from "@/lib/order-payment";
export const INQUIRY_TYPES = ["歌ってみたMIX・マスタリング", "オリジナル楽曲制作（ゲーム・アプリ等）", "企業PR・CM用楽曲制作", "その他音源制作・ディレクション", "お見積りのご依頼", "その他のお問い合わせ"] as const;

export function enumField(body: Record<string, unknown>, key: string, values: readonly string[], required = true) {
  const value = textField(body, key, required, 120);
  if ((!value && !required) || values.includes(value)) return value;
  throw new ApiError(400, `${key}の選択内容を確認してください。`);
}

export function urlField(body: Record<string, unknown>, key: string) {
  const value = textField(body, key, false, 2000);
  if (!value) return "";
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || /[\u0000-\u0020]/.test(value)) throw new Error();
    return url.href;
  } catch { throw new ApiError(400, `${key}にはhttpまたはhttpsのURLを入力してください。`); }
}

export function validateConsent(body: Record<string, unknown>) {
  if (body.termsAccepted !== true) throw new ApiError(400, "留意事項とプライバシーポリシーへの同意が必要です。");
  if (body.termsVersion !== TERMS_VERSION) throw new ApiError(409, "規約が更新されています。ページを再読み込みして内容を確認してください。");
  return { termsVersion: TERMS_VERSION, consentedAt: new Date() };
}

export function validateOrderFields(body: Record<string, unknown>, serviceType: string, planName: string) {
  const contactMethod = enumField(body, "contactMethod", CONTACT_METHODS);
  const twitterId = textField(body, "twitterId", contactMethod === "X (DM)", 120);
  if (twitterId && !/^@?[A-Za-z0-9_]{1,15}$/.test(twitterId)) throw new ApiError(400, "XのIDを確認してください。");
  const discordId = textField(body, "discordId", contactMethod === "Discord", 120);
  const isOriginal = serviceType === "ORIGINAL";
  const lyricsStatus = !isOriginal ? "" : planName.includes("フルパッケージ") ? "作詞含む（フルパッケージ）" : planName.includes("作詞持ち込み") ? "歌詞あり（持ち込み）" : enumField(body, "lyricsStatus", ["未定", "歌詞あり", "作詞から依頼したい"]);
  return {
    twitterId, discordId, contactMethod,
    paymentMethod: enumField(body, "paymentMethod", PAYMENT_METHODS),
    songTitle: textField(body, "songTitle", !isOriginal, 300),
    genre: textField(body, "genre", isOriginal, 300),
    deadline: textField(body, "deadline", false, 120),
    activityPurpose: textField(body, "activityPurpose", false, 120),
    lyricsStatus,
    vocalKey: isOriginal ? "" : enumField(body, "vocalKey", ["±0（原曲キー）", ...Array.from({ length: 6 }, (_, index) => `+${index + 1}`), ...Array.from({ length: 6 }, (_, index) => `-${index + 1}`), "その他"]),
    referenceFidelity: enumField(body, "referenceFidelity", ["1", "2", "3"], false),
    vocalGuideStatus: isOriginal ? enumField(body, "vocalGuideStatus", VOCAL_GUIDES) : "不要",
    referenceUrl: urlField(body, "referenceUrl"), materialsUrl: urlField(body, "materialsUrl"),
  };
}

export function validateOptionQuantities(value: unknown, options: { id: string; name: string }[]) {
  if (value === undefined) return {};
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new ApiError(400, "オプション数量を確認してください。");
  const result: Record<string, number> = {};
  for (const [id, quantity] of Object.entries(value)) {
    const option = options.find(option => option.id === id);
    if (!option || !option.name.includes("カットアップ") || typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1 || quantity > 360) throw new ApiError(400, "カットアップの数量を確認してください（1〜360単位）。");
    result[id] = quantity;
  }
  return result;
}
