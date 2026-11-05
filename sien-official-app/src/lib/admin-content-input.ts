import { ApiError, emailField } from "@/lib/api-input";
import { financeDate, financeMoney } from "@/lib/order-finance-input";

export function adminText(value: unknown, label: string, max = 5000, required = false): string {
  if (value === undefined || value === null) value = "";
  if (typeof value !== "string" || value.includes("\0") || value.length > max || (required && !value.trim())) throw new ApiError(400, `${label}を確認してください。`);
  return value.trim();
}
export function adminBoolean(value: unknown, fallback = false) {
  if (value === undefined) return fallback;
  if (typeof value !== "boolean") throw new ApiError(400, "公開・表示設定を確認してください。");
  return value;
}
export function adminInteger(value: unknown, label = "表示順") {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 2147483647) throw new ApiError(400, `${label}は0以上の整数で入力してください。`);
  return value;
}
export function adminWebUrl(value: unknown, label = "URL") {
  const text = adminText(value, label, 2000);
  if (!text) return null;
  try {
    const url = new URL(text);
    if (["https:", "http:"].includes(url.protocol) && !url.username && !url.password && !/[\s\\\u0000-\u001f]/.test(text)) return url.href;
  } catch { /* Report the original field without saving a broken link. */ }
  throw new ApiError(400, `${label}には http:// または https:// で始まるURLを入力してください。`);
}
export function validateReception(data: { orderStatus?: unknown; announcement?: unknown }) {
  if (!["AVAILABLE", "BUSY", "UNAVAILABLE"].includes(String(data.orderStatus))) throw new ApiError(400, "受付ステータスを選択してください。");
  return { orderStatus: data.orderStatus as string, acceptingOrders: data.orderStatus !== "UNAVAILABLE", announcement: adminText(data.announcement, "サイト案内メッセージ", 2000) || null };
}
export function validateSiteContent(data: Record<string, unknown>) {
  return {
    ...(data.twitterUrl !== undefined ? { twitterUrl: adminWebUrl(data.twitterUrl, "XのURL") } : {}),
    ...(data.youtubeUrl !== undefined ? { youtubeUrl: adminWebUrl(data.youtubeUrl, "YouTubeのURL") } : {}),
    ...(data.contactEmail !== undefined ? { contactEmail: data.contactEmail === null || data.contactEmail === "" ? null : emailField(data, "contactEmail") } : {}),
    ...(data.ctaTitle !== undefined ? { ctaTitle: adminText(data.ctaTitle, "共通CTAタイトル", 300) || null } : {}),
    ...(data.ctaDescription !== undefined ? { ctaDescription: adminText(data.ctaDescription, "共通CTA説明文", 2000) || null } : {}),
    ...(data.footerText !== undefined ? { footerText: adminText(data.footerText, "フッターテキスト", 5000) || null } : {}),
  };
}
export function validateProfileContent(data: Record<string, unknown>) {
  return { name: adminText(data.name, "名前", 120, true), title: adminText(data.title, "肩書き", 300) || null,
    bioShort: adminText(data.bioShort, "短い紹介文", 2000) || null, bioLong: adminText(data.bioLong, "紹介文", 20000) || null,
    achievements: adminText(data.achievements, "実績情報", 10000) || null };
}
export const EXPENSE_CATEGORIES = ["ソフトウェア", "機材", "通信費", "消耗品", "外注費", "交通費", "その他"];
type ExpenseInput = { title: string; amount: number; category: string; date: Date };
export function validateExpense(data: Record<string, unknown>, partial?: false): ExpenseInput;
export function validateExpense(data: Record<string, unknown>, partial: true): Partial<ExpenseInput>;
export function validateExpense(data: Record<string, unknown>, partial = false) {
  const result: { title?: string; amount?: number; category?: string; date?: Date } = {};
  if (!partial || data.title !== undefined) result.title = adminText(data.title, "経費の項目名", 300, true);
  if (!partial || data.amount !== undefined) result.amount = financeMoney(data.amount)!;
  if (!partial || data.category !== undefined) {
    const category = adminText(data.category, "経費カテゴリ", 120, true);
    // Preserve pre-existing custom categories while rejecting empty/malformed values.
    result.category = category;
  }
  if (!partial || data.date !== undefined) result.date = financeDate(data.date)!;
  if (!Object.keys(result).length) throw new ApiError(400, "更新する項目がありません。");
  return result;
}
type ReviewInput = { name: string; serviceType: string; content: string; rating: number; isPublished: boolean; orderIndex: number };
export function validateReview(data: Record<string, unknown>, partial?: false): ReviewInput;
export function validateReview(data: Record<string, unknown>, partial: true): Partial<ReviewInput>;
export function validateReview(data: Record<string, unknown>, partial = false) {
  const result: { name?: string; serviceType?: string; content?: string; rating?: number; isPublished?: boolean; orderIndex?: number } = {};
  for (const key of ["name", "serviceType", "content"] as const) if (!partial || data[key] !== undefined) result[key] = adminText(data[key], { name: "お名前", serviceType: "利用サービス", content: "レビュー本文" }[key], key === "content" ? 10000 : 300, true);
  if (!partial || data.rating !== undefined) {
    const rating = data.rating ?? 5;
    if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) throw new ApiError(400, "評価は1〜5で指定してください。");
    result.rating = rating;
  }
  if (!partial || data.isPublished !== undefined) result.isPublished = adminBoolean(data.isPublished, true);
  if (!partial || data.orderIndex !== undefined) result.orderIndex = adminInteger(data.orderIndex ?? 0);
  if (!Object.keys(result).length) throw new ApiError(400, "更新する項目がありません。");
  return result;
}
export function validateOrderSequence(value: unknown): { id: string; orderIndex: number }[] {
  if (!Array.isArray(value) || !value.length || value.length > 5000) throw new ApiError(400, "並び順を確認してください。");
  const rows = value.map(item => ({ id: adminText(item?.id, "ID", 100, true), orderIndex: adminInteger(item?.orderIndex) }));
  if (new Set(rows.map(r => r.id)).size !== rows.length || new Set(rows.map(r => r.orderIndex)).size !== rows.length) throw new ApiError(400, "並び順に重複があります。");
  return rows;
}

