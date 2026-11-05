"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Order, PaymentRecord } from "@prisma/client";
import type { BrowserRecord } from "@/lib/admin-types";
import { activePayments, settledAmount, signedCash } from "@/lib/order-accounting";
import { accountingParts } from "@/lib/admin-finance";

type FinanceOrder = BrowserRecord<Order> & { payments: BrowserRecord<PaymentRecord>[] };
const dateInput = (date: Date | string | null) => {
  if (!date) return "";
  const d = accountingParts(date);
  return `${d.year}-${String(d.month + 1).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;
};
const yen = (n: number) => `¥${n.toLocaleString()}`;
const input = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base";
const button = "rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50";

export function OrderFinanceEditor({ initialOrder }: { initialOrder: FinanceOrder }) {
  const router = useRouter();
  const [order, setOrder] = useState(initialOrder);
  const [confirmed, setConfirmed] = useState(initialOrder.confirmedPrice?.toString() ?? "");
  const [revenueAt, setRevenueAt] = useState(dateInput(initialOrder.revenueAt));
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [notice, setNotice] = useState("");
  const [payment, setPayment] = useState({ kind: "RECEIPT", amount: "", fee: "0", withholding: "0", paidAt: dateInput(new Date()), memo: "" });
  const paymentRequest = useRef<{ body: string; key: string } | null>(null);
  const [voidId, setVoidId] = useState("");
  const [reason, setReason] = useState("");
  const money = (value: string, nullable = false) => {
    if (!value.trim() && nullable) return null;
    if (!/^\d+$/.test(value) || Number(value) > 2147483647) throw Error("金額は0円以上の整数で入力してください。");
    return Number(value);
  };
  const save = async (body: Record<string, unknown>) => {
    if (busyRef.current) return false;
    busyRef.current = true; setBusy(true); setNotice("");
    try {
      const response = await fetch(`/api/admin/orders/${order.id}/finance`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, version: order.financeVersion }) });
      const result = await response.json();
      if (!response.ok || !result.success) throw Error(result.error || "保存できませんでした。");
      setOrder(result.order); setNotice("保存しました。"); router.refresh(); return true;
    } catch (error) { setNotice(error instanceof Error ? error.message : "通信に失敗しました。記録を確認してから再送してください。"); return false; }
    finally { busyRef.current = false; setBusy(false); }
  };
  const payments = activePayments(order);
  const cash = payments.reduce((s, p) => s + signedCash(p), 0);
  const settled = payments.reduce((s, p) => s + settledAmount(p), 0);
  const remaining = order.confirmedPrice === null ? null : order.confirmedPrice - settled;

  return <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm" aria-labelledby="finance-heading">
    <div className="flex flex-wrap justify-between gap-3 items-start"><div><h2 id="finance-heading" className="text-xl font-bold text-slate-900">確定金額・入金</h2><p className="mt-1 text-sm text-slate-500">見積と確定金額、実際に受け取った金額を分けて管理します。</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${order.isTest ? "bg-purple-100 text-purple-800" : "bg-slate-100 text-slate-600"}`}>{order.isTest ? "テスト・集計対象外" : "通常の案件"}</span></div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {[["見積・旧金額", order.price], ["確定金額", order.confirmedPrice], ["実入金（返金差引）", cash], [remaining !== null && remaining < 0 ? "超過入金" : "未収額", remaining === null ? null : Math.abs(remaining)]].map(([label, value]) => <div key={String(label)} className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-lg font-bold text-slate-900">{typeof value === "number" ? yen(value) : "未設定"}</p></div>)}
    </div>
    <form onSubmit={async e => { e.preventDefault(); try { await save({ action: "confirm", confirmedPrice: money(confirmed, true), revenueAt: revenueAt || null }); } catch (error) { setNotice((error as Error).message); } }} className="grid sm:grid-cols-2 gap-4">
      <label className="text-sm font-bold text-slate-700">確定金額（税込・円）<input className={`${input} mt-1`} inputMode="numeric" value={confirmed} onChange={e => setConfirmed(e.target.value)} placeholder="未確定の場合は空欄" /></label>
      <label className="text-sm font-bold text-slate-700">売上計上日<input className={`${input} mt-1`} type="date" value={revenueAt} onChange={e => setRevenueAt(e.target.value)} /></label>
      <p className="sm:col-span-2 text-xs leading-relaxed text-slate-500">売上は「確定金額＋売上計上日」で集計します。計上日が未入力の案件・キャンセル・テストは売上と平均案件単価から除外します。入金日や申込日からは推測しません。</p>
      <div className="sm:col-span-2"><button disabled={busy} className={button}>確定金額・計上日を保存</button></div>
    </form>
    <details className="border-t pt-4" open={undefined}>
      <summary className="cursor-pointer py-2 font-bold text-slate-800">入金・返金を登録する</summary>
      <form onSubmit={async e => { e.preventDefault(); try {
        const body = { action: "payment", ...payment, amount: money(payment.amount), fee: money(payment.fee), withholding: money(payment.withholding) };
        const fingerprint = JSON.stringify(body);
        if (paymentRequest.current?.body !== fingerprint) paymentRequest.current = { body: fingerprint, key: crypto.randomUUID() };
        if (await save({ ...body, requestKey: paymentRequest.current.key })) { setPayment({ ...payment, amount: "", fee: "0", withholding: "0", memo: "" }); paymentRequest.current = null; }
      } catch (error) { setNotice((error as Error).message); } }} className="mt-3 grid sm:grid-cols-2 gap-4">
        <label className="text-sm">区分<select className={`${input} mt-1`} value={payment.kind} onChange={e => setPayment({ ...payment, kind: e.target.value, fee: "0", withholding: "0" })}><option value="RECEIPT">入金</option><option value="REFUND">返金</option></select></label>
        <label className="text-sm">入金・返金日<input required className={`${input} mt-1`} type="date" value={payment.paidAt} onChange={e => setPayment({ ...payment, paidAt: e.target.value })} /></label>
        {[["amount", "実際の入金・返金額（円）"], ["fee", "差し引かれた振込手数料（円）"], ["withholding", "源泉徴収額（円）"]].map(([field, label]) => <label key={field} className="text-sm">{label}<input className={`${input} mt-1`} inputMode="numeric" required disabled={payment.kind === "REFUND" && field !== "amount"} value={payment[field as "amount" | "fee" | "withholding"]} onChange={e => setPayment({ ...payment, [field]: e.target.value })} /></label>)}
        <label className="text-sm">メモ<input maxLength={1000} className={`${input} mt-1`} value={payment.memo} onChange={e => setPayment({ ...payment, memo: e.target.value })} /></label>
        <p className="sm:col-span-2 text-xs leading-relaxed text-slate-500">分割入金も登録できます。未収額は「確定金額 − 実入金 − 手数料 − 源泉徴収 ＋ 返金」で計算します。未確定でも入金記録は残せます。</p>
        <div><button disabled={busy} className={button}>入金・返金を登録</button></div>
      </form>
    </details>
    <div className="space-y-2 border-t pt-4"><h3 className="font-bold text-sm text-slate-700">入金履歴</h3>
      {!order.payments.length && <p className="text-sm text-slate-500">入金記録はありません。</p>}
      {order.payments.map(p => <div key={p.id} className={`rounded-lg border p-3 text-sm ${p.voidedAt ? "bg-slate-50 text-slate-500" : "bg-white"}`}>
        <div className="flex flex-wrap gap-2 justify-between"><span>{dateInput(p.paidAt)} · {p.kind === "REFUND" ? "返金" : "入金"} <strong>{yen(p.amount)}</strong>{p.voidedAt && " · 取消済み"}</span>{!p.voidedAt && <button disabled={busy} type="button" className="text-red-700 underline" onClick={() => { setVoidId(p.id); setReason(""); }}>誤登録を取り消す</button>}</div>
        <p className="text-xs mt-1">手数料 {yen(p.fee)}／源泉徴収 {yen(p.withholding)}{p.memo && ` · ${p.memo}`}</p>
        {p.voidReason && <p className="mt-1 text-xs">取消理由：{p.voidReason}</p>}
      </div>)}
      {voidId && <form className="flex flex-wrap gap-2" onSubmit={async e => { e.preventDefault(); if (await save({ action: "void", paymentId: voidId, reason })) setVoidId(""); }}><input aria-label="取消理由" required maxLength={500} value={reason} onChange={e => setReason(e.target.value)} placeholder="取消理由（必須）" className={`${input} flex-1`} /><button disabled={busy} className={button}>取消を確定</button><button type="button" onClick={() => setVoidId("")}>戻る</button></form>}
    </div>
    <details className="border-t pt-3 text-sm"><summary className="cursor-pointer py-2 text-slate-500">テストデータの区分</summary><p className="text-xs my-2 text-slate-500">テストにすると通常一覧・売上集計から除外します。元の問い合わせや履歴は残ります。</p><button className="rounded-lg border px-3 py-2 disabled:opacity-50" disabled={busy} onClick={() => { if (window.confirm(order.isTest ? "通常の案件に戻しますか？集計対象になります。" : "テストデータとして区別しますか？集計対象から外れます。")) void save({ action: "classify", isTest: !order.isTest }); }}>{order.isTest ? "通常の案件に戻す" : "テストデータにする"}</button></details>
    {notice && <p role="status" className="rounded-lg bg-slate-100 p-3 text-sm text-slate-800">{notice}</p>}
  </section>;
}
