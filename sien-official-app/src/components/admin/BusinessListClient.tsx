"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowUpDown, ChevronDown } from "lucide-react";

type BusinessContact = any; // 簡易化のためのany型

const STATUS_LABELS: Record<string, string> = {
  PENDING: "未対応",
  ESTIMATING: "見積中",
  WAITING_PAYMENT: "入金待ち",
  WORKING: "作業中",
  COMPLETED: "納品済",
  CANCELED: "キャンセル",
  CANCELLED: "キャンセル",
};

const STATUS_OPTIONS = [
  { value: "PENDING", label: "未対応", colorClass: "bg-orange-50 text-orange-600 border-orange-200" },
  { value: "ESTIMATING", label: "見積中", colorClass: "bg-amber-50 text-amber-600 border-amber-200" },
  { value: "WAITING_PAYMENT", label: "入金待ち", colorClass: "bg-sky-50 text-sky-600 border-sky-200" },
  { value: "WORKING", label: "作業中", colorClass: "bg-blue-50 text-blue-600 border-blue-200" },
  { value: "COMPLETED", label: "納品済", colorClass: "bg-green-50 text-green-600 border-green-200" },
  { value: "CANCELED", label: "キャンセル", colorClass: "bg-slate-100 text-slate-600 border-slate-200" },
];

type MainTab = "ALL" | "PENDING" | "ESTIMATING" | "WAITING_PAYMENT" | "WORKING" | "COMPLETED" | "CANCELED";

const formatDate = (date: any) => {
  if (!date) return "未対応";
  return new Date(date).toLocaleDateString("ja-JP");
};

