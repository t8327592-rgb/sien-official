"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BusinessRecord } from "@/lib/admin-types";
import { accountingParts } from "@/lib/admin-finance";
const dateString = (value: Date | string | null) => { if (!value) return ""; const d = accountingParts(value); return `${d.year}-${String(d.month+1).padStart(2,"0")}-${String(d.day).padStart(2,"0")}`; };
const input = "mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-base";
export function BusinessOrderDetails({ contact, orderId, companyName }: { contact: BusinessRecord; orderId: string; companyName: string | null }) {
  const router = useRouter();
  const [values, setValues] = useState({ billedAt: dateString(contact.billedAt), paymentDeadline: dateString(contact.paymentDeadline), lastContactedAt: dateString(contact.lastContactedAt), invoiceStatus: contact.invoiceStatus || "", isInvoiceCompliant: contact.isInvoiceCompliant, history: contact.history || "" });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  return <section className="rounded-xl border border-blue-200 bg-white p-5 sm:p-6 space-y-4">
    <div><span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">法人案件</span><h2 className="mt-3 text-xl font-bold text-slate-900">{companyName || contact.companyName}</h2><p className="mt-1 text-sm text-slate-500">{contact.inquiryType} · 担当：{contact.contactName}</p></div>
    <details open><summary className="cursor-pointer font-bold text-sm">元のお問い合わせ</summary><dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">{[["会社名", contact.companyName], ["担当者", contact.contactName], ["メール", contact.email], ["問い合わせ種別", contact.inquiryType], ["ご予算", contact.budget], ["希望納期", contact.deadline], ["旧見積金額", contact.estimatedPrice === null ? null : `${contact.estimatedPrice.toLocaleString()}円`], ["旧確定金額", contact.finalPrice === null ? null : `${contact.finalPrice.toLocaleString()}円`], ["旧入金状況（入金記録とは別）", contact.paymentStatus]].map(([label, value]) => <div key={label}><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-1 break-words text-slate-800">{value || "未記入"}</dd></div>)}<div className="sm:col-span-2"><dt className="text-xs text-slate-500">お問い合わせ内容</dt><dd className="mt-1 whitespace-pre-wrap break-words leading-relaxed">{contact.message}</dd></div></dl><p className="mt-3 text-xs text-slate-500">元の受付内容と旧金額は保管しています。現在のステータス・見積は下の依頼詳細、確定金額・入金は専用欄で管理します。</p></details>
    <details className="border-t pt-3"><summary className="cursor-pointer font-bold text-sm">法人の請求情報・対応履歴</summary><form className="mt-3 grid sm:grid-cols-2 gap-4" onSubmit={async e => { e.preventDefault(); if (busy) return; setBusy(true); setNotice(""); try { const response = await fetch(`/api/admin/orders/${orderId}/business`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...values, updatedAt: contact.updatedAt }) }); const result = await response.json(); if (!response.ok) throw Error(result.error); setNotice("保存しました。"); router.refresh(); } catch (error) { setNotice((error as Error).message); } finally { setBusy(false); } }}>
      {[["billedAt", "請求日"], ["paymentDeadline", "支払期限"], ["lastContactedAt", "最終対応日"]].map(([field, label]) => <label key={field} className="text-sm">{label}<input type="date" className={input} value={values[field as "billedAt" | "paymentDeadline" | "lastContactedAt"]} onChange={e => setValues({ ...values, [field]: e.target.value })} /></label>)}
      <label className="text-sm">請求書の状況<input className={input} maxLength={120} value={values.invoiceStatus} onChange={e => setValues({ ...values, invoiceStatus: e.target.value })} /></label>
      <label className="sm:col-span-2 flex gap-2 text-sm items-center"><input type="checkbox" checked={values.isInvoiceCompliant} onChange={e => setValues({ ...values, isInvoiceCompliant: e.target.checked })} />インボイス対応</label>
      <label className="sm:col-span-2 text-sm">対応履歴・メモ<textarea className={input} rows={6} maxLength={20000} value={values.history} onChange={e => setValues({ ...values, history: e.target.value })} /></label>
      <div><button disabled={busy} className="rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">法人情報を保存</button></div>{notice && <p role="status" className="text-sm">{notice}</p>}
    </form></details>
  </section>;
}
