import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // データベースへのクエリを並列実行して高速化
  const [thisMonthOrders, workingOrdersCount] = await Promise.all([
    prisma.order.findMany({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
      },
    }),
    prisma.order.count({
      where: {
        status: "WORKING",
      },
    })
  ]);

  // 今月の売上見込（価格が設定されているものの合計）
  const estimatedRevenue = thisMonthOrders.reduce((sum, order) => sum + (order.price || 0), 0);

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


    </div>
  );
}
