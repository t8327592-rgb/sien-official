import { accountingParts } from "@/lib/admin-finance";
import { normalizeOrderStatus, ORDER_STATUS_OPTIONS } from "@/lib/order-status";

export const ACTIVE_ORDER_STATUSES = ["PENDING", "ESTIMATING", "WAITING_PAYMENT", "WORKING"];
export type OrderFilters = { status: string; due: string; service: string; q: string; sort: "desc" | "asc" | "deadline" };
export function parseOrderFilters(params: Record<string, string | string[] | undefined>): OrderFilters {
  return {
    status: typeof params.status === "string" && ORDER_STATUS_OPTIONS.some(option => option.value === params.status) ? params.status : "ALL",
    due: params.due === "today" || params.due === "overdue" ? params.due : "ALL",
    service: params.service === "MIX" || params.service === "ORIGINAL" ? params.service : "ALL",
    q: typeof params.q === "string" ? params.q.slice(0, 254) : "",
    sort: params.sort === "asc" || params.sort === "deadline" ? params.sort : "desc",
  };
}
export function orderFilterUrl(filters: OrderFilters, archived = false) {
  const params = new URLSearchParams();
  if (archived) params.set("archive", "1");
  for (const [key, value] of Object.entries(filters)) if (value && value !== "ALL" && !(key === "sort" && value === "desc")) params.set(key, value);
  return "/admin/orders" + (params.size ? "?" + params.toString() : "");
}
export function todayInJapan(now = new Date()) {
  const { year, month, day } = accountingParts(now);
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
// Ambiguous month/day-only values are not used to determine an overdue year.
export function confirmedDeadline(value: string | null | undefined) {
  const match = value?.trim().match(/^(\d{4})[-/年](\d{1,2})[-/月](\d{1,2})日?$/);
  if (!match) return null;
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
export function matchesOrderDue(order: { status: string; deadline: string | null }, due: string, today: string) {
  if (due === "ALL") return true;
  const deadline = confirmedDeadline(order.deadline);
  return ACTIVE_ORDER_STATUSES.includes(order.status) && deadline !== null && (due === "today" ? deadline === today : deadline < today);
}
export function matchesOrderStatus(status: string, selected: string) { return selected === "ALL" || normalizeOrderStatus(status) === selected; }
export function compareOrderDeadlines(a: { deadline: string | null; createdAt: Date | string }, b: { deadline: string | null; createdAt: Date | string }) {
  return (confirmedDeadline(a.deadline) || "9999-99-99").localeCompare(confirmedDeadline(b.deadline) || "9999-99-99") || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}
