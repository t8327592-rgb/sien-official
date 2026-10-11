import type { OrderRecord } from "@/lib/admin-types";

export function parseAdminMoney(value: string): number | null {
  if (!value.trim()) return null;
  if (!/^\d+$/.test(value.trim())) throw new Error("金額は0円以上の整数で入力してください。");
  const amount = Number(value);
  if (!Number.isSafeInteger(amount) || amount > 2147483647) throw new Error("金額が大きすぎます。");
  return amount;
}

export async function patchAdminOrder(id: string, body: object): Promise<OrderRecord> {
  let response: Response;
  try {
    response = await fetch(`/api/admin/orders/${encodeURIComponent(id)}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    });
  } catch { throw new Error("通信に失敗しました。入力内容は保持しています。保存状態を確認してから再試行してください。"); }
  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.success || data.order?.id !== id) {
    throw new Error(typeof data?.error === "string" ? data.error : "保存に失敗しました。入力内容は保持しています。");
  }
  return data.order;
}

export async function syncAdminDeadline(orderId: string, deadline: string) {
  const response = await fetch("/api/admin/calendar/sync", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId, deadline }),
    signal: AbortSignal.timeout(15000),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.success) throw new Error("納期は保存しましたが、カレンダー同期に失敗しました。詳細画面から再試行してください。");
  return data.synced === false ? "納期を保存しました（カレンダー連携は未設定です）" : "納期を保存し、カレンダーに同期しました";
}

export async function setClientRepeater(id: string, isRepeater: boolean): Promise<string[]> {
  let response: Response;
  try {
    response = await fetch(`/api/admin/orders/${encodeURIComponent(id)}/repeater`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isRepeater }), signal: AbortSignal.timeout(15000),
    });
  } catch { throw new Error("通信に失敗しました。保存状態を確認してから再試行してください。"); }
  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.success || data.isRepeater !== isRepeater || !Array.isArray(data.ids) || !data.ids.includes(id) || !data.ids.every((value: unknown) => typeof value === "string")) {
    throw new Error(typeof data?.error === "string" ? data.error : "顧客種別の更新に失敗しました。");
  }
  return data.ids;
}
