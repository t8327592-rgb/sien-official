import type { PlanInput, OptionInput } from "@/lib/admin-types";
import { ApiError } from "@/lib/api-input";

function text(value: unknown, label: string, max: number, required = false) {
  if (value === undefined || value === null) value = "";
  if (typeof value !== "string" || value.length > max || (required && !value.trim())) throw new ApiError(400, `${label}を入力してください。`);
  return value.trim();
}
function active(value: unknown) {
  if (value !== undefined && typeof value !== "boolean") throw new ApiError(400, "公開設定を確認してください。");
  return value === true;
}
export function validatePlanContent(data: PlanInput) {
  const isActive = active(data.isActive);
  const name = text(data.name, "プラン名", 200, true);
  if (!["MIX", "ORIGINAL"].includes(data.category || "")) throw new ApiError(400, "カテゴリーを選択してください。");
  const price = data.price === undefined || data.price === null || data.price === "" ? null : Number(data.price);
  if (price !== null && ((!/^\d+$/.test(String(data.price).trim())) || !Number.isSafeInteger(price) || price > 2147483647)) throw new ApiError(400, "料金は0円以上の整数で入力してください。");
  const description = text(data.description, "説明文", 5000, isActive);
  const period = text(data.period, "目安納期", 300, isActive);
  const revisions = text(data.revisions, "無料修正の条件", 300, isActive);
  if (isActive && name === "新規プラン") throw new ApiError(400, "公開するプランの正式名称を入力してください。");
  return { name, category: data.category!, price, description, period, revisions, features: text(data.features, "提供内容", 10000), isActive };
}
export function validateOptionContent(data: OptionInput) {
  const isActive = active(data.isActive);
  const name = text(data.name, "オプション名", 200, true);
  if (!["MIX", "ORIGINAL", "COMMON"].includes(data.category || "")) throw new ApiError(400, "カテゴリーを選択してください。");
  if (isActive && name === "新規オプション") throw new ApiError(400, "公開するオプションの正式名称を入力してください。");
  return { name, category: data.category!, priceText: text(data.priceText, "料金テキスト", 300, isActive), description: text(data.description, "説明文", 5000, isActive), isActive };
}
