import type { Order } from "@prisma/client";
import { ApiError, emailField } from "@/lib/api-input";
import { normalizeOrderStatus, ORDER_STATUS_OPTIONS } from "@/lib/order-status";
import { normalizePaymentMethod, ADMIN_PAYMENT_OPTIONS } from "@/lib/order-payment";

type EditableField = "status" | "price" | "basePrice" | "optionPrice" | "paymentMethod" | "deadline" | "serviceType" | "planId" | "songTitle" | "vocalKey" | "genre" | "lyricsStatus" | "vocalGuideStatus" | "referenceFidelity" | "options" | "message" | "clientName" | "clientEmail" | "twitterId" | "discordId" | "isRepeater" | "isArchived";
export type AdminOrderUpdate = Partial<Pick<Order, EditableField>>;
const TEXT_FIELDS = {
  planId: ["プラン", 300], songTitle: ["曲名", 300], vocalKey: ["歌唱キー", 120],
  genre: ["ジャンル", 300], lyricsStatus: ["作詞", 300], vocalGuideStatus: ["仮歌", 300],
  options: ["オプション", 5000], message: ["メッセージ", 10000], twitterId: ["XのID", 120], discordId: ["DiscordのID", 120],
} as const;

function invalid(field: string): never { throw new ApiError(400, `${field}の入力を確認してください。`); }
function optionalText(value: unknown, label: string, max: number): string | null {
  if (value === null || value === "") return null;
  if (typeof value !== "string" || value.length > max || value.includes("\0")) invalid(label);
  return value.trim() || null;
}
export function validateAdminOrderUpdate(body: Record<string, unknown>): AdminOrderUpdate {
  const data: AdminOrderUpdate = {};
  const allowed = new Set([...Object.keys(TEXT_FIELDS), "status", "serviceType", "paymentMethod", "deadline", "referenceFidelity", "clientName", "clientEmail", "isRepeater", "isArchived", "price", "basePrice", "optionPrice"]);
  if (Object.keys(body).some(key => !allowed.has(key))) invalid("更新項目");
  for (const key of Object.keys(TEXT_FIELDS) as (keyof typeof TEXT_FIELDS)[]) {
    const [label, max] = TEXT_FIELDS[key];
    if (body[key] !== undefined) data[key] = optionalText(body[key], label, max);
  }
  if (body.status !== undefined) {
    if (typeof body.status !== "string") invalid("ステータス");
    const status = normalizeOrderStatus(body.status);
    if (!ORDER_STATUS_OPTIONS.some(option => option.value === status)) invalid("ステータス");
    data.status = status;
  }
  if (body.serviceType !== undefined) {
    if (typeof body.serviceType !== "string" || !["MIX", "ORIGINAL", "GUIDE"].includes(body.serviceType)) invalid("サービス");
    data.serviceType = body.serviceType;
  }
  if (body.paymentMethod !== undefined) {
    const value = optionalText(body.paymentMethod, "お支払い方法", 120);
    const payment = value === null ? null : normalizePaymentMethod(value);
    if (payment !== null && !ADMIN_PAYMENT_OPTIONS.some(option => option.value === payment)) invalid("お支払い方法");
    data.paymentMethod = payment;
  }
  if (body.referenceFidelity !== undefined) {
    const value = optionalText(body.referenceFidelity, "参考曲との近さ", 1);
    if (value !== null && !["1", "2", "3"].includes(value)) invalid("参考曲との近さ");
    data.referenceFidelity = value;
  }
  if (body.deadline !== undefined) {
    const value = optionalText(body.deadline, "納期", 10);
    if (value !== null) {
      const date = new Date(value + "T00:00:00Z");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) invalid("納期の日付");
    }
    data.deadline = value;
  }
  if (body.clientName !== undefined) {
    const value = optionalText(body.clientName, "お名前", 100);
    if (!value) invalid("お名前");
    data.clientName = value;
  }
  if (body.clientEmail !== undefined) data.clientEmail = emailField(body, "clientEmail");
  for (const key of ["isRepeater", "isArchived"] as const) {
    if (body[key] !== undefined) {
      if (typeof body[key] !== "boolean") invalid(key === "isRepeater" ? "顧客種別" : "アーカイブ");
      data[key] = body[key];
    }
  }
  for (const key of ["price", "basePrice", "optionPrice"] as const) {
    const value = body[key];
    if (value === undefined) continue;
    if (value !== null && (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 2147483647)) invalid("金額（0円以上の整数）");
    data[key] = value as number | null;
  }
  if (!Object.keys(data).length) invalid("更新項目");
  return data;
}

export function reconcileAdminOrderPrice(data: AdminOrderUpdate, current: Pick<Order, "basePrice" | "optionPrice">) {
  const base = data.basePrice === undefined ? current.basePrice : data.basePrice;
  const option = data.optionPrice === undefined ? current.optionPrice : data.optionPrice;
  const total = base === null && option === null ? null : (base ?? 0) + (option ?? 0);
  if (total !== null && total > 2147483647) invalid("合計金額");
  if (data.price !== undefined && total !== null && data.price !== total) {
    throw new ApiError(400, "合計金額と基本料金・オプション料金が一致しません。先に内訳を修正してください。");
  }
  if (data.price === undefined && (data.basePrice !== undefined || data.optionPrice !== undefined)) data.price = total;
}
