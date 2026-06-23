import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight, Clock, CheckCircle2, AlertCircle, DollarSign } from "lucide-react";
import { isToday, isThisMonth } from "date-fns";

export default async function AdminDashboard() {
  const customers = await prisma.customer.findMany();

  const unresolvedCount = customers.filter(c => c.status === "未対応").length;
  const inProgressCount = customers.filter(c => c.status === "制作中").length;
  const waitFixCount = customers.filter(c => c.status === "修正対応").length;
  
  const todayDeliveryCount = customers.filter(c => c.deadline && isToday(new Date(c.deadline))).length;
  
  const thisMonthSales = customers
    .filter(c => c.paymentStatus === "支払い済み" && isThisMonth(new Date(c.updatedAt)))
    .reduce((sum, c) => sum + (c.price || 0), 0);

  return (
    <div>
      <h1 className="text-3xl font-black text-gray-800 mb-8">ダッシュボード</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* KPI Cards */}
        <div className="bg-red-50 p-6 rounded-3xl border border-red-100">
          <div className="flex items-center gap-3 text-red-600 font-bold mb-4">
            <AlertCircle size={20} /> 未対応・未返信
          </div>
          <div className="text-4xl font-black text-red-700">{unresolvedCount}<span className="text-lg ml-1 font-bold text-red-500">件</span></div>
        </div>
        
        <div className="bg-yellow-50 p-6 rounded-3xl border border-yellow-100">
          <div className="flex items-center gap-3 text-yellow-600 font-bold mb-4">
            <Clock size={20} /> 本日納品
          </div>
          <div className="text-4xl font-black text-yellow-700">{todayDeliveryCount}<span className="text-lg ml-1 font-bold text-yellow-500">件</span></div>
        </div>

        <div className="bg-purple-50 p-6 rounded-3xl border border-purple-100">
          <div className="flex items-center gap-3 text-purple-600 font-bold mb-4">
            <CheckCircle2 size={20} /> 制作中
          </div>
          <div className="text-4xl font-black text-purple-700">{inProgressCount}<span className="text-lg ml-1 font-bold text-purple-500">件</span></div>
        </div>

        <div className="bg-green-50 p-6 rounded-3xl border border-green-100">
          <div className="flex items-center gap-3 text-green-600 font-bold mb-4">
            <DollarSign size={20} /> 今月の売上
          </div>
          <div className="text-4xl font-black text-green-700">¥{thisMonthSales.toLocaleString()}</div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-gray-800 mb-2">依頼管理（Kanban）へ</h2>
          <p className="text-gray-500 font-medium">全ての案件の進行状況をドラッグ＆ドロップで管理します。</p>
        </div>
        <Link href="/admin/customers" className="flex items-center justify-center w-12 h-12 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-transform hover:scale-105">
          <ArrowRight size={20} />
        </Link>
      </div>
    </div>
  );
}
