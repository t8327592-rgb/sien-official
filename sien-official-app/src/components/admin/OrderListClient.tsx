"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// orderの型定義（簡易版）
type Order = any; 

const STATUS_LABELS: Record<string, string> = {
  PENDING: "未対応",
  ESTIMATING: "見積中",
  WAITING_PAYMENT: "入金待ち",
  WORKING: "作業中",
  COMPLETED: "納品済",
  CANCELED: "キャンセル",
};

type MainTab = "IN_PROGRESS" | "COMPLETED" | "CANCELED";
type SubFilter = "ALL" | "PENDING" | "ESTIMATING" | "WAITING_PAYMENT" | "WORKING";

export function OrderListClient({ initialOrders }: { initialOrders: Order[] }) {
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<MainTab>("IN_PROGRESS");
  const [subFilter, setSubFilter] = useState<SubFilter>("ALL");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [serviceFilter, setServiceFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // 各タブ用のフィルタリング関数
  const isInProgress = (status: string) => ["PENDING", "ESTIMATING", "WAITING_PAYMENT", "WORKING"].includes(status);
  
  // ベースとなるフィルタリング (サービス・検索)
  const baseFilteredOrders = initialOrders
    .filter((order) => serviceFilter === "ALL" || order.serviceType === serviceFilter)
    .filter((order) => {
      if (!searchQuery) return true;
      const lowerQuery = searchQuery.toLowerCase();
      return (
        (order.clientName && order.clientName.toLowerCase().includes(lowerQuery)) ||
        (order.songTitle && order.songTitle.toLowerCase().includes(lowerQuery)) ||
        (order.clientEmail && order.clientEmail.toLowerCase().includes(lowerQuery))
      );
    });

  // タブ別件数計算
  const inProgressCount = baseFilteredOrders.filter((o) => isInProgress(o.status)).length;
  const completedCount = baseFilteredOrders.filter((o) => o.status === "COMPLETED").length;
  const canceledCount = baseFilteredOrders.filter((o) => o.status === "CANCELED").length;

  // 進行中内部の件数計算
  const inProgressOrders = baseFilteredOrders.filter((o) => isInProgress(o.status));
  const subCounts = {
    ALL: inProgressOrders.length,
    PENDING: inProgressOrders.filter((o) => o.status === "PENDING").length,
    ESTIMATING: inProgressOrders.filter((o) => o.status === "ESTIMATING").length,
    WAITING_PAYMENT: inProgressOrders.filter((o) => o.status === "WAITING_PAYMENT").length,
    WORKING: inProgressOrders.filter((o) => o.status === "WORKING").length,
  };

  // 最終的に表示するリスト
  const displayOrders = baseFilteredOrders
    .filter((order) => {
      if (activeTab === "IN_PROGRESS") {
        if (!isInProgress(order.status)) return false;
        if (subFilter !== "ALL" && order.status !== subFilter) return false;
        return true;
      }
      if (activeTab === "COMPLETED") return order.status === "COMPLETED";
      if (activeTab === "CANCELED") return order.status === "CANCELED";
      return false;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="space-y-6">
      {/* 検索・サービスフィルタ・ソート */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => setServiceFilter("ALL")}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${serviceFilter === 'ALL' ? 'bg-slate-800 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}
          >
            すべて
          </button>
          <button 
            onClick={() => setServiceFilter("mix")}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${serviceFilter === 'mix' ? 'bg-orange-500 text-white shadow-sm' : 'bg-white border border-orange-200 text-orange-700 hover:bg-orange-50'}`}
          >
            MIX・マスタリング
          </button>
          <button 
            onClick={() => setServiceFilter("original")}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${serviceFilter === 'original' ? 'bg-blue-500 text-white shadow-sm' : 'bg-white border border-blue-200 text-blue-700 hover:bg-blue-50'}`}
          >
            オリジナル楽曲制作
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <input 
              type="text" 
              placeholder="名前, 曲名, メールで検索..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border-slate-200 rounded-lg text-sm bg-white p-2 pl-3 outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
            />
          </div>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "desc" | "asc")}
            className="border-slate-200 rounded-lg text-sm bg-white p-2 outline-none focus:ring-2 focus:ring-orange-500 shadow-sm flex-1 md:flex-none"
          >
            <option value="desc">新しい順</option>
            <option value="asc">古い順</option>
          </select>
        </div>
      </div>

      {/* メインタブ */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("IN_PROGRESS")}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-bold text-sm transition-colors duration-200 ${
              activeTab === "IN_PROGRESS"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            進行中（{inProgressCount}）
          </button>
          <button
            onClick={() => setActiveTab("COMPLETED")}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-bold text-sm transition-colors duration-200 ${
              activeTab === "COMPLETED"
                ? "border-green-500 text-green-600"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            納品済（{completedCount}）
          </button>
          <button
            onClick={() => setActiveTab("CANCELED")}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-bold text-sm transition-colors duration-200 ${
              activeTab === "CANCELED"
                ? "border-slate-800 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            キャンセル（{canceledCount}）
          </button>
        </nav>
      </div>

      {/* 進行中タブの場合のサブフィルター */}
      {activeTab === "IN_PROGRESS" && (
        <div className="flex flex-wrap items-center gap-2 p-1 animate-in fade-in duration-300">
          <button
            onClick={() => setSubFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm border ${
              subFilter === "ALL" ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            すべて（{subCounts.ALL}）
          </button>
          <button
            onClick={() => setSubFilter("PENDING")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm border ${
              subFilter === "PENDING" ? "bg-orange-100 text-orange-700 border-orange-200" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            未対応（{subCounts.PENDING}）
          </button>
          <button
            onClick={() => setSubFilter("ESTIMATING")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm border ${
              subFilter === "ESTIMATING" ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            見積中（{subCounts.ESTIMATING}）
          </button>
          <button
            onClick={() => setSubFilter("WAITING_PAYMENT")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm border ${
              subFilter === "WAITING_PAYMENT" ? "bg-sky-100 text-sky-700 border-sky-200" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            入金待ち（{subCounts.WAITING_PAYMENT}）
          </button>
          <button
            onClick={() => setSubFilter("WORKING")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm border ${
              subFilter === "WORKING" ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            作業中（{subCounts.WORKING}）
          </button>
        </div>
      )}

      {/* リスト表示 */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in duration-300">
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
              {displayOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500">
                    該当する依頼データはありません。
                  </td>
                </tr>
              ) : (
                displayOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    onClick={() => router.push(`/admin/orders/${order.id}`)}
                    className="hover:bg-orange-50/50 transition-colors cursor-pointer group"
                  >
                    <td className="p-4 pl-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap inline-block ${
                        order.status === 'PENDING' ? 'bg-orange-100 text-orange-700' :
                        order.status === 'ESTIMATING' ? 'bg-amber-100 text-amber-700' :
                        order.status === 'WAITING_PAYMENT' ? 'bg-sky-100 text-sky-700' :
                        order.status === 'WORKING' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                        order.status === 'CANCELED' ? 'bg-slate-200 text-slate-600' :
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
