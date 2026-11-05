"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { accountingDateInput } from "@/lib/admin-finance";
import { EXPENSE_CATEGORIES } from "@/lib/admin-content-input";
import { parseAdminMoney } from "@/lib/admin-order-client";
import { adminRequest } from "@/lib/admin-request";

const input = "mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-base";
export function ExpenseCreateForm() {
  const router = useRouter();
  const [values, setValues] = useState({ title: "", amount: "", category: "ソフトウェア", date: accountingDateInput() });
  const [pending, setPending] = useState(false);
  const saving = useRef(false);
  const [notice, setNotice] = useState("");
  return <section className="max-w-2xl"><h2 className="mb-4 text-xl font-bold text-slate-800">新しい経費の追加</h2><form className="rounded-xl border bg-white p-6 shadow-sm space-y-4" onSubmit={async e => {
    e.preventDefault(); if (saving.current) return; saving.current = true; setPending(true); setNotice("");
    try {
      const amount = parseAdminMoney(values.amount);
      if (amount === null) throw Error("金額を入力してください。");
      await adminRequest("/api/admin/finance", "POST", { ...values, amount });
      setValues({ ...values, title: "", amount: "" }); setNotice("経費を登録しました。"); router.refresh();
    } catch (error) { setNotice((error as Error).message); }
    finally { saving.current = false; setPending(false); }
  }}>
    <div className="grid sm:grid-cols-2 gap-4">
      <label className="text-sm font-bold text-slate-700">発生日・購入日<input disabled={pending} type="date" required className={input} value={values.date} onChange={e => setValues({ ...values, date: e.target.value })} /></label>
      <label className="text-sm font-bold text-slate-700">カテゴリ<select disabled={pending} className={input} value={values.category} onChange={e => setValues({ ...values, category: e.target.value })}>{EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></label>
    </div>
    <label className="block text-sm font-bold text-slate-700">項目名（摘要）<input disabled={pending} required maxLength={300} className={input} value={values.title} onChange={e => setValues({ ...values, title: e.target.value })} placeholder="例：プラグイン購入" /></label>
    <label className="block text-sm font-bold text-slate-700">金額（税込・円）<input disabled={pending} required inputMode="numeric" className={input} value={values.amount} onChange={e => setValues({ ...values, amount: e.target.value })} placeholder="例：15000" /></label>
    <button disabled={pending} className="w-full rounded-lg bg-slate-800 py-3 font-bold text-white disabled:opacity-50">{pending ? "登録中…" : "経費を登録する"}</button>
    {notice && <p role="status" className="text-sm text-slate-700">{notice}</p>}
  </form></section>;
}
