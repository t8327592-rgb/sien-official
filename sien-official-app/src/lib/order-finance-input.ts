import { ApiError } from "@/lib/api-input";

function invalid(label: string): never { throw new ApiError(400, `${label}を確認してください。`); }
export function financeMoney(value: unknown, nullable = false): number | null {
  if (nullable && value === null) return null;
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 2147483647) invalid("金額（0円以上の整数）");
  return value;
}
export function financeDate(value: unknown, nullable = false): Date | null {
  if (nullable && value === null) return null;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) invalid("日付");
  const utc = new Date(value + "T00:00:00Z");
  if (!Number.isFinite(utc.getTime()) || utc.toISOString().slice(0, 10) !== value) invalid("日付");
  return new Date(value + "T00:00:00+09:00");
}
export function financeVersion(value: unknown): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) invalid("更新番号");
  return value;
}
export function financeText(value: unknown, max: number, required = false): string {
  if (typeof value !== "string" || value.length > max || value.includes("\0") || (required && !value.trim())) invalid("入力内容");
  return value.trim();
}