export default function BusinessListClient({ initialContacts }: { initialContacts: BusinessContact[] }) {
  const router = useRouter();
  
  const [contacts, setContacts] = useState<BusinessContact[]>(initialContacts);
  const [activeTab, setActiveTab] = useState<MainTab>("ALL");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const handleStatusChange = async (contactId: string, newStatus: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/admin/business/${contactId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, lastContactedAt: new Date().toISOString() })
      });
      if (res.ok) {
        const updated = await res.json();
        setContacts(prev => prev.map(c => c.id === contactId ? updated : c));
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setEditingStatusId(null);
    }
  };

  const baseFiltered = contacts.filter((contact) => {
    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();
    return (
      (contact.companyName && contact.companyName.toLowerCase().includes(lowerQuery)) ||
      (contact.contactName && contact.contactName.toLowerCase().includes(lowerQuery)) ||
      (contact.email && contact.email.toLowerCase().includes(lowerQuery)) ||
      (contact.message && contact.message.toLowerCase().includes(lowerQuery))
    );
  });

  const counts = {
    ALL: baseFiltered.length,
    PENDING: baseFiltered.filter(c => c.status === "PENDING").length,
    ESTIMATING: baseFiltered.filter(c => c.status === "ESTIMATING").length,
    WAITING_PAYMENT: baseFiltered.filter(c => c.status === "WAITING_PAYMENT").length,
    WORKING: baseFiltered.filter(c => c.status === "WORKING").length,
    COMPLETED: baseFiltered.filter(c => c.status === "COMPLETED").length,
    CANCELED: baseFiltered.filter(c => c.status === "CANCELED" || c.status === "CANCELLED").length,
  };

  const displayContacts = baseFiltered
    .filter((contact) => {
      if (activeTab === "ALL") return true;
      if (activeTab === "CANCELED") return contact.status === "CANCELED" || contact.status === "CANCELLED";
      return contact.status === activeTab;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="space-y-4">
      {/* 上部フィルター */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white p-3 rounded-xl shadow-sm border border-slate-200">
        <div className="flex overflow-x-auto items-center gap-1.5 p-1 bg-slate-100 rounded-lg scrollbar-hide">
          <span className="text-sm font-bold text-slate-500 px-2 hidden md:block">検索・並び替え</span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-3 md:top-2.5 h-4 w-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="会社名, 担当者, メール, 内容..." 
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
              <option value="desc">受付日が新しい順</option>
              <option value="asc">受付日が古い順</option>
            </select>
            <ArrowUpDown className="absolute right-3 top-3 md:top-2.5 h-4 w-4 text-slate-500 pointer-events-none group-focus-within:text-orange-500" />
          </div>
        </div>
      </div>

      {/* メインタブ */}
      <div className="flex overflow-x-auto scrollbar-hide sm:flex-wrap items-center gap-2 border-b border-slate-200 px-1 w-full pb-2">
        {(["ALL", "PENDING", "ESTIMATING", "WAITING_PAYMENT", "WORKING", "COMPLETED", "CANCELED"] as MainTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap pb-2 px-1 border-b-2 font-bold text-sm transition-colors duration-200 ${
              activeTab === tab
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            {tab === "ALL" ? "すべて" : STATUS_LABELS[tab]}（{counts[tab]}）
          </button>
        ))}
      </div>

      {/* リスト表示 */}
      <div className="bg-slate-50 md:bg-white md:rounded-xl md:shadow-sm border-t border-b md:border border-slate-200 overflow-visible animate-in fade-in duration-300 -mx-4 md:mx-0 p-4 md:p-0">
        
        {/* スマホ用カード表示 */}
        <div className="md:hidden flex flex-col gap-3">
          {displayContacts.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500 bg-white rounded-xl border border-slate-200 shadow-sm">
              該当するデータはありません。
            </div>
          ) : (
            displayContacts.map((contact) => (
              <div 
                key={contact.id} 
                onClick={() => router.push(`/admin/business/${contact.id}`)}
                className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all cursor-pointer group text-sm relative"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="relative overflow-visible">
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingStatusId(editingStatusId === contact.id ? null : contact.id);
                      }}
                      className={`flex items-center gap-1 w-max px-2.5 py-1 rounded-md text-xs font-bold border cursor-pointer hover:opacity-80 transition-opacity ${
                        STATUS_OPTIONS.find(o => o.value === (contact.status === 'CANCELLED' ? 'CANCELED' : contact.status))?.colorClass || 'bg-slate-50 text-slate-500 border-slate-200'
                      }`}
                    >
                      {STATUS_LABELS[contact.status] || contact.status}
                      <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                    </div>
                    {/* ステータス変更ポップアップ */}
                    {editingStatusId === contact.id && (
                      <div 
                        ref={dropdownRef}
                        className="absolute z-50 mt-1 left-0 w-44 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                      >
                        <div className="py-1">
                          {STATUS_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              onClick={(e) => handleStatusChange(contact.id, opt.value, e)}
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
                    {formatDate(contact.createdAt)}
                  </div>
                </div>

                <div className="mb-2">
                  <div className="font-bold text-slate-900 line-clamp-1 mb-0.5 text-base">{contact.companyName}</div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-700 text-sm">{contact.contactName} 様</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-bold">ご用件</span>
                    <span className="text-slate-700">{contact.inquiryType}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-bold">ご予算感</span>
                    <span className="text-slate-700">{contact.budget || "未定"}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-bold">希望納期</span>
                    <span className="text-slate-700">{contact.deadline || "未定"}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-bold">最終対応日</span>
                    <span className="text-slate-700">{formatDate(contact.lastContactedAt)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* PC用テーブル表示 */}
        <div className="hidden md:block overflow-x-auto overflow-y-visible pb-20">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500">
                <th className="py-3 px-4 pl-5">ステータス</th>
                <th className="py-3 px-4">受付日</th>
                <th className="py-3 px-4">貴社名 / 担当者</th>
                <th className="py-3 px-4">ご用件</th>
                <th className="py-3 px-4 text-right">予算</th>
                <th className="py-3 px-4">希望納期</th>
                <th className="py-3 px-4">最終対応日</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayContacts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-sm text-slate-500">
                    該当するデータはありません。
                  </td>
                </tr>
              ) : (
                displayContacts.map((contact) => (
                  <tr 
                    key={contact.id} 
                    onClick={() => router.push(`/admin/business/${contact.id}`)}
                    className="hover:bg-orange-50/50 transition-colors cursor-pointer group text-sm relative"
                  >
                    <td className="py-3 px-4 pl-5 relative overflow-visible">
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingStatusId(editingStatusId === contact.id ? null : contact.id);
                        }}
                        className={`flex items-center gap-1 w-max px-2 py-0.5 rounded-md text-[11px] font-bold border cursor-pointer hover:opacity-80 transition-opacity ${
                          STATUS_OPTIONS.find(o => o.value === (contact.status === 'CANCELLED' ? 'CANCELED' : contact.status))?.colorClass || 'bg-slate-50 text-slate-500 border-slate-200'
                        }`}
                      >
                        {STATUS_LABELS[contact.status] || contact.status}
                        <ChevronDown className="w-3 h-3 opacity-50" />
                      </div>
                      
                      {/* ステータス変更ポップアップ */}
                      {editingStatusId === contact.id && (
                        <div 
                          ref={dropdownRef}
                          className="absolute z-50 mt-1 left-4 w-40 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                        >
                          <div className="py-1">
                            {STATUS_OPTIONS.map((opt) => (
                              <button
                                key={opt.value}
                                onClick={(e) => handleStatusChange(contact.id, opt.value, e)}
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
                      {formatDate(contact.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{contact.companyName}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{contact.contactName} 様</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {contact.inquiryType}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {contact.budget ? (
                        <span className="font-medium">{contact.budget}</span>
                      ) : (
                        <span className="text-slate-400 font-normal text-xs">未定</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-700 text-xs">
                      {contact.deadline || <span className="text-slate-400">未定</span>}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-xs">
                      {formatDate(contact.lastContactedAt)}
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
