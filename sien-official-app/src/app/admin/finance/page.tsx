import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { FinanceDashboardClient } from "@/components/admin/finance/FinanceDashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminFinancePage() {
  // 売上データの取得 (納品済みのオーダーのみ、必要なフィールドのみ)
  const completedOrders = await prisma.order.findMany({
    where: { status: "COMPLETED", isArchived: false },
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
      deliveredAt: true,
      price: true,
      basePrice: true,
      optionPrice: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // 経費データの取得
  const expenses = await prisma.expense.findMany({
    orderBy: { date: "desc" },
  });

  // 目標設定の取得
  const siteSetting = await prisma.siteSetting.findUnique({
    where: { id: "default" },
  });

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
      <FinanceDashboardClient 
        initialOrders={completedOrders}
        initialExpenses={expenses}
        initialTargetSales={siteSetting?.targetMonthlySales || 0}
      />

      {/* 経費追加フォーム（下部に配置） */}
      <div className="max-w-2xl">
        <h2 className="text-xl font-bold text-slate-800 mb-4">新しい経費の追加</h2>
        <form action={addExpense} className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">発生日・購入日</label>
              <input type="date" name="date" required className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500" defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">カテゴリ</label>
              <select name="category" className="w-full p-2.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-orange-500">
                <option value="ソフトウェア">ソフトウェア (プラグイン/DAW)</option>
                <option value="機材">機材・PC周辺機器</option>
                <option value="通信費">通信費 (サーバー/ドメイン等)</option>
                <option value="消耗品">消耗品</option>
                <option value="外注費">外注費</option>
                <option value="交通費">交通費</option>
                <option value="その他">その他</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">項目名 (摘要)</label>
            <input type="text" name="title" required placeholder="例: WAVES プラグイン購入" className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">金額 (税込・円)</label>
            <input type="number" name="amount" required placeholder="例: 15000" className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <button type="submit" className="w-full bg-slate-800 border border-slate-700 text-white py-3 rounded-lg font-bold hover:bg-slate-700 transition-colors mt-2 shadow-sm">
            経費を登録する
          </button>
        </form>
      </div>
    </div>
  );
}
