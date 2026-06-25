import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminFinancePage() {
  // 売上データの取得 (納品済みのオーダーの金額)
  const completedOrders = await prisma.order.findMany({
    where: { status: "COMPLETED", price: { not: null } },
  });
  const totalSales = completedOrders.reduce((sum, order) => sum + (order.price || 0), 0);

  // 売上・集計データの計算
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let thisMonthSales = 0;
  let thisYearSales = 0;

  completedOrders.forEach(order => {
    const date = new Date(order.createdAt); // 本当は納品日(updatedAt等)がベターですが、createdAtで代用
    const price = order.price || 0;
    
    if (date.getFullYear() === currentYear) {
      thisYearSales += price;
      if (date.getMonth() === currentMonth) {
        thisMonthSales += price;
      }
    }
  });

  const orderCount = completedOrders.length;
  const averagePrice = orderCount > 0 ? Math.round(totalSales / orderCount) : 0;

  // 経費データの取得
  const expenses = await prisma.expense.findMany({
    orderBy: { date: "desc" },
  });
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  // 利益
  const profit = totalSales - totalExpenses;

  // 経費追加アクション
  async function addExpense(formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
    const amountStr = formData.get("amount") as string;
    const category = formData.get("category") as string;
    const dateStr = formData.get("date") as string;
    
    if (!title || !amountStr || !dateStr) return;

    await prisma.expense.create({
      data: {
        title,
        amount: parseInt(amountStr, 10),
        category,
        date: new Date(dateStr),
      },
    });

    redirect("/admin/finance");
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">金額・確定申告管理</h1>
      </div>

      {/* サマリー・ダッシュボード */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 mb-2">今月の売上</h3>
          <p className="text-3xl font-bold text-slate-900">¥{thisMonthSales.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 mb-2">今年の売上</h3>
          <p className="text-3xl font-bold text-slate-900">¥{thisYearSales.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 mb-2">総案件数</h3>
          <p className="text-3xl font-bold text-slate-900">{orderCount} 件</p>
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 mb-2">平均単価</h3>
          <p className="text-3xl font-bold text-slate-900">¥{averagePrice.toLocaleString()}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 mb-2">累計売上</h3>
          <p className="text-2xl font-bold text-slate-900">¥{totalSales.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 mb-2">累計経費</h3>
          <p className="text-2xl font-bold text-red-600">¥{totalExpenses.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 mb-2">累計利益</h3>
          <p className={`text-2xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ¥{profit.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 経費一覧 */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold">経費一覧</h2>
          <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-600">日付</th>
                  <th className="px-4 py-3 font-medium text-slate-600">カテゴリ</th>
                  <th className="px-4 py-3 font-medium text-slate-600">項目</th>
                  <th className="px-4 py-3 font-medium text-slate-600 text-right">金額</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">経費データがありません</td>
                  </tr>
                ) : (
                  expenses.map(exp => (
                    <tr key={exp.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">{new Date(exp.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3"><span className="bg-slate-100 px-2 py-1 rounded text-xs text-slate-600">{exp.category}</span></td>
                      <td className="px-4 py-3 font-medium">{exp.title}</td>
                      <td className="px-4 py-3 text-right text-red-600">¥{exp.amount.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 経費追加フォーム */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">経費の追加</h2>
          <form action={addExpense} className="rounded-lg border bg-white p-6 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">日付</label>
              <input type="date" name="date" required className="w-full p-2 border rounded-md" defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">カテゴリ</label>
              <select name="category" className="w-full p-2 border rounded-md bg-white">
                <option value="ソフトウェア">ソフトウェア (プラグイン/DAW)</option>
                <option value="機材">機材・PC周辺機器</option>
                <option value="通信費">通信費 (サーバー/ドメイン)</option>
                <option value="消耗品">消耗品</option>
                <option value="その他">その他</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">項目名</label>
              <input type="text" name="title" required placeholder="例: WAVES プラグイン購入" className="w-full p-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">金額 (円)</label>
              <input type="number" name="amount" required placeholder="例: 15000" className="w-full p-2 border rounded-md" />
            </div>
            <button type="submit" className="w-full bg-slate-800 border border-slate-700 text-white py-2 rounded-md font-medium hover:bg-slate-700 transition-colors mt-2">
              登録する
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
