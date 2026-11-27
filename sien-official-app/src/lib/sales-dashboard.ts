export type SalesSource = "DIRECT" | "PXSTUDIO" | "ALL";
export type SalesMode = "CASH" | "REVENUE";
export type SalesDirect = {
  id: string; orderId: string; clientName: string; songTitle: string; customerType: string;
  kind: "RECEIPT" | "REFUND" | "SALE"; date: string | null; amount: number | null;
  revenueOnHold?: boolean;
  fee: number; withholding: number; grossReference: number | null; hash: string;
};
export type SalesPx = {
  id: string; clientName: string; songTitle: string; sentOn: string; gross: number;
  fee: number; withholding: number; net: number; paymentStatus: string; hash: string;
  revenueOn: string | null; accountingVersion: number; accountingCurrent: boolean;
};
export type SalesReview = {
  directId: string; pxEntryId: string; status: string; amount: number; fee: number;
  withholding: number; sourceHash: string; reason: string; version: number;
};
export type SalesData = { direct: SalesDirect[]; px: SalesPx[]; cashReviews: SalesReview[]; revenueReviews: SalesReview[] };
export type SalesPair = {
  mode: SalesMode; direct: SalesDirect; px: SalesPx; reasons: string[]; currentHash: string;
  state: "PENDING" | "STALE" | "DISTINCT" | "DUPLICATE"; review: SalesReview | null;
};
export type SalesEvent = { id: string; source: Exclude<SalesSource, "ALL">; label: string; date: string; amount: number; fee: number; withholding: number; kind: string };
export type SalesUnknown = { id: string; source: Exclude<SalesSource, "ALL">; label: string; amount: number | null; reason: string };
const normalize = (s: string) => s.normalize("NFKC").toLocaleLowerCase().replace(/\s+/g, "");
export const salesPairKey = (d: string, p: string) => JSON.stringify([d, p]);
export const salesPairHash = (mode: SalesMode, d: SalesDirect, p: SalesPx) => JSON.stringify([mode, d.hash, p.hash, ...(mode === "REVENUE" ? [p.revenueOn, p.accountingVersion, p.accountingCurrent] : [])]);
export const pxCashConfirmed = (p: SalesPx) => p.paymentStatus === "送金済み";

function candidateReasons(d: SalesDirect, p: SalesPx) {
  const client = !!normalize(d.clientName) && normalize(d.clientName) === normalize(p.clientName);
  const song = !!normalize(d.songTitle) && normalize(d.songTitle) === normalize(p.songTitle);
  const amount = d.grossReference !== null && d.grossReference === p.gross;
  const near = !!d.date && Math.abs(new Date(d.date + "T00:00:00Z").getTime() - new Date(p.sentOn + "T00:00:00Z").getTime()) <= 45 * 86400000;
  if (client && song) return ["依頼者名・楽曲名が一致"];
  if (song && amount) return ["楽曲名・控除前金額が一致"];
  if (client && amount && near) return ["依頼者名・控除前金額が一致し日付が45日以内"];
  return [];
}

function pairsFor(data: SalesData, mode: SalesMode): SalesPair[] {
  const direct = data.direct.filter(d => mode === "CASH" ? d.kind === "RECEIPT" : d.kind === "SALE" && !d.revenueOnHold && d.amount !== null && !!d.date);
  const reviews = new Map((mode === "CASH" ? data.cashReviews : data.revenueReviews).map(r => [salesPairKey(r.directId, r.pxEntryId), r]));
  const pairs: SalesPair[] = [];
  for (const d of direct) for (const p of data.px) {
    const review = reviews.get(salesPairKey(d.id, p.id)) || null;
    const reasons = (mode === "CASH" && !pxCashConfirmed(p)) ? [] : candidateReasons(d, p);
    if (!review && !reasons.length) continue;
    const currentHash = salesPairHash(mode, d, p);
    let state: SalesPair["state"] = !review || review.status === "PENDING" ? "PENDING" : review.sourceHash !== currentHash ? "STALE" : review.status === "DISTINCT" ? "DISTINCT" : "DUPLICATE";
    if (state === "DUPLICATE" && (mode === "CASH" ? !pxCashConfirmed(p) : !p.accountingCurrent || !p.revenueOn)) state = "STALE";
    pairs.push({ mode, direct: d, px: p, reasons: reasons.length ? reasons : ["手動で指定した組み合わせ"], currentHash, state, review });
  }
  // A source revision or inconsistent allocation must never produce a negative remainder.
  const sums = new Map<string, { amount: number; fee: number; withholding: number }>();
  for (const pair of pairs.filter(p => p.state === "DUPLICATE")) for (const key of ["d:" + pair.direct.id, "p:" + pair.px.id]) {
    const s = sums.get(key) || { amount: 0, fee: 0, withholding: 0 };
    s.amount += pair.review!.amount; s.fee += pair.review!.fee; s.withholding += pair.review!.withholding; sums.set(key, s);
  }
  const invalid = new Set<string>();
  for (const pair of pairs.filter(p => p.state === "DUPLICATE")) {
    const d = sums.get("d:" + pair.direct.id)!, p = sums.get("p:" + pair.px.id)!;
    if (d.amount > pair.direct.amount! || d.fee > pair.direct.fee || d.withholding > pair.direct.withholding) invalid.add("d:" + pair.direct.id);
    if (p.amount > (mode === "CASH" ? pair.px.net : pair.px.gross) || p.fee > pair.px.fee || p.withholding > pair.px.withholding) invalid.add("p:" + pair.px.id);
    if ([pair.review!.amount, pair.review!.fee, pair.review!.withholding].some(n => n < 0 || !Number.isSafeInteger(n))) { invalid.add("d:" + pair.direct.id); invalid.add("p:" + pair.px.id); }
  }
  for (const pair of pairs) if (pair.state === "DUPLICATE" && (invalid.has("d:" + pair.direct.id) || invalid.has("p:" + pair.px.id))) { pair.state = "STALE"; pair.reasons = [...pair.reasons, "重複除外額の割当を再確認してください"]; }
  return pairs;
}

