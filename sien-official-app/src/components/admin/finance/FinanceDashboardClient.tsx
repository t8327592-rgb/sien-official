"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { accountingParts, revenueDate } from "@/lib/admin-finance";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Download, Trash2, Edit2, Check, X, Target, Eye, EyeOff } from "lucide-react";

type Order = {
  id: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  deliveredAt: Date | null;
  price: number | null;
  basePrice: number | null;
  optionPrice: number | null;
};

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
  const [mode, setMode] = useState<"created" | "delivered">("created");
  const [targetSales, setTargetSales] = useState<number>(initialTargetSales);
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState(initialTargetSales.toString());

  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [expenseEditData, setExpenseEditData] = useState<Partial<Expense>>({});

  // 利用可能な年度のリスト（過去のデータから抽出）
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    years.add(accountingParts().year);
    initialOrders.forEach(o => {
      const targetDate = revenueDate(o, mode);
      if (targetDate) years.add(accountingParts(targetDate).year);
    });
    initialExpenses.forEach(e => years.add(accountingParts(e.date).year));
    return Array.from(years).sort((a, b) => b - a);
  }, [initialOrders, initialExpenses, mode]);

  // 指定された年度のデータに絞り込み
  const yearOrders = useMemo(() =>
    initialOrders.filter(o => {
      const targetDate = revenueDate(o, mode);
      if (!targetDate) return false;
      return accountingParts(targetDate).year === selectedYear;
    }),
  [initialOrders, selectedYear, mode]);

  const yearExpenses = useMemo(() =>
    initialExpenses.filter(e => accountingParts(e.date).year === selectedYear),
  [initialExpenses, selectedYear]);

  // 今月のデータ計算
  const currentMonth = accountingParts().month;
  const currentYear = accountingParts().year;
  const isCurrentYear = selectedYear === currentYear;

  const thisMonthSales = isCurrentYear
    ? yearOrders.filter(o => {
        const targetDate = revenueDate(o, mode);
        return targetDate && accountingParts(targetDate).month === currentMonth;
      }).reduce((sum, o) => sum + (o.price || 0), 0)
    : 0;

  // 年間サマリー
  const thisYearSales = yearOrders.reduce((sum, o) => sum + (o.price || 0), 0);
  const thisYearExpenses = yearExpenses.reduce((sum, e) => sum + e.amount, 0);
  const thisYearProfit = thisYearSales - thisYearExpenses;

  // 目標達成率
  const achievementRate = targetSales > 0 ? Math.round((thisMonthSales / targetSales) * 100) : 0;

  // --- グラフ用データ ---

  // 月別売上＆経費推移（棒グラフ）
  const monthlyData = useMemo(() => {
    const data = Array.from({ length: 12 }, (_, i) => ({
      name: `${i + 1}月`,
      売上: 0,
      経費: 0,
      利益: 0,
    }));

    yearOrders.forEach(o => {
      const targetDate = revenueDate(o, mode);
      if (targetDate) {
        const month = accountingParts(targetDate).month;
        data[month].売上 += (o.price || 0);
      }
    });

    yearExpenses.forEach(e => {
      const month = accountingParts(e.date).month;
      data[month].経費 += e.amount;
    });

    data.forEach(d => {
      d.利益 = d.売上 - d.経費;
    });

    return data;
  }, [yearOrders, yearExpenses, mode]);

  // 経費カテゴリ内訳（円グラフ）
  const expenseCategoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    yearExpenses.forEach(e => {
      if (!categories[e.category]) categories[e.category] = 0;
      categories[e.category] += e.amount;
    });
    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [yearExpenses]);

  const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#f43f5e', '#64748b'];

  // --- アクション ---

  const handleUpdateTarget = async () => {
    try {
      const value = parseInt(targetInput, 10);
      if (isNaN(value)) return;

      const res = await fetch("/api/admin/settings/finance", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetMonthlySales: value }),
      });
      if (res.ok) {
        setTargetSales(value);
        setIsEditingTarget(false);
        router.refresh();
      }
    } catch {
      alert("目標額の更新に失敗しました");
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!window.confirm("この経費を削除しますか？")) return;
    try {
      const res = await fetch(`/api/admin/finance/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      }
    } catch {
      alert("削除に失敗しました");
    }
  };

  const startEditExpense = (expense: Expense) => {
    setEditingExpenseId(expense.id);
    setExpenseEditData({
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      date: new Date(expense.date)
    });
  };

  const saveEditExpense = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/finance/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expenseEditData),
      });
      if (res.ok) {
        setEditingExpenseId(null);
        router.refresh();
      }
    } catch {
      alert("更新に失敗しました");
    }
  };

  // CSVダウンロード
  const downloadCSV = () => {
    // BOM
    const bom = new Uint8Array([0xef, 0xbb, 0xbf]);

    // Header
    let csvContent = "日付,区分,カテゴリ,項目・クライアント名,金額\n";

    // 売上
    yearOrders.forEach(o => {
      const targetDate = revenueDate(o, mode);
      if (targetDate) {
        const d = accountingParts(targetDate);
        const dateStr = `${d.year}/${String(d.month+1).padStart(2,'0')}/${String(d.day).padStart(2,'0')}`;
        csvContent += `${dateStr},売上,案件報酬,"Order ID: ${o.id}",${o.price || 0}\n`;
      }
    });

    // 経費
    yearExpenses.forEach(e => {
      const d = accountingParts(e.date);
      const dateStr = `${d.year}/${String(d.month+1).padStart(2,'0')}/${String(d.day).padStart(2,'0')}`;
      // カンマをエスケープ
      const safeTitle = `"${e.title.replace(/"/g, '""')}"`;
      csvContent += `${dateStr},経費,${e.category},${safeTitle},${e.amount}\n`;
    });

    const blob = new Blob([bom, csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SienOfficial_Finance_${selectedYear}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-slate-800">金額・確定申告管理</h1>

          <div className="hidden sm:flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setMode("created")}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${mode === "created" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              受注ベース
            </button>
            <button
              onClick={() => setMode("delivered")}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${mode === "delivered" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              納品ベース
            </button>
          </div>

          <button
            onClick={() => setIsAmountsVisible(!isAmountsVisible)}
            className="text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1 text-xs font-bold bg-white shadow-sm border border-slate-200 px-3 py-1.5 rounded-lg"
          >
            {isAmountsVisible ? <><EyeOff className="w-4 h-4"/> 隠す</> : <><Eye className="w-4 h-4"/> 金額を表示</>}
          </button>
        </div>
        <div className="flex sm:hidden bg-slate-100 p-0.5 rounded-lg border border-slate-200 w-full mb-2">
          <button
            onClick={() => setMode("created")}
            className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors ${mode === "created" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            受注ベース
          </button>
          <button
            onClick={() => setMode("delivered")}
            className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors ${mode === "delivered" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            納品ベース
          </button>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(parseInt(e.target.value, 10))}
            className="border-slate-200 border rounded-lg py-2 pl-4 pr-10 font-bold text-slate-700 bg-white shadow-sm outline-none focus:ring-2 focus:ring-orange-500"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}年度</option>
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

      {/* サマリーダッシュボード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
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
                <button onClick={handleUpdateTarget} className="text-emerald-600 bg-emerald-50 p-1 rounded hover:bg-emerald-100"><Check className="w-3 h-3" /></button>
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
          <h3 className="text-sm font-bold text-slate-500 mb-2">{selectedYear}年の最終利益</h3>
          <p className={`text-3xl font-black ${thisYearProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {isAmountsVisible ? `¥${thisYearProfit.toLocaleString()}` : '¥ ***,***'}
          </p>
        </div>
      </div>

      {/* グラフエリア */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">月別 売上・経費推移</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(value) => `¥${Number(value ?? 0).toLocaleString()}`} />
                <RechartsTooltip
                  formatter={(value) => [isAmountsVisible ? `¥${Number(value ?? 0).toLocaleString()}` : '¥ ***,***', undefined]}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '14px', fontWeight: 'bold' }} />
                <Bar dataKey="売上" fill="#f97316" radius={[4, 4, 0, 0]} maxBarSize={40} />
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
                          <input type="date" value={new Date(expenseEditData.date || new Date()).toISOString().split('T')[0]} onChange={e => setExpenseEditData({...expenseEditData, date: new Date(e.target.value)})} className="border rounded px-2 py-1 outline-none text-xs" />
                        ) : (
                          new Date(exp.date).toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" })
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {editingExpenseId === exp.id ? (
                          <select value={expenseEditData.category} onChange={e => setExpenseEditData({...expenseEditData, category: e.target.value})} className="border rounded px-2 py-1 outline-none text-xs bg-white">
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
                          <input type="text" value={expenseEditData.title} onChange={e => setExpenseEditData({...expenseEditData, title: e.target.value})} className="border rounded px-2 py-1 outline-none text-xs w-full" />
                        ) : (
                          exp.title
                        )}
                      </td>
                      <td className="px-5 py-3 text-right font-black text-red-500">
                        {editingExpenseId === exp.id ? (
                          <input type="number" value={expenseEditData.amount} onChange={e => setExpenseEditData({...expenseEditData, amount: parseInt(e.target.value, 10)})} className="border rounded px-2 py-1 outline-none text-xs w-24 text-right" />
                        ) : (
                          isAmountsVisible ? `¥${exp.amount.toLocaleString()}` : '¥ ***,***'
                        )}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {editingExpenseId === exp.id ? (
                            <>
                              <button onClick={() => saveEditExpense(exp.id)} className="text-emerald-600 hover:bg-emerald-50 p-1.5 rounded transition-colors"><Check className="w-4 h-4" /></button>
                              <button onClick={() => setEditingExpenseId(null)} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded transition-colors"><X className="w-4 h-4" /></button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => startEditExpense(exp)} className="text-slate-400 hover:text-blue-500 hover:bg-blue-50 p-1.5 rounded transition-colors"><Edit2 className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteExpense(exp.id)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
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
