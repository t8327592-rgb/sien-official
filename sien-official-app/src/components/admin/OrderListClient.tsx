"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowUpDown } from "lucide-react";

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
type SubFilter = "PENDING" | "ESTIMATING" | "WAITING_PAYMENT" | "WORKING" | null;

export function OrderListClient({ initialOrders }: { initialOrders: Order[] }) {
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<MainTab>("IN_PROGRESS");
  // デフォルトは絞り込みなし(null)
  const [subFilter, setSubFilter] = useState<SubFilter>(null);
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
    PENDING: inProgressOrders.filter((o) => o.status === "PENDING").length,
    ESTIMATING: inProgressOrders.filter((o) => o.status === "ESTIMATING").length,
    WAITING_PAYMENT: inProgressOrders.filter((o) => o.status === "WAITING_PAYMENT").length,
    WORKING: inProgressOrders.filter((o) => o.status === "WORKING").length,
  };

  // サブフィルターのトグル処理
  const handleSubFilterToggle = (filter: SubFilter) => {
    setSubFilter(prev => prev === filter ? null : filter);
  };

  // 最終的に表示するリスト
  const displayOrders = baseFilteredOrders
    .filter((order) => {
      if (activeTab === "IN_PROGRESS") {
        if (!isInProgress(order.status)) return false;
        if (subFilter && order.status !== subFilter) return false;
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
    <div className="space-y-4">
      {/* 上部フィルター (サービス種別 ＋ 検索 ＋ ソート) */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-3 rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
          <button 
            onClick={() => setServiceFilter("ALL")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${serviceFilter === 'ALL' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            すべて
          </button>
          <button 
            onClick={() => setServiceFilter("mix")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${serviceFilter === 'mix' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            MIX・マスタリング
          </button>
          <button 
            onClick={() => setServiceFilter("original")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${serviceFilter === 'original' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            オリジナル楽曲制作
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <div className="relative w-full lg:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="名前, 曲名, メールで検索..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border-slate-200 rounded-lg text-sm bg-slate-50 p-2 pl-9 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/50 transition-colors"
            />
          </div>
          <div className="relative flex-1 lg:flex-none group">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "desc" | "asc")}
              className="w-full appearance-none border-slate-200 rounded-lg text-sm bg-slate-50 p-2 pl-3 pr-8 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/50 transition-colors"
            >
              <option value="desc">新しい順</option>
              <option value="asc">古い順</option>
            </select>
            <ArrowUpDown className="absolute right-2.5 top-2.5 h-4 w-4 text-slate-400 pointer-events-none group-focus-within:text-orange-500" />
          </div>
        </div>
      </div>

      {/* メインタブ & サブフィルター */}
      <div className="flex flex-col gap-3">
        <nav className="flex space-x-6 border-b border-slate-200 px-1" aria-label="Tabs">
          <button
            onClick={() => { setActiveTab("IN_PROGRESS"); setSubFilter(null); }}
            className={`whitespace-nowrap pb-3 px-1 border-b-2 font-bold text-sm transition-colors duration-200 ${
              activeTab === "IN_PROGRESS"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            進行中（{inProgressCount}）
          </button>
          <button
            onClick={() => setActiveTab("COMPLETED")}
            className={`whitespace-nowrap pb-3 px-1 border-b-2 font-bold text-sm transition-colors duration-200 ${
              activeTab === "COMPLETED"
                ? "border-green-500 text-green-600"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            納品済（{completedCount}）
          </button>
          <button
            onClick={() => setActiveTab("CANCELED")}
            className={`whitespace-nowrap pb-3 px-1 border-b-2 font-bold text-sm transition-colors duration-200 ${
              activeTab === "CANCELED"
                ? "border-slate-800 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            キャンセル（{canceledCount}）
          </button>
        </nav>

        {/* 進行中タブの場合の内部フィルター */}
        {activeTab === "IN_PROGRESS" && (
          <div className="flex flex-wrap items-center gap-1.5 animate-in fade-in duration-300">
            <button
              onClick={() => handleSubFilterToggle("PENDING")}
              className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all border ${
                subFilter === "PENDING" ? "bg-orange-100 text-orange-700 border-orange-200 shadow-sm" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
              }`}
            >
              未対応（{subCounts.PENDING}）
            </button>
            <button
              onClick={() => handleSubFilterToggle("ESTIMATING")}
              className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all border ${
                subFilter === "ESTIMATING" ? "bg-amber-100 text-amber-700 border-amber-200 shadow-sm" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
              }`}
            >
              見積中（{subCounts.ESTIMATING}）
            </button>
            <button
              onClick={() => handleSubFilterToggle("WAITING_PAYMENT")}
              className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all border ${
                subFilter === "WAITING_PAYMENT" ? "bg-sky-100 text-sky-700 border-sky-200 shadow-sm" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
              }`}
            >
              入金待ち（{subCounts.WAITING_PAYMENT}）
            </button>
            <button
              onClick={() => handleSubFilterToggle("WORKING")}
              className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all border ${
                subFilter === "WORKING" ? "bg-blue-100 text-blue-700 border-blue-200 shadow-sm" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
              }`}
            >
              作業中（{subCounts.WORKING}）
            </button>
          </div>
        )}
      </div>

      {/* リスト表示 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500">
                <th className="py-3 px-4 pl-5">ステータス</th>
                <th className="py-3 px-4">ご依頼日</th>
                <th className="py-3 px-4">曲名</th>
                <th className="py-3 px-4">クライアント名</th>
                <th className="py-3 px-4">サービス内容</th>
                <th className="py-3 px-4 pr-5 text-right">金額</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-sm text-slate-500">
                    該当する依頼データはありません。
                  </td>
                </tr>
              ) : (
                displayOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    onClick={() => router.push(`/admin/orders/${order.id}`)}
                    className="hover:bg-orange-50/50 transition-colors cursor-pointer group text-sm"
                  >
                    <td className="py-3 px-4 pl-5">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold inline-block border ${
                        order.status === 'PENDING' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                        order.status === 'ESTIMATING' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                        order.status === 'WAITING_PAYMENT' ? 'bg-sky-50 text-sky-600 border-sky-200' :
                        order.status === 'WORKING' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                        order.status === 'COMPLETED' ? 'bg-green-50 text-green-600 border-green-200' :
                        order.status === 'CANCELED' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                        'bg-slate-50 text-slate-500 border-slate-200'
                      }`}>
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-xs">
                      {new Date(order.createdAt).toLocaleDateString("ja-JP")}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800 max-w-[200px] truncate" title={order.songTitle}>
                      {order.songTitle || <span className="text-slate-400">未設定</span>}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{order.clientName}</span>
                        {order.isRepeater && (
                          <span className="text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-200 px-1.5 py-0.5 rounded font-bold">リピーター</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{order.clientEmail}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-xs">
                      {order.serviceType === "mix" ? "MIX・マスタリング" : "オリジナル楽曲制作"}
                    </td>
                    <td className="py-3 px-4 pr-5 font-bold text-slate-900 text-right">
                      {order.price ? `¥${order.price.toLocaleString()}` : <span className="text-slate-400 font-normal text-xs">未見積もり</span>}
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
