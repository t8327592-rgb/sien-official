export const ORDER_STATUS_OPTIONS = [
  { value: "PENDING", label: "未対応", colorClass: "bg-orange-50 text-orange-600 border-orange-200" },
  { value: "ESTIMATING", label: "見積中", colorClass: "bg-amber-50 text-amber-600 border-amber-200" },
  { value: "WAITING_PAYMENT", label: "入金待ち", colorClass: "bg-sky-50 text-sky-600 border-sky-200" },
  { value: "WORKING", label: "作業中", colorClass: "bg-blue-50 text-blue-600 border-blue-200" },
  { value: "COMPLETED", label: "納品済", colorClass: "bg-green-50 text-green-600 border-green-200" },
  { value: "CANCELED", label: "キャンセル", colorClass: "bg-slate-100 text-slate-600 border-slate-200" },
] as const;
export type OrderStatus = typeof ORDER_STATUS_OPTIONS[number]["value"];
export const ORDER_STATUS_LABELS: Record<string, string> = {
  ...Object.fromEntries(ORDER_STATUS_OPTIONS.map(option => [option.value, option.label])),
  CANCELLED: "キャンセル",
};
export const ORDER_STATUS_COLORS: Record<string, string> = Object.fromEntries(
  ORDER_STATUS_OPTIONS.map(option => [option.value, option.colorClass]),
);
export function normalizeOrderStatus(value: string) {
  return value === "CANCELLED" ? "CANCELED" : value;
}
