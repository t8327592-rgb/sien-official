import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // 今月の依頼
  const thisMonthOrders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: startOfMonth,
      },
    },
  });

  // 作業中の案件
  const workingOrdersCount = await prisma.order.count({
    where: {
      status: "WORKING",
    },
  });

  // 今月の売上見込（価格が設定されているものの合計）
  const estimatedRevenue = thisMonthOrders.reduce((sum, order) => sum + (order.price || 0), 0);

  // 最新のご依頼5件
  const recentOrders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING": return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-bold">未対応</span>;
      case "ESTIMATING": return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-bold">見積中</span>;
      case "WORKING": return <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-bold">作業中</span>;
      case "COMPLETED": return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-bold">納品済</span>;
      default: return <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full font-bold">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">概要</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-medium text-slate-500 mb-2">今月の新規依頼</h3>
          <div className="text-3xl font-bold text-slate-900">{thisMonthOrders.length}<span className="text-lg text-slate-400 ml-1">件</span></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-medium text-slate-500 mb-2">作業中の案件</h3>
          <div className="text-3xl font-bold text-orange-600">{workingOrdersCount}<span className="text-lg text-orange-400 ml-1">件</span></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-medium text-slate-500 mb-2">今月の売上見込</h3>
          <div className="text-3xl font-bold text-slate-900">¥{estimatedRevenue.toLocaleString()}</div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mt-8">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-800">最新のご依頼</h3>
          <Link href="/admin/orders" className="text-sm text-orange-600 font-medium hover:underline">すべて見る</Link>
        </div>
        <div className="overflow-x-auto">
          {recentOrders.length === 0 ? (
            <div className="p-6 text-sm text-slate-500 text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/30 m-6">
              現在、ご依頼はありません。
            </div>
          ) : (
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 font-medium">依頼日</th>
                  <th className="px-6 py-3 font-medium">お名前</th>
                  <th className="px-6 py-3 font-medium">サービス</th>
                  <th className="px-6 py-3 font-medium">希望納期</th>
                  <th className="px-6 py-3 font-medium text-right">金額</th>
                  <th className="px-6 py-3 font-medium text-center">ステータス</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">{order.createdAt.toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {order.clientName}
                      {order.isRepeater && <span className="ml-2 text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">リピ</span>}
                    </td>
                    <td className="px-6 py-4">{order.serviceType === "MIX" ? "MIX" : "オリジナル"}</td>
                    <td className="px-6 py-4">{order.deadline || "指定なし"}</td>
                    <td className="px-6 py-4 text-right font-medium">
                      {order.price ? `¥${order.price.toLocaleString()}` : "未定"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(order.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
