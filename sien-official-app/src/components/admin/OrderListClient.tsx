"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// orderの型定義（簡易版）
type Order = any; 

const STATUS_LABELS: Record<string, string> = {
  PENDING: "未対応",
  WORKING: "見積中・作業中",
  COMPLETED: "納品済",
  CANCELED: "キャンセル",
};

export function OrderListClient({ initialOrders }: { initialOrders: Order[] }) {
  const router = useRouter();
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // フィルタリングとソート
  const filteredOrders = initialOrders
    .filter((order) => filterStatus === "ALL" || order.status === filterStatus)
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border-slate-200 rounded-lg text-sm bg-white p-2 outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="ALL">すべてのステータス</option>
            <option value="PENDING">未対応</option>
            <option value="WORKING">見積中・作業中</option>
            <option value="COMPLETED">納品済</option>
            <option value="CANCELED">キャンセル</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "desc" | "asc")}
            className="border-slate-200 rounded-lg text-sm bg-white p-2 outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="desc">新しい順</option>
            <option value="asc">古い順</option>
          </select>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-100 font-medium text-slate-600">
          全 {filteredOrders.length} 件
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-sm font-semibold text-slate-500">
                <th className="p-4 pl-6 whitespace-nowrap">ステータス</th>
                <th className="p-4 whitespace-nowrap">ご依頼日</th>
                <th className="p-4 whitespace-nowrap">クライアント名</th>
                <th className="p-4 whitespace-nowrap">サービス内容</th>
                <th className="p-4 pr-6 whitespace-nowrap">金額</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500">
                    該当する依頼データはありません。
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    onClick={() => router.push(`/admin/orders/${order.id}`)}
                    className="hover:bg-orange-50/50 transition-colors cursor-pointer group"
                  >
                    <td className="p-4 pl-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        order.status === 'PENDING' ? 'bg-orange-100 text-orange-700' :
                        order.status === 'WORKING' ? 'bg-amber-100 text-amber-700' :
                        order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString("ja-JP")}
                    </td>
                    <td className="p-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        {order.clientName}
                        {order.isRepeater && (
                          <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-bold">リピーター</span>
                        )}
                      </div>
                      <div className="text-xs font-normal text-slate-500 mt-0.5">{order.clientEmail}</div>
                    </td>
                    <td className="p-4 text-slate-700">
                      {order.serviceType === "mix" ? "MIX・マスタリング" : "オリジナル楽曲制作"}
                    </td>
                    <td className="p-4 pr-6 font-medium text-slate-900">
                      {order.price ? `¥${order.price.toLocaleString()}` : <span className="text-slate-400">未見積もり</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
