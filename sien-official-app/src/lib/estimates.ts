// Shared integer-yen calculation and document validation. No financial writes.
export type EstimateLine = {
  id: string; orderId: string; kind: "BASE" | "OPTION"; songTitle: string;
  name: string; quantity: number; unitPrice: number; note: string;
};
export type EstimateContent = {
  clientName: string; number: string; issuedOn: string; validUntil: string;
  lines: EstimateLine[];
  discount: { name: string; mode: "PERCENT" | "FIXED"; value: number; target: "ALL" | "BASE" | "OPTION" | "SELECTED"; lineIds: string[] };
  notes: string; paymentGuide: string; message: string;
};
export const yen = (amount: number) => `${amount.toLocaleString("ja-JP")}円`;
export function japanDay(now = new Date()) {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" }).format(now);
}
export function sameEstimateClient(orders: { clientEmail: string; clientName: string; customerType: string; companyName: string | null; isTest: boolean }[]) {
  if (orders.length < 2) return true;
  const normalize = (value: string) => value.normalize("NFKC").trim().toLowerCase();
  const first = orders[0];
  // Names alone, social handles, and blank emails are not safe identifiers.
  return !!first.clientEmail.trim() && orders.every(order =>
    order.clientEmail.trim().toLowerCase() === first.clientEmail.trim().toLowerCase() &&
    normalize(order.clientName) === normalize(first.clientName) &&
    order.customerType === first.customerType && order.isTest === first.isTest &&
    normalize(order.companyName || "") === normalize(first.companyName || ""));
}
export function estimateTotals(content: EstimateContent) {
  let base = 0, options = 0, eligible = 0;
  const eligibleByOrder = new Map<string, number>();
  for (const line of content.lines) {
    const amount = line.quantity * line.unitPrice;
    if (!Number.isSafeInteger(amount) || amount < 0) throw new Error("単価・数量を確認してください。");
    if (line.kind === "BASE") base += amount; else options += amount;
    const d = content.discount;
    if (d.target === "ALL" || d.target === line.kind || d.target === "SELECTED" && d.lineIds.includes(line.id)) {
      eligible += amount;
      eligibleByOrder.set(line.orderId, (eligibleByOrder.get(line.orderId) || 0) + amount);
    }
  }
  const subtotal = base + options, d = content.discount;
  if (!Number.isSafeInteger(subtotal) || subtotal > 2147483647) throw new Error("合計金額が上限を超えています。");
  if (!Number.isFinite(d.value) || d.value < 0 || d.mode === "PERCENT" && (d.value > 100 || Math.abs(d.value * 100 - Math.round(d.value * 100)) > 0.000001) || d.mode === "FIXED" && (!Number.isInteger(d.value) || d.value > eligible)) throw new Error("割引値を確認してください。固定割引は対象金額以下で指定してください。");
  // Existing salePrice floors the amount AFTER the discount, not the discount.
  // Each source order is priced separately by the public order endpoint. Sum
  // its rounded discount to keep a bundle equal to those individual estimates.
  const discount = d.mode === "FIXED" ? d.value : [...eligibleByOrder.values()].reduce((sum, amount) => sum + amount - Number(BigInt(amount) * BigInt(10000 - Math.round(d.value * 100)) / BigInt(10000)), 0);
  return { base, options, subtotal, eligible, discount, total: subtotal - discount };
}
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("入力形式を確認してください。");
  return value as Record<string, unknown>;
}
function text(value: unknown, max: number, required = false) {
  if (typeof value !== "string" || value.length > max || required && !value.trim() || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value)) throw new Error("文字入力の長さ・内容を確認してください。");
  return value.trim();
}
function date(value: unknown) {
  const day = text(value, 10, true);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !Number.isFinite(Date.parse(day)) || new Date(day).toISOString().slice(0, 10) !== day) throw new Error("日付を確認してください。");
  return day;
}
export function validateEstimate(value: unknown): EstimateContent {
  const body = object(value), d = object(body.discount);
  if (!Array.isArray(body.lines) || !body.lines.length || body.lines.length > 400) throw new Error("明細は1〜400行で指定してください。");
  const lines = body.lines.map(item => {
    const line = object(item);
    if (line.kind !== "BASE" && line.kind !== "OPTION" || !Number.isInteger(line.quantity) || Number(line.quantity) < 1 || Number(line.quantity) > 9999 || !Number.isInteger(line.unitPrice) || Number(line.unitPrice) < 0 || Number(line.unitPrice) > 100000000) throw new Error("明細の種類・数量・単価を確認してください。");
    return { id: text(line.id, 100, true), orderId: text(line.orderId, 100, true), kind: line.kind, songTitle: text(line.songTitle, 300, true), name: text(line.name, 150, true), quantity: Number(line.quantity), unitPrice: Number(line.unitPrice), note: text(line.note, 500) } as EstimateLine;
  });
  if (new Set(lines.map(line => line.id)).size !== lines.length) throw new Error("明細IDが重複しています。");
  if (!["ALL", "BASE", "OPTION", "SELECTED"].includes(String(d.target)) || !["PERCENT", "FIXED"].includes(String(d.mode)) || typeof d.value !== "number" || !Array.isArray(d.lineIds) || d.lineIds.length > 400 || d.lineIds.some(id => typeof id !== "string" || !lines.some(line => line.id === id))) throw new Error("割引対象を確認してください。");
  const issuedOn = date(body.issuedOn), validUntil = date(body.validUntil);
  if (validUntil < issuedOn) throw new Error("有効期限は発行日以降で指定してください。");
  const content: EstimateContent = {
    clientName: text(body.clientName, 180, true), number: text(body.number, 80, true), issuedOn, validUntil, lines,
    discount: { name: text(d.name, 150), mode: d.mode as "PERCENT" | "FIXED", target: d.target as EstimateContent["discount"]["target"], value: d.value, lineIds: d.lineIds as string[] },
    notes: text(body.notes, 6000), paymentGuide: text(body.paymentGuide, 4000), message: text(body.message, 8000),
  };
  estimateTotals(content);
  return content;
}
export function estimateMessage(content: EstimateContent) {
  const totals = estimateTotals(content), count = new Set(content.lines.filter(line => line.kind === "BASE").map(line => line.orderId)).size;
  return `${content.clientName.replace(/様$/, "")}様\n\nお世話になっております！\nこの度もご依頼いただき、誠にありがとうございます！\n\nご依頼いただいた全${count}曲のお見積書を作成いたしましたので、お送りいたします！\n\n${totals.discount ? `${content.discount.name || "割引"}${content.discount.mode === "PERCENT" ? `（${content.discount.value}%OFF）` : ""}を適用し、` : ""}合計${yen(totals.total)}（税込）となります。\n\n${content.paymentGuide ? content.paymentGuide + "\n\n" : ""}お手数ですが、ご確認いただけますと幸いです！\n引き続きよろしくお願いいたします！`;
}
