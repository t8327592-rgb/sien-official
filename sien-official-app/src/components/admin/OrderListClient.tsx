"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowUpDown, ChevronDown } from "lucide-react";

// orderの型定義（簡易版）
type Order = any; 

const STATUS_LABELS: Record<string, string> = {
  PENDING: "未対応",
  ESTIMATING: "見積中",
  WAITING_PAYMENT: "入金待ち",
  WORKING: "作業中",
  COMPLETED: "納品済",
  CANCELED: "キャンセル",
  CANCELLED: "キャンセル", // DB内の古いデータ用
};

const STATUS_OPTIONS = [
  { value: "PENDING", label: "未対応", colorClass: "bg-orange-50 text-orange-600 border-orange-200" },
  { value: "ESTIMATING", label: "見積中", colorClass: "bg-amber-50 text-amber-600 border-amber-200" },
  { value: "WAITING_PAYMENT", label: "入金待ち", colorClass: "bg-sky-50 text-sky-600 border-sky-200" },
  { value: "WORKING", label: "作業中", colorClass: "bg-blue-50 text-blue-600 border-blue-200" },
  { value: "COMPLETED", label: "納品済", colorClass: "bg-green-50 text-green-600 border-green-200" },
  { value: "CANCELED", label: "キャンセル", colorClass: "bg-slate-100 text-slate-600 border-slate-200" },
];

type MainTab = "IN_PROGRESS" | "COMPLETED" | "CANCELED";