export function buildSalesState(data: SalesData, mode: SalesMode) {
  const pairs = pairsFor(data, mode);
  const heldIds = new Set(pairs.filter(p => p.state === "PENDING" || p.state === "STALE").map(p => p.direct.id));
  const direct = data.direct.filter(d => mode === "CASH" ? d.kind !== "SALE" : d.kind === "SALE");
  const held = direct.filter(d => heldIds.has(d.id));
  const events: SalesEvent[] = [];
  const unknown: SalesUnknown[] = [];
  for (const d of direct) {
    const label = `${d.clientName}／${d.songTitle || "楽曲名未登録"}`;
    if (d.revenueOnHold) { unknown.push({ id: d.id, source: "DIRECT", label, amount: d.amount, reason: "売上計上を保留中" }); continue; }
    if (d.amount === null || !d.date) { unknown.push({ id: d.id, source: "DIRECT", label, amount: d.amount, reason: d.amount === null ? "確定金額未確認" : "売上計上日未確認" }); continue; }
    if (heldIds.has(d.id)) continue;
    const allocations = pairs.filter(p => p.direct.id === d.id && p.state === "DUPLICATE").map(p => p.review!);
    const amount = d.amount - allocations.reduce((s, r) => s + r.amount, 0);
    const fee = d.fee - allocations.reduce((s, r) => s + r.fee, 0);
    const withholding = d.withholding - allocations.reduce((s, r) => s + r.withholding, 0);
    if (allocations.length && amount === 0 && fee === 0 && withholding === 0) continue;
    events.push({ id: "direct:" + d.id, source: "DIRECT", label, date: d.date, amount, fee, withholding, kind: d.kind === "REFUND" ? "返金" : mode === "CASH" ? "入金" : "売上" });
  }
  for (const p of data.px) {
    const label = `${p.clientName}／${p.songTitle}`;
    if (mode === "CASH" && !pxCashConfirmed(p)) { unknown.push({ id: p.id, source: "PXSTUDIO", label, amount: p.net, reason: `送金未確認（${p.paymentStatus}）` }); continue; }
    if (mode === "REVENUE" && (!p.revenueOn || !p.accountingCurrent)) { unknown.push({ id: p.id, source: "PXSTUDIO", label, amount: p.gross, reason: p.accountingVersion && !p.accountingCurrent ? "CSV更新後の計上日を再確認" : "売上計上日未確認" }); continue; }
    events.push({ id: "px:" + p.id, source: "PXSTUDIO", label, date: mode === "CASH" ? p.sentOn : p.revenueOn!, amount: mode === "CASH" ? p.net : p.gross,
      fee: mode === "CASH" ? p.fee : 0, withholding: mode === "CASH" ? p.withholding : 0, kind: mode === "CASH" ? "送金" : "売上" });
  }
  return { pairs, held, events, unknown };
}

export function salesSummary(events: SalesEvent[], year: number, month: number | null = null, source: SalesSource = "ALL") {
  const months = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, direct: 0, px: 0, total: 0, fee: 0, withholding: 0, count: 0 }));
  for (const e of events) {
    if (e.date.slice(0, 4) !== String(year) || (source !== "ALL" && e.source !== source)) continue;
    const m = months[Number(e.date.slice(5, 7)) - 1];
    if (e.source === "DIRECT") m.direct += e.amount; else m.px += e.amount;
    m.total += e.amount; m.fee += e.fee; m.withholding += e.withholding; m.count++;
  }
  const total = months.filter(m => month === null || m.month === month).reduce((s, m) => ({ direct: s.direct + m.direct, px: s.px + m.px, total: s.total + m.total, fee: s.fee + m.fee, withholding: s.withholding + m.withholding, count: s.count + m.count }), { direct: 0, px: 0, total: 0, fee: 0, withholding: 0, count: 0 });
  return { months, total };
}
