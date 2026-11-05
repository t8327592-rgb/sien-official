"use client";

import { useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { accountingParts, accountingDateInput } from "@/lib/admin-finance";
import { accountingSummary, isRevenue, activePayments, signedCash, percentChange, type AccountingOrder } from "@/lib/order-accounting";
import Link from "next/link";
import { adminRequest } from "@/lib/admin-request";
import { parseAdminMoney } from "@/lib/admin-order-client";
import { csvRow } from "@/lib/admin-csv";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Download, Trash2, Edit2, Check, X, Target, Eye, EyeOff } from "lucide-react";

type Order = AccountingOrder & { clientName: string; companyName: string | null };

type Expense = {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: Date;
};


export function FinanceDashboardClient({
  initialOrders,
  initialExpenses,
  initialTargetSales,
}: {
  initialOrders: Order[];
  initialExpenses: Expense[];
  initialTargetSales: number;
}) {
  const router = useRouter();

  const [selectedYear, setSelectedYear] = useState<number>(accountingParts().year);
  const [isAmountsVisible, setIsAmountsVisible] = useState(false);
  const [targetSales, setTargetSales] = useState<number>(initialTargetSales);
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState(initialTargetSales.toString());

  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [expenseEditData, setExpenseEditData] = useState<Partial<Expense>>({});
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState("");
  const [pending, setPending] = useState(false);
  const saving = useRef(false);
  const [notice, setNotice] = useState("");
  const mutate = async (work: () => Promise<void>) => {
    if (saving.current) return;
    saving.current = true; setPending(true); setNotice("");
    try { await work(); router.refresh(); }
    catch (error) { setNotice(error instanceof Error ? error.message : "保存できませんでした。"); }
    finally { saving.current = false; setPending(false); }
  };
  const money = (value: string) => { const n = parseAdminMoney(value); if (n === null) throw Error("金額を入力してください。"); return n; };

  const availableYears = useMemo(() => {
    const years = new Set<number>([accountingParts().year]);
    initialOrders.forEach(o => {
      if (o.revenueAt) years.add(accountingParts(o.revenueAt).year);
      activePayments(o).forEach(p => years.add(accountingParts(p.paidAt).year));
    });
    initialExpenses.forEach(e => years.add(accountingParts(e.date).year));
    return [...years].sort((a, b) => b - a);
  }, [initialOrders, initialExpenses]);
  const summary = useMemo(() => accountingSummary(initialOrders, selectedYear), [initialOrders, selectedYear]);
  const previous = useMemo(() => accountingSummary(initialOrders, selectedYear - 1), [initialOrders, selectedYear]);
  const yearOrders = initialOrders.filter(o => isRevenue(o) && accountingParts(o.revenueAt!).year === selectedYear);
  const yearExpenses = initialExpenses.filter(e => accountingParts(e.date).year === selectedYear);
  const thisMonthSales = selectedYear === accountingParts().year ? summary.months[accountingParts().month].revenue : 0;
  const thisYearSales = summary.revenue;
  const thisYearExpenses = yearExpenses.reduce((s, e) => s + e.amount, 0);
  const thisYearProfit = thisYearSales - thisYearExpenses;
  const achievementRate = targetSales > 0 ? Math.round(thisMonthSales / targetSales * 100) : 0;
  const missing = initialOrders.filter(o => !o.isTest && !["CANCELED", "CANCELLED"].includes(o.status) && (o.confirmedPrice === null || !o.revenueAt));
  const monthlyData = summary.months.map((m, i) => ({ name: `${i + 1}月`, 売上: m.revenue, 前年売上: previous.months[i].revenue, 経費: yearExpenses.filter(e => accountingParts(e.date).month === i).reduce((s, e) => s + e.amount, 0) }));
  const showMoney = (n: number | null) => n === null ? "—" : isAmountsVisible ? `¥${Math.round(n).toLocaleString()}` : "¥ ***,***";
  const change = (n: number, prior: number) => { const v = percentChange(n, prior); return v === null ? "比較なし" : `${v > 0 ? "+" : ""}${v.toFixed(1)}%`; };

  // 経費カテゴリ内訳（円グラフ）
  const expenseCategoryData = (() => {
    const categories: Record<string, number> = {};
    yearExpenses.forEach(e => {
      if (!categories[e.category]) categories[e.category] = 0;
      categories[e.category] += e.amount;
    });
    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  })();

  const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#f43f5e', '#64748b'];

  // --- アクション ---

  const handleUpdateTarget = () => mutate(async () => {
    const value = money(targetInput);
    await adminRequest("/api/admin/settings/finance", "PATCH", { targetMonthlySales: value });
    setTargetSales(value); setIsEditingTarget(false); setNotice("目標額を保存しました。");
  });
  const handleDeleteExpense = async (id: string) => {
    if (pending || !window.confirm("この経費を削除しますか？")) return;
    await mutate(async () => { await adminRequest(`/api/admin/finance/${id}`, "DELETE"); setNotice("経費を削除しました。"); });
  };

  const startEditExpense = (expense: Expense) => {
    setEditingExpenseId(expense.id);
    setExpenseAmount(String(expense.amount)); setExpenseDate(accountingDateInput(expense.date));
    setExpenseEditData({
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      date: new Date(expense.date)
    });
  };

  const saveEditExpense = (id: string) => mutate(async () => {
    await adminRequest(`/api/admin/finance/${id}`, "PATCH", { ...expenseEditData, amount: money(expenseAmount), date: expenseDate });
    setEditingExpenseId(null); setNotice("経費を保存しました。");
  });

  // CSVダウンロード
  const downloadCSV = () => {
    // BOM
    const bom = new Uint8Array([0xef, 0xbb, 0xbf]);

    // Header
    let csvContent = csvRow(["日付", "区分", "カテゴリ", "項目・クライアント名", "金額"]);

    yearOrders.forEach(o => {
      csvContent += csvRow([accountingDateInput(o.revenueAt!), "確定売上", "案件報酬", `${o.companyName || o.clientName} / ${o.id}`, o.confirmedPrice]);
    });
    initialOrders.filter(o => !o.isTest).forEach(o => activePayments(o).forEach(p => {
      const d = accountingParts(p.paidAt);
      if (d.year !== selectedYear) return;
      csvContent += csvRow([accountingDateInput(p.paidAt), p.kind === "REFUND" ? "返金" : "入金", "資金移動", `Order ID: ${o.id}`, signedCash(p)]);
      if (p.fee) csvContent += csvRow([accountingDateInput(p.paidAt), "入金控除", "手数料", `Order ID: ${o.id}`, p.fee]);
      if (p.withholding) csvContent += csvRow([accountingDateInput(p.paidAt), "入金控除", "源泉徴収", `Order ID: ${o.id}`, p.withholding]);
    }));

    // 経費
    yearExpenses.forEach(e => {
      csvContent += csvRow([accountingDateInput(e.date), "経費", e.category, e.title, e.amount]);
    });

    const blob = new Blob([bom, csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SienOfficial_Finance_${selectedYear}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">売上・経費管理</h1>

          <button
            onClick={() => setIsAmountsVisible(!isAmountsVisible)}
            className="text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1 text-xs font-bold bg-white shadow-sm border border-slate-200 px-3 py-1.5 rounded-lg"
          >
            {isAmountsVisible ? <><EyeOff className="w-4 h-4"/> 隠す</> : <><Eye className="w-4 h-4"/> 金額を表示</>}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <select
            aria-label="集計する年"
            value={selectedYear}
            onChange={e => setSelectedYear(parseInt(e.target.value, 10))}
            className="border-slate-200 border rounded-lg py-2 pl-4 pr-10 font-bold text-slate-700 bg-white shadow-sm outline-none focus:ring-2 focus:ring-orange-500"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}年</option>
            ))}
          </select>
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-bold px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            CSV出力
          </button>
        </div>
      </div>

      <p className="text-sm text-slate-600 leading-relaxed">売上は確定金額を売上計上日で集計します。入金は実際の入金日で集計し、売上に加算しません。テストは除外、アーカイブは含みます。金額は税込です。</p>
      {missing.length > 0 && <details className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm"><summary className="cursor-pointer font-bold text-amber-900">集計前に確認する案件：{missing.length}件（金額未確定・計上日未入力）</summary><p className="mt-2 text-xs text-amber-900">過去の見積や入金状況から金額・日付を自動補完していません。確認済みの案件から入力してください。</p><ul className="mt-3 space-y-2">{missing.map(o => <li key={o.id}><Link className="underline text-amber-900" href={`/admin/orders/${o.id}`}>{o.companyName || o.clientName}：{o.confirmedPrice === null ? "金額未確定" : "計上日未入力"}</Link></li>)}</ul></details>}
      <div className="grid sm:grid-cols-3 gap-4">
        {[["売上計上した案件数", `${summary.count}件`], ["平均案件単価", showMoney(summary.average)], ["実入金（返金差引）", showMoney(summary.cash)]].map(([label, value]) => <div key={label} className="rounded-xl border bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-slate-900">{value}</p></div>)}
      </div>
      <p className="text-xs text-slate-500">平均案件単価＝対象期間の確定売上 ÷ 同じ期間の売上計上案件数。0円の確定案件も含み、未確定は分母から除外します。</p>
      {notice && <p role="status" className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">{notice}</p>}
      {/* サマリーダッシュボード */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        <div className="rounded-xl border bg-white p-6 shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Target className="w-20 h-20" />
          </div>
          <h3 className="text-sm font-bold text-slate-500 mb-1 z-10">今月の売上 (目標達成率)</h3>
          <div className="flex items-baseline gap-2 z-10 mb-3">
            <p className="text-3xl font-black text-slate-900">{isAmountsVisible ? `¥${thisMonthSales.toLocaleString()}` : '¥ ***,***'}</p>
            <p className="text-sm font-bold text-slate-500">/ {isAmountsVisible ? targetSales.toLocaleString() : '***,***'}</p>
          </div>
          {/* プログレスバー */}
          <div className="w-full bg-slate-100 rounded-full h-2.5 mb-2 z-10 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-1000 ${achievementRate >= 100 ? 'bg-orange-500' : 'bg-slate-400'}`}
              style={{ width: `${Math.min(achievementRate, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center z-10">
            <span className={`text-xs font-bold ${achievementRate >= 100 ? 'text-orange-600' : 'text-slate-500'}`}>
              {achievementRate}% 達成
            </span>
            {isEditingTarget ? (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={targetInput}
                  onChange={e => setTargetInput(e.target.value)}
                  className="w-20 text-xs border rounded px-1.5 py-1 outline-none"
                />
                <button disabled={pending} onClick={handleUpdateTarget} className="text-emerald-600 bg-emerald-50 p-1 rounded hover:bg-emerald-100"><Check className="w-3 h-3" /></button>
                <button onClick={() => setIsEditingTarget(false)} className="text-slate-400 bg-slate-50 p-1 rounded hover:bg-slate-100"><X className="w-3 h-3" /></button>
              </div>
            ) : (
              <button onClick={() => setIsEditingTarget(true)} className="text-[10px] text-slate-400 hover:text-slate-600 flex items-center gap-1 bg-slate-50 px-2 py-1 rounded">
                <Edit2 className="w-3 h-3" /> 目標設定
              </button>
            )}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm flex flex-col justify-center">
          <h3 className="text-sm font-bold text-slate-500 mb-2">{selectedYear}年の総売上</h3>
          <p className="text-3xl font-black text-slate-900">{isAmountsVisible ? `¥${thisYearSales.toLocaleString()}` : '¥ ***,***'}</p>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm flex flex-col justify-center">
          <h3 className="text-sm font-bold text-slate-500 mb-2">{selectedYear}年の総経費</h3>
          <p className="text-3xl font-black text-red-500">{isAmountsVisible ? `¥${thisYearExpenses.toLocaleString()}` : '¥ ***,***'}</p>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm flex flex-col justify-center">
          <h3 className="text-sm font-bold text-slate-500 mb-2">{selectedYear}年の差引（売上 − 登録経費）</h3>
          <p className={`text-3xl font-black ${thisYearProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {isAmountsVisible ? `¥${thisYearProfit.toLocaleString()}` : '¥ ***,***'}
          </p>
        </div>
      </div>

      <section className="rounded-xl border bg-white shadow-sm overflow-hidden" aria-labelledby="monthly-heading">
        <div className="p-5"><h2 id="monthly-heading" className="text-lg font-bold text-slate-800">月別比較</h2><p className="text-xs text-slate-500 mt-1">前年同月・前月との比較。比較元が0円の場合は「比較なし」と表示します。</p></div>
        <div className="overflow-x-auto"><table className="w-full whitespace-nowrap text-sm text-right"><thead className="bg-slate-50 text-slate-500"><tr>{["月", "確定売上", "案件数", "平均案件単価", "前月比", "前年同月売上", "前年同月比", "実入金", "経費", "差引"].map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{summary.months.map((m, i) => <tr key={i} className="hover:bg-slate-50"><th className="px-4 py-3">{i+1}月</th><td className="px-4 py-3 font-bold">{showMoney(m.revenue)}</td><td className="px-4 py-3">{m.count}件</td><td className="px-4 py-3">{showMoney(m.average)}</td><td className="px-4 py-3">{isAmountsVisible ? change(m.revenue, i ? summary.months[i-1].revenue : previous.months[11].revenue) : "***"}</td><td className="px-4 py-3">{showMoney(previous.months[i].revenue)}</td><td className="px-4 py-3">{isAmountsVisible ? change(m.revenue, previous.months[i].revenue) : "***"}</td><td className="px-4 py-3">{showMoney(m.cash)}</td><td className="px-4 py-3">{showMoney(monthlyData[i].経費)}</td><td className="px-4 py-3">{showMoney(m.revenue - monthlyData[i].経費)}</td></tr>)}</tbody></table></div>
      </section>
      <p className="text-xs text-slate-500">差引は管理用の目安です。入金時の手数料は経費へ自動転記していません。CSVの「入金・返金・入金控除」は売上行と別区分で、合算しないでください。</p>
      {/* グラフエリア */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">月別 売上・経費推移</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(value) => isAmountsVisible ? `¥${Number(value ?? 0).toLocaleString()}` : "***"} />
                <RechartsTooltip
                  formatter={(value) => [isAmountsVisible ? `¥${Number(value ?? 0).toLocaleString()}` : '¥ ***,***', undefined]}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '14px', fontWeight: 'bold' }} />
                <Bar dataKey="売上" fill="#f97316" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="前年売上" fill="#cbd5e1" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="経費" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-2">経費カテゴリ内訳</h3>
          {expenseCategoryData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm font-medium">データがありません</div>
          ) : (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {expenseCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value) => [isAmountsVisible ? `¥${Number(value ?? 0).toLocaleString()}` : '¥ ***,***', undefined]} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* 経費テーブル */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4">{selectedYear}年の経費詳細</h2>
        <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-5 py-3.5 font-bold text-slate-500">日付</th>
                  <th className="px-5 py-3.5 font-bold text-slate-500">カテゴリ</th>
                  <th className="px-5 py-3.5 font-bold text-slate-500">項目名</th>
                  <th className="px-5 py-3.5 font-bold text-slate-500 text-right">金額</th>
                  <th className="px-5 py-3.5 font-bold text-slate-500 text-center w-24">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {yearExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-slate-500 font-medium">経費データがありません</td>
                  </tr>
                ) : (
                  yearExpenses.map(exp => (
                    <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3">
                        {editingExpenseId === exp.id ? (
                          <input type="date" aria-label="経費の日付" value={expenseDate} onChange={e => setExpenseDate(e.target.value)} className="border rounded px-2 py-1 outline-none text-xs" />
                        ) : (
                          new Date(exp.date).toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" })
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {editingExpenseId === exp.id ? (
                          <select aria-label="経費のカテゴリ" disabled={pending} value={expenseEditData.category} onChange={e => setExpenseEditData({...expenseEditData, category: e.target.value})} className="border rounded px-2 py-1 outline-none text-xs bg-white">
                            <option value="ソフトウェア">ソフトウェア</option>
                            <option value="機材">機材</option>
                            <option value="通信費">通信費</option>
                            <option value="消耗品">消耗品</option>
                            <option value="外注費">外注費</option>
                            <option value="交通費">交通費</option>
                            <option value="その他">その他</option>
                          </select>
                        ) : (
                          <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded font-bold text-[11px]">{exp.category}</span>
                        )}
                      </td>
                      <td className="px-5 py-3 font-bold text-slate-800">
                        {editingExpenseId === exp.id ? (
                          <input aria-label="経費の項目名" disabled={pending} type="text" value={expenseEditData.title} onChange={e => setExpenseEditData({...expenseEditData, title: e.target.value})} className="border rounded px-2 py-1 outline-none text-xs w-full" />
                        ) : (
                          exp.title
                        )}
                      </td>
                      <td className="px-5 py-3 text-right font-black text-red-500">
                        {editingExpenseId === exp.id ? (
                          <input type="number" aria-label="経費の金額" value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} className="border rounded px-2 py-1 outline-none text-xs w-24 text-right" />
                        ) : (
                          isAmountsVisible ? `¥${exp.amount.toLocaleString()}` : '¥ ***,***'
                        )}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {editingExpenseId === exp.id ? (
                            <>
                              <button aria-label="経費の編集を保存" disabled={pending} onClick={() => saveEditExpense(exp.id)} className="text-emerald-600 hover:bg-emerald-50 p-1.5 rounded transition-colors"><Check className="w-4 h-4" /></button>
                              <button aria-label="経費の編集を取り消す" disabled={pending} onClick={() => setEditingExpenseId(null)} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded transition-colors"><X className="w-4 h-4" /></button>
                            </>
                          ) : (
                            <>
                              <button aria-label="経費を編集" disabled={pending} onClick={() => startEditExpense(exp)} className="text-slate-400 hover:text-blue-500 hover:bg-blue-50 p-1.5 rounded transition-colors"><Edit2 className="w-4 h-4" /></button>
                              <button aria-label="経費を削除" disabled={pending} onClick={() => handleDeleteExpense(exp.id)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