export function OrderListClient({ initialOrders }: { initialOrders: Order[] }) {
  const router = useRouter();
  
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [activeTab, setActiveTab] = useState<MainTab>("IN_PROGRESS");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [serviceFilter, setServiceFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);
  
  // インライン編集用の状態
  const [editingField, setEditingField] = useState<{orderId: string, field: string} | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  const dropdownRef = useRef<HTMLDivElement>(null);

  // ポップアップの外側をクリックしたら閉じる処理
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setEditingStatusId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setEditingStatusId(null);
    }
  };

  const startEditing = (orderId: string, field: string, initialValue: string | number | null, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingField({ orderId, field });
    setEditValue(initialValue ? String(initialValue) : "");
  };

  const saveEdit = async () => {
    if (!editingField) return;
    const { orderId, field } = editingField;
    
    let valueToSave: any = editValue;
    if (field === "price") {
      if (editValue.trim() === "") {
        valueToSave = null;
      } else {
        valueToSave = parseInt(editValue.replace(/[^0-9]/g, ""), 10);
        if (isNaN(valueToSave)) valueToSave = null;
      }
    } else {
      if (editValue.trim() === "") {
        valueToSave = null;
      }
    }

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: valueToSave })
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, [field]: valueToSave } : o));
      }
    } catch (error) {
      console.error(`Failed to update ${field}:`, error);
    } finally {
      setEditingField(null);
    }
  };

  // 各タブ用のフィルタリング関数
  const isInProgress = (status: string) => ["PENDING", "ESTIMATING", "WAITING_PAYMENT", "WORKING"].includes(status);
  const isCanceled = (status: string) => status === "CANCELED" || status === "CANCELLED";
  
  // ベースとなるフィルタリング (サービス・検索)
  const baseFilteredOrders = orders
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
  const canceledCount = baseFilteredOrders.filter((o) => isCanceled(o.status)).length;

  // 最終的に表示するリスト
  const displayOrders = baseFilteredOrders
    .filter((order) => {
      if (activeTab === "IN_PROGRESS") return isInProgress(order.status);
      if (activeTab === "COMPLETED") return order.status === "COMPLETED";
      if (activeTab === "CANCELED") return isCanceled(order.status);
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
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white p-3 rounded-xl shadow-sm border border-slate-200">
        <div className="flex overflow-x-auto items-center gap-1.5 p-1 bg-slate-100 rounded-lg scrollbar-hide">
          <button 
            onClick={() => setServiceFilter("ALL")}
            className={`whitespace-nowrap px-3 py-2 md:py-1.5 rounded-md text-sm md:text-xs font-bold transition-all ${serviceFilter === 'ALL' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            すべて
          </button>
          <button 
            onClick={() => setServiceFilter("MIX")}
            className={`whitespace-nowrap px-3 py-2 md:py-1.5 rounded-md text-sm md:text-xs font-bold transition-all ${serviceFilter === 'MIX' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            MIX・マスタリング
          </button>
          <button 
            onClick={() => setServiceFilter("ORIGINAL")}
            className={`whitespace-nowrap px-3 py-2 md:py-1.5 rounded-md text-sm md:text-xs font-bold transition-all ${serviceFilter === 'ORIGINAL' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            オリジナル楽曲制作
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-3 md:top-2.5 h-4 w-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="名前, 曲名, メールで検索..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-slate-200 rounded-lg text-base md:text-sm bg-slate-50 text-slate-900 placeholder:text-slate-500 py-2.5 pr-3 pl-9 md:py-2 md:pr-3 md:pl-9 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/50 transition-colors"
            />
          </div>
          <div className="relative flex-1 sm:flex-none group">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "desc" | "asc")}
              className="w-full appearance-none border border-slate-200 rounded-lg text-base md:text-sm bg-slate-50 text-slate-900 py-2.5 pl-3 pr-9 md:py-2 md:pl-3 md:pr-9 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/50 transition-colors"
            >
              <option value="desc">新しい順</option>
              <option value="asc">古い順</option>
            </select>
            <ArrowUpDown className="absolute right-3 top-3 md:top-2.5 h-4 w-4 text-slate-500 pointer-events-none group-focus-within:text-orange-500" />
          </div>
        </div>
      </div>

      {/* メインタブ */}
      <div className="flex flex-col gap-3">
        <nav className="flex space-x-6 border-b border-slate-200 px-1" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("IN_PROGRESS")}
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
      </div>

      {/* リスト表示 */}
      <div className="bg-white md:rounded-xl shadow-sm border-t border-b md:border border-slate-200 overflow-visible animate-in fade-in duration-300 -mx-4 md:mx-0">
        
        {/* スマホ用カード表示 (md:hidden) */}
        <div className="md:hidden divide-y divide-slate-100">
          {displayOrders.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              該当する依頼データはありません。
            </div>
          ) : (
            displayOrders.map((order) => (
              <div 
                key={order.id} 
                onClick={() => router.push(`/admin/orders/${order.id}`)}
                className="p-4 hover:bg-orange-50/50 transition-colors cursor-pointer group text-sm relative"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="relative overflow-visible">
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingStatusId(editingStatusId === order.id ? null : order.id);
                      }}
                      className={`flex items-center gap-1 w-max px-2.5 py-1 rounded-md text-xs font-bold border cursor-pointer hover:opacity-80 transition-opacity ${
                        order.status === 'PENDING' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                        order.status === 'ESTIMATING' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                        order.status === 'WAITING_PAYMENT' ? 'bg-sky-50 text-sky-600 border-sky-200' :
                        order.status === 'WORKING' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                        order.status === 'COMPLETED' ? 'bg-green-50 text-green-600 border-green-200' :
                        (order.status === 'CANCELED' || order.status === 'CANCELLED') ? 'bg-slate-100 text-slate-600 border-slate-200' :
                        'bg-slate-50 text-slate-500 border-slate-200'
                      }`}
                    >
                      {STATUS_LABELS[order.status] || order.status}
                      <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                    </div>
                    {/* ステータス変更ポップアップ */}
                    {editingStatusId === order.id && (
                      <div 
                        ref={dropdownRef}
                        className="absolute z-50 mt-1 left-0 w-44 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                      >
                        <div className="py-1">
                          {STATUS_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              onClick={(e) => handleStatusChange(order.id, opt.value, e)}
                              className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-center"
                            >
                              <span className={`px-2 py-1 rounded-md text-xs font-bold inline-block border ${opt.colorClass}`}>
                                {opt.label}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-slate-500 text-xs text-right shrink-0">
                    {new Date(order.createdAt).toLocaleDateString("ja-JP")}
                  </div>
                </div>

                <div className="mb-2">
                  <div className="font-bold text-slate-900 line-clamp-1 mb-0.5 text-base">{order.songTitle || <span className="text-slate-400 font-normal">曲名未設定</span>}</div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-700 text-sm">{order.clientName}</span>
                    {order.isRepeater && (
                      <span className="text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-200 px-1.5 py-0.5 rounded font-bold">リピーター</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-bold">サービス</span>
                    <span className="bg-slate-50 px-2 py-1 rounded border border-slate-100 text-slate-600 font-medium">
                      {order.serviceType === "MIX" ? "MIX・マスタリング" : "オリジナル楽曲制作"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-bold">納期</span>
                    <div onClick={(e) => startEditing(order.id, 'deadline', order.deadline, e)} className="cursor-pointer hover:bg-slate-50 px-2 py-1 -mr-2 rounded transition-colors text-right">
                      {editingField?.orderId === order.id && editingField?.field === 'deadline' ? (
                        <input 
                          autoFocus 
                          value={editValue} 
                          onChange={e => setEditValue(e.target.value)} 
                          onBlur={saveEdit} 
                          onKeyDown={e => { if(e.key === 'Enter') saveEdit(); }}
                          onClick={e => e.stopPropagation()}
                          className="border border-slate-300 rounded px-1.5 py-0.5 outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-right w-24"
                        />
                      ) : (
                        <span className="text-slate-700 underline decoration-slate-300 decoration-dashed underline-offset-4">{order.deadline || <span className="text-slate-400 font-normal">未定</span>}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-bold">金額</span>
                    <div onClick={(e) => startEditing(order.id, 'price', order.price, e)} className="cursor-pointer hover:bg-slate-50 px-2 py-1 -mr-2 rounded transition-colors text-right">
                      {editingField?.orderId === order.id && editingField?.field === 'price' ? (
                        <input 
                          autoFocus 
                          value={editValue} 
                          onChange={e => setEditValue(e.target.value)} 
                          onBlur={saveEdit} 
                          onKeyDown={e => { if(e.key === 'Enter') saveEdit(); }}
                          onClick={e => e.stopPropagation()}
                          className="border border-slate-300 rounded px-1.5 py-0.5 outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-right font-bold w-24"
                        />
                      ) : (
                        <span className="text-slate-900 font-bold text-sm underline decoration-slate-300 decoration-dashed underline-offset-4">{order.price ? `¥${order.price.toLocaleString()}` : <span className="text-slate-400 font-normal">未見積もり</span>}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* PC用テーブル表示 (hidden md:block) */}
        <div className="hidden md:block overflow-x-auto overflow-y-visible pb-20">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500">
                <th className="py-3 px-4 pl-5">ステータス</th>
                <th className="py-3 px-4">ご依頼日</th>
                <th className="py-3 px-4">曲名</th>
                <th className="py-3 px-4">クライアント名</th>
                <th className="py-3 px-4">サービス内容</th>
                <th className="py-3 px-4">納期</th>
                <th className="py-3 px-4 pr-5 text-right">金額</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-sm text-slate-500">
                    該当する依頼データはありません。
                  </td>
                </tr>
              ) : (
                displayOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    onClick={() => router.push(`/admin/orders/${order.id}`)}
                    className="hover:bg-orange-50/50 transition-colors cursor-pointer group text-sm relative"
                  >
                    <td className="py-3 px-4 pl-5 relative overflow-visible">
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingStatusId(editingStatusId === order.id ? null : order.id);
                        }}
                        className={`flex items-center gap-1 w-max px-2 py-0.5 rounded-md text-[11px] font-bold border cursor-pointer hover:opacity-80 transition-opacity ${
                          order.status === 'PENDING' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                          order.status === 'ESTIMATING' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                          order.status === 'WAITING_PAYMENT' ? 'bg-sky-50 text-sky-600 border-sky-200' :
                          order.status === 'WORKING' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                          order.status === 'COMPLETED' ? 'bg-green-50 text-green-600 border-green-200' :
                          (order.status === 'CANCELED' || order.status === 'CANCELLED') ? 'bg-slate-100 text-slate-600 border-slate-200' :
                          'bg-slate-50 text-slate-500 border-slate-200'
                        }`}
                      >
                        {STATUS_LABELS[order.status] || order.status}
                        <ChevronDown className="w-3 h-3 opacity-50" />
                      </div>
                      
                      {/* ステータス変更ポップアップ */}
                      {editingStatusId === order.id && (
                        <div 
                          ref={dropdownRef}
                          className="absolute z-50 mt-1 left-4 w-40 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                        >
                          <div className="py-1">
                            {STATUS_OPTIONS.map((opt) => (
                              <button
                                key={opt.value}
                                onClick={(e) => handleStatusChange(order.id, opt.value, e)}
                                className="w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors flex items-center"
                              >
                                <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold inline-block border ${opt.colorClass}`}>
                                  {opt.label}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
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
                      {order.serviceType === "MIX" ? "MIX・マスタリング" : "オリジナル楽曲制作"}
                    </td>
                    <td className="py-3 px-4 text-slate-700 text-xs cursor-text" onClick={(e) => startEditing(order.id, 'deadline', order.deadline, e)}>
                      {editingField?.orderId === order.id && editingField?.field === 'deadline' ? (
                        <input 
                          autoFocus 
                          value={editValue} 
                          onChange={e => setEditValue(e.target.value)} 
                          onBlur={saveEdit} 
                          onKeyDown={e => { if(e.key === 'Enter') saveEdit(); }}
                          onClick={e => e.stopPropagation()}
                          className="border border-slate-300 rounded px-1.5 py-0.5 outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 w-24 text-slate-900"
                        />
                      ) : (
                        <span className="hover:bg-slate-100 p-1 rounded transition-colors -ml-1 border border-transparent hover:border-slate-200 border-dashed">{order.deadline || <span className="text-slate-400">未定</span>}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 pr-5 font-bold text-slate-900 text-right cursor-text" onClick={(e) => startEditing(order.id, 'price', order.price, e)}>
                      {editingField?.orderId === order.id && editingField?.field === 'price' ? (
                        <input 
                          autoFocus 
                          value={editValue} 
                          onChange={e => setEditValue(e.target.value)} 
                          onBlur={saveEdit} 
                          onKeyDown={e => { if(e.key === 'Enter') saveEdit(); }}
                          onClick={e => e.stopPropagation()}
                          className="border border-slate-300 rounded px-1.5 py-0.5 outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 w-24 text-right"
                        />
                      ) : (
                        <span className="hover:bg-slate-100 p-1 rounded transition-colors -mr-1 border border-transparent hover:border-slate-200 border-dashed">{order.price ? `¥${order.price.toLocaleString()}` : <span className="text-slate-400 font-normal text-xs">未見積もり</span>}</span>
                      )}
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