export function validateFAQContent(data: Record<string, unknown>) {
  if (!["COMMON", "MIX", "ORIGINAL"].includes(String(data.category))) throw new ApiError(400, "FAQのカテゴリを選択してください。");
  return { question: adminText(data.question, "質問", 1000, true), answer: adminText(data.answer, "回答", 20000, true), category: data.category as string, isPublished: adminBoolean(data.isPublished, true), orderIndex: adminInteger(data.orderIndex ?? 0) };
}
export function validateServiceContent(data: Record<string, unknown>) {
  if (!["MIX", "ORIGINAL", "OTHER"].includes(String(data.category))) throw new ApiError(400, "サービスのカテゴリを選択してください。");
  return { name: adminText(data.name, "サービス名", 300, true), category: data.category as string, description: adminText(data.description, "説明文", 10000) || null,
    features: adminText(data.features, "提供内容", 10000) || null, iconName: adminText(data.iconName, "アイコン名", 120) || null,
    isPublished: adminBoolean(data.isPublished, true), orderIndex: adminInteger(data.orderIndex ?? 0) };
}
export function validateCampaignContent(data: Record<string, unknown>) {
  const date = (value: unknown) => {
    if (value == null) return null;
    if (!(value instanceof Date) || !Number.isFinite(value.getTime())) throw new ApiError(400, "キャンペーンの日付を確認してください。");
    return value;
  };
  const startDate = date(data.startDate), endDate = date(data.endDate);
  if (startDate && endDate && startDate > endDate) throw new ApiError(400, "終了日は開始日以降にしてください。");
  const targetPlanId = adminText(data.targetPlanId, "対象プラン", 100) || null;
  const isActive = adminBoolean(data.isActive, true);
  if (isActive && !targetPlanId) throw new ApiError(400, "対象プランを指定してください。全プラン一律の変更には対応していません。");
  return { name: adminText(data.name, "キャンペーン名", 300, true), targetPlanId, campaignPrice: financeMoney(data.campaignPrice)!, originalPrice: financeMoney(data.originalPrice ?? null, true), startDate, endDate, isActive, description: adminText(data.description, "説明文", 10000) || null };
}
