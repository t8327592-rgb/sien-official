"use client";
import Link from "next/link";
import { type OrderFilters, parseOrderFilters, orderFilterUrl, matchesOrderDue, matchesOrderStatus, compareOrderDeadlines, todayInJapan } from "@/lib/admin-order-filters";
import { ORDER_STATUS_LABELS as STATUS_LABELS, ORDER_STATUS_OPTIONS as STATUS_OPTIONS } from "@/lib/order-status";
import type { OrderRecord } from "@/lib/admin-types";
import type { Plan } from "@prisma/client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowUpDown, ChevronDown, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { parseAdminMoney, patchAdminOrder, syncAdminDeadline, setClientRepeater } from "@/lib/admin-order-client";

// orderの型定義（簡易版）
type Order = OrderRecord;

type MainTab = "ALL" | "IN_PROGRESS" | "COMPLETED" | "CANCELED";

export function OrderListClient({ initialOrders, archived = false, initialFilters = parseOrderFilters({}), today = todayInJapan() }: { initialOrders: Order[], plans?: Plan[], archived?: boolean, initialFilters?: OrderFilters, today?: string }) {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [activeTab, setActiveTab] = useState<MainTab>(archived ? "ALL" : initialFilters.status === "COMPLETED" ? "COMPLETED" : initialFilters.status === "CANCELED" ? "CANCELED" : "IN_PROGRESS");
  const [lastArchived, setLastArchived] = useState<Order | null>(null);
  const [sortOrder, setSortOrder] = useState<OrderFilters["sort"]>(initialFilters.sort);
  const [serviceFilter, setServiceFilter] = useState<string>(initialFilters.service);
  const [searchQuery, setSearchQuery] = useState<string>(initialFilters.q);

  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);
  const savingRef = useRef(false);
  const [isSaving, setIsSaving] = useState(false);

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
    if (savingRef.current) return;
    savingRef.current = true;
    setIsSaving(true);
    try {
      const updated = await patchAdminOrder(orderId, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      setEditingStatusId(null);
      toast.success("ステータスを更新しました");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "更新に失敗しました");
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  const handleArchive = async (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (savingRef.current) return;
    if (!archived && !window.confirm("この依頼をアーカイブしますか？\nデータは残り、アーカイブ一覧から復元できます。")) return;
    savingRef.current = true; setIsSaving(true);
    try {
      const updated = await patchAdminOrder(orderId, { isArchived: !archived });
      setOrders(prev => prev.filter(o => o.id !== orderId));
      if (!archived) setLastArchived(updated);
      toast.success(archived ? "依頼を復元しました" : "アーカイブしました");
      router.refresh();
    } catch (error) { toast.error(error instanceof Error ? error.message : "更新に失敗しました"); }
    finally { savingRef.current = false; setIsSaving(false); }
  };

  const undoArchive = async () => {
    if (!lastArchived || savingRef.current) return;
    savingRef.current = true; setIsSaving(true);
    try {
      const updated = await patchAdminOrder(lastArchived.id, { isArchived: false });
      setOrders(previous => [updated, ...previous.filter(o => o.id !== updated.id)]);
      setLastArchived(null); toast.success("アーカイブを取り消しました"); router.refresh();
    } catch (error) { toast.error(error instanceof Error ? error.message : "復元に失敗しました"); }
    finally { savingRef.current = false; setIsSaving(false); }
  };

  const toggleRepeater = async (orderId: string, currentStatus: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    if (savingRef.current) return;
    const newStatus = !currentStatus;
    const order = orders.find(o => o.id === orderId);
    const scope = order?.clientEmail?.trim() ? "同じメールアドレスの依頼すべて（アーカイブ・キャンセルを含む）" : "この依頼";
    if (!window.confirm(`${scope}を「${newStatus ? 'リピーター' : '新規'}」に変更しますか？`)) return;
    savingRef.current = true; setIsSaving(true);
    try {
      const ids = await setClientRepeater(orderId, newStatus);
      const updatedIds = new Set(ids);
      setOrders(prev => prev.map(o => updatedIds.has(o.id) ? { ...o, isRepeater: newStatus } : o));
      toast.success(`${ids.length}件の顧客種別を更新しました`); router.refresh();
    } catch (error) { toast.error(error instanceof Error ? error.message : "更新に失敗しました"); }
    finally { savingRef.current = false; setIsSaving(false); }
  };
  const startEditing = (orderId: string, field: string, initialValue: string | number | null, e: React.MouseEvent) => {
    e.stopPropagation();
    if (savingRef.current || editingField) return;
    setEditingField({ orderId, field });
    setEditValue(initialValue === null ? "" : String(initialValue));
  };

  const saveEdit = async () => {
    if (!editingField || savingRef.current) return;
    const { orderId, field } = editingField;
    savingRef.current = true;
    setIsSaving(true);
    try {
      const value = field === "price" ? parseAdminMoney(editValue) : editValue.trim() || null;
      const updated = await patchAdminOrder(orderId, { [field]: value });
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      setEditingField(null);
      toast.success("保存しました");
      if (field === "deadline" && typeof value === "string") {
        try { toast.success(await syncAdminDeadline(orderId, value)); }
        catch (error) { toast.error(error instanceof Error ? error.message : "納期は保存しましたが、カレンダー同期に失敗しました"); }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "保存に失敗しました");
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  const editKeys = (event: React.KeyboardEvent<HTMLInputElement>) => {
    event.stopPropagation();
    if (event.key === "Enter") { event.preventDefault(); void saveEdit(); }
    if (event.key === "Escape" && !savingRef.current) { event.preventDefault(); setEditingField(null); }
  };
  const editActions = () => <span className="flex justify-end gap-2 mt-1" onClick={event => event.stopPropagation()}>
    <button disabled={isSaving} onClick={() => void saveEdit()} className="px-2 py-1 rounded bg-slate-800 text-white disabled:opacity-50">{isSaving ? "保存中…" : "保存"}</button>
    <button disabled={isSaving} onClick={() => setEditingField(null)} className="px-2 py-1 rounded border bg-white">取消</button>
  </span>;

  // 各タブ用のフィルタリング関数
  const isInProgress = (status: string) => ["PENDING", "ESTIMATING", "WAITING_PAYMENT", "WORKING"].includes(status);
  const isCanceled = (status: string) => status === "CANCELED" || status === "CANCELLED";

  const changeFilters = (update: Partial<OrderFilters>) => router.replace(orderFilterUrl({ ...initialFilters, service: serviceFilter, q: searchQuery, sort: sortOrder, ...update }, archived), { scroll: false });

  // ベースとなるフィルタリング (サービス・検索)
  const baseFilteredOrders = orders
    .filter(order => matchesOrderStatus(order.status, initialFilters.status) && matchesOrderDue(order, initialFilters.due, today))
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

  // リピート率計算（顧客ベース）
  const uniqueClients = new Map<string, boolean>();
  orders.forEach(order => {
    if (order.clientEmail) {
      const isRepeater = order.isRepeater === true || uniqueClients.get(order.clientEmail);
      uniqueClients.set(order.clientEmail, !!isRepeater);
    }
  });

  const totalClientsCount = uniqueClients.size;
  let repeaterClientsCount = 0;
  uniqueClients.forEach((isRepeater) => {
    if (isRepeater) repeaterClientsCount++;
  });

  const repeatRate = totalClientsCount > 0
    ? Math.round((repeaterClientsCount / totalClientsCount) * 100)
    : 0;

  // 注文ベースのリピート率計算（キャンセルされたものを除く全注文）
  const validOrders = orders.filter((o) => !isCanceled(o.status));
  const totalValidOrdersCount = validOrders.length;
  const repeatedOrdersCount = validOrders.filter((o) => o.isRepeater).length;
  const orderRepeatRate = totalValidOrdersCount > 0
    ? Math.round((repeatedOrdersCount / totalValidOrdersCount) * 100)
    : 0;

  // 最終的に表示するリスト
  const displayOrders = baseFilteredOrders
    .filter((order) => {
      if (activeTab === "ALL") return true;
      if (activeTab === "IN_PROGRESS") return isInProgress(order.status);
      if (activeTab === "COMPLETED") return order.status === "COMPLETED";
      if (activeTab === "CANCELED") return isCanceled(order.status);
      return false;
    })
    .sort((a, b) => {
      if (sortOrder === "deadline") return compareOrderDeadlines(a, b);
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="space-y-4">
      <nav aria-label="依頼の保管状態" className="flex flex-wrap gap-3 text-sm">
        <Link href="/admin/orders" aria-current={!archived ? "page" : undefined} className={!archived ? "font-bold text-orange-700 underline" : "underline"}>通常の依頼</Link>
        <Link href="/admin/orders?archive=1" aria-current={archived ? "page" : undefined} className={archived ? "font-bold text-orange-700 underline" : "underline"}>アーカイブ一覧</Link>
      </nav>
      {archived && <p className="text-sm text-slate-600">アーカイブ済みの依頼です。「復元」で通常の一覧へ戻せます。売上集計からは除外されません。</p>}
      {lastArchived && <div role="status" className="flex flex-wrap items-center gap-3 rounded-lg border bg-white p-3 text-sm"><span>依頼をアーカイブしました。</span><button disabled={isSaving} onClick={() => void undoArchive()} className="underline font-bold text-orange-700 p-2">アーカイブを取り消す</button></div>}
      {/* 上部フィルター (サービス種別 ＋ 検索 ＋ ソート) */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white p-3 rounded-xl shadow-sm border border-slate-200">
        <div className="flex overflow-x-auto items-center gap-1.5 p-1 bg-slate-100 rounded-lg scrollbar-hide">
          <button
            onClick={() => { setServiceFilter("ALL"); changeFilters({ service: "ALL" }); }}
            className={`whitespace-nowrap px-3 py-2 md:py-1.5 rounded-md text-sm md:text-xs font-bold transition-all ${serviceFilter === 'ALL' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            すべて
          </button>
          <button
            onClick={() => { setServiceFilter("MIX"); changeFilters({ service: "MIX" }); }}
            className={`whitespace-nowrap px-3 py-2 md:py-1.5 rounded-md text-sm md:text-xs font-bold transition-all ${serviceFilter === 'MIX' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            MIX・マスタリング
          </button>
          <button
            onClick={() => { setServiceFilter("ORIGINAL"); changeFilters({ service: "ORIGINAL" }); }}
            className={`whitespace-nowrap px-3 py-2 md:py-1.5 rounded-md text-sm md:text-xs font-bold transition-all ${serviceFilter === 'ORIGINAL' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            オリジナル楽曲制作
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-3 md:top-2.5 h-4 w-4 text-slate-500" />
            <input aria-label="依頼を検索"
              type="text"
              placeholder="名前, 曲名, メールで検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} onBlur={() => changeFilters({ q: searchQuery })} onKeyDown={e => { if (e.key === "Enter") changeFilters({ q: searchQuery }); }}
              className="w-full border border-slate-200 rounded-lg text-base md:text-sm bg-slate-50 text-slate-900 placeholder:text-slate-500 py-2.5 pr-3 pl-9 md:py-2 md:pr-3 md:pl-9 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/50 transition-colors"
            />
          </div>
          <div className="relative flex-1 sm:flex-none group">
            <select aria-label="表示順序"
              value={sortOrder}
              onChange={(e) => { const sort = e.target.value as OrderFilters["sort"]; setSortOrder(sort); changeFilters({ sort }); }}
              className="w-full appearance-none border border-slate-200 rounded-lg text-base md:text-sm bg-slate-50 text-slate-900 py-2.5 pl-3 pr-9 md:py-2 md:pl-3 md:pr-9 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/50 transition-colors"
            >
              <option value="desc">新しい順</option>
              <option value="asc">古い順</option><option value="deadline">納期が近い順</option>
            </select>
            <ArrowUpDown className="absolute right-3 top-3 md:top-2.5 h-4 w-4 text-slate-500 pointer-events-none group-focus-within:text-orange-500" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center text-sm">
        <label className="flex flex-wrap gap-2 items-center">ステータス
          <select aria-label="ステータスで絞り込み" value={initialFilters.status} onChange={e => changeFilters({ status: e.target.value })} className="border rounded-lg bg-white p-2 max-w-full">
            <option value="ALL">すべて</option>{STATUS_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label className="flex flex-wrap gap-2 items-center">確定納期
          <select aria-label="確定納期で絞り込み" value={initialFilters.due} onChange={e => changeFilters({ due: e.target.value, status: "ALL", sort: "deadline" })} className="border rounded-lg bg-white p-2 max-w-full">
            <option value="ALL">すべて</option><option value="today">今日締切</option><option value="overdue">期限超過</option>
          </select>
        </label>
        <Link href={archived ? "/admin/orders?archive=1" : "/admin/orders"} className="underline p-2">絞り込みを解除</Link>
      </div>
      {/* メインタブとサマリー */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <nav className="flex gap-4 overflow-x-auto border-b border-slate-200 px-1 w-full sm:w-auto" aria-label="依頼ステータス">
          {archived && <button onClick={() => setActiveTab("ALL")} className={`whitespace-nowrap pb-3 border-b-2 text-sm font-bold ${activeTab === "ALL" ? "border-orange-500 text-orange-700" : "border-transparent text-slate-500"}`}>すべて（{baseFilteredOrders.length}）</button>}
          <button
            onClick={() => { setActiveTab("IN_PROGRESS"); changeFilters({ status: "ALL", due: "ALL" }); }}
            className={`whitespace-nowrap pb-3 px-1 border-b-2 font-bold text-sm transition-colors duration-200 ${
              activeTab === "IN_PROGRESS"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            進行中（{inProgressCount}）
          </button>
          <button
            onClick={() => { setActiveTab("COMPLETED"); changeFilters({ status: "COMPLETED", due: "ALL" }); }}
            className={`whitespace-nowrap pb-3 px-1 border-b-2 font-bold text-sm transition-colors duration-200 ${
              activeTab === "COMPLETED"
                ? "border-green-500 text-green-600"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            納品済（{completedCount}）
          </button>
          <button
            onClick={() => { setActiveTab("CANCELED"); changeFilters({ status: "CANCELED", due: "ALL" }); }}
            className={`whitespace-nowrap pb-3 px-1 border-b-2 font-bold text-sm transition-colors duration-200 ${
              activeTab === "CANCELED"
                ? "border-slate-800 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            キャンセル（{canceledCount}）
          </button>
        </nav>

        {/* リピート率表示 */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 px-1 sm:px-0 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-bold">リピート率 (人数)</span>
            <span className="text-indigo-600 font-bold text-base bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">{repeatRate}%</span>
            <span className="text-slate-400 text-xs font-medium">({repeaterClientsCount}名 / 全{totalClientsCount}名)</span>
          </div>
          <div className="hidden sm:block text-slate-300">|</div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-bold">リピート率 (件数)</span>
            <span className="text-teal-600 font-bold text-base bg-teal-50 px-2 py-0.5 rounded border border-teal-200">{orderRepeatRate}%</span>
            <span className="text-slate-400 text-xs font-medium">({repeatedOrdersCount}件 / 全{totalValidOrdersCount}件)</span>
          </div>
        </div>
      </div>

      {/* リスト表示 */}
      <div className="bg-slate-50 md:bg-white md:rounded-xl md:shadow-sm border-t border-b md:border border-slate-200 overflow-visible animate-in fade-in duration-300 -mx-4 md:mx-0 p-4 md:p-0">

        {/* スマホ用カード表示 (md:hidden) */}
        <div className="md:hidden flex flex-col gap-3">
          {displayOrders.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500 bg-white rounded-xl border border-slate-200 shadow-sm">
              該当する依頼データはありません。
            </div>
          ) : (
            displayOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => router.push(`/admin/orders/${order.id}`)}
                className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all cursor-pointer group text-sm relative"
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
                              key={opt.value} disabled={isSaving}
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
                    <span className="font-medium text-slate-700 text-sm"><Link href={`/admin/orders/${order.id}`} className="underline underline-offset-4">{order.clientName}</Link></span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-bold">顧客種別</span>
                    <button disabled={isSaving} onClick={(e) => void toggleRepeater(order.id, order.isRepeater, e)} className="hover:opacity-80 transition-opacity">
                      {order.isRepeater ? (
                        <span className="text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-200 px-2 py-0.5 rounded font-bold whitespace-nowrap cursor-pointer">リピーター</span>
                      ) : (
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-bold whitespace-nowrap cursor-pointer">新規</span>
                      )}
                    </button>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-bold">プラン名</span>
                    <span className="bg-slate-50 px-2 py-1 rounded border border-slate-100 text-slate-600 font-medium">
                      {order.planId || (order.serviceType === "MIX" ? "MIX・マスタリング" : "オリジナル楽曲制作")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-bold">納期</span>
                    <div role="button" tabIndex={0} aria-label="納期・金額を編集" onKeyDown={e => { if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); e.currentTarget.click(); } }} onClick={(e) => startEditing(order.id, 'deadline', order.deadline, e)} className="cursor-pointer hover:bg-slate-50 px-2 py-1 -mr-2 rounded transition-colors text-right">
                      {editingField?.orderId === order.id && editingField?.field === 'deadline' ? (
                        <><input aria-label="納期" disabled={isSaving}
                          type="date"
                          autoFocus
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}

                          onKeyDown={editKeys}
                          onClick={e => {
                            e.stopPropagation();
                            try {
                              if ('showPicker' in HTMLInputElement.prototype) {
                                (e.target as HTMLInputElement).showPicker();
                              }
                            } catch {}
                          }}
                          className="border border-slate-300 rounded px-1.5 py-0.5 outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-right w-32"
                         />{editActions()}</>
                      ) : (
                        <span className="text-slate-700 underline decoration-slate-300 decoration-dashed underline-offset-4">{order.deadline || <span className="text-slate-400 font-normal">未定</span>}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-bold">金額</span>
                    <div role="button" tabIndex={0} aria-label="納期・金額を編集" onKeyDown={e => { if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); e.currentTarget.click(); } }} onClick={(e) => startEditing(order.id, 'price', order.price, e)} className="cursor-pointer hover:bg-slate-50 px-2 py-1 -mr-2 rounded transition-colors text-right">
                      {editingField?.orderId === order.id && editingField?.field === 'price' ? (
                        <><input aria-label="合計金額" disabled={isSaving}
                          autoFocus
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}

                          onKeyDown={editKeys}
                          onClick={e => e.stopPropagation()}
                          className="border border-slate-300 rounded px-1.5 py-0.5 outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-right font-bold w-24"
                         />{editActions()}</>
                      ) : (
                        <span className="text-slate-900 font-bold text-sm underline decoration-slate-300 decoration-dashed underline-offset-4">{order.price !== null ? `¥${order.price.toLocaleString()}` : <span className="text-slate-400 font-normal">未見積もり</span>}</span>
                      )}
                    </div>
                  </div>

                  {(archived || activeTab === "CANCELED") && (
                    <div className="flex justify-end mt-4 pt-3 border-t border-slate-100">
                      <button
                        disabled={isSaving} onClick={(e) => void handleArchive(order.id, e)}
                        className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {archived ? "復元する" : "アーカイブする"}
                      </button>
                    </div>
                  )}
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
                <th className="py-3 px-4">顧客種別</th>
                <th className="py-3 px-4">曲名</th>
                <th className="py-3 px-4">クライアント名</th>
                <th className="py-3 px-4">プラン名</th>
                <th className="py-3 px-4">納期</th>
                <th className="py-3 px-4 pr-5 text-right">金額</th>
                {(archived || activeTab === "CANCELED") && <th className="py-3 px-4 w-10"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayOrders.length === 0 ? (
                <tr>
                  <td colSpan={(archived || activeTab === "CANCELED") ? 9 : 8} className="p-8 text-center text-sm text-slate-500">
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
                                key={opt.value} disabled={isSaving}
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
                    <td className="py-3 px-4">
                      <button disabled={isSaving} onClick={(e) => void toggleRepeater(order.id, order.isRepeater, e)} className="hover:opacity-80 transition-opacity">
                        {order.isRepeater ? (
                          <span className="text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-200 px-2 py-0.5 rounded font-bold whitespace-nowrap cursor-pointer">リピーター</span>
                        ) : (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-bold whitespace-nowrap cursor-pointer">新規</span>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800 max-w-[200px] truncate" title={order.songTitle ?? undefined}>
                      <Link href={`/admin/orders/${order.id}`} className="underline underline-offset-4">{order.songTitle || "未設定"}</Link>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900"><Link href={`/admin/orders/${order.id}`} className="underline underline-offset-4">{order.clientName}</Link></span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{order.clientEmail}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-xs font-medium">
                      {order.planId || (order.serviceType === "MIX" ? "MIX・マスタリング" : "オリジナル楽曲制作")}
                    </td>
                    <td role="button" tabIndex={0} aria-label="納期・金額を編集" onKeyDown={e => { if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); e.currentTarget.click(); } }} className="py-3 px-4 text-slate-700 text-xs cursor-text" onClick={(e) => startEditing(order.id, 'deadline', order.deadline, e)}>
                      {editingField?.orderId === order.id && editingField?.field === 'deadline' ? (
                        <><input aria-label="納期" disabled={isSaving}
                          type="date"
                          autoFocus
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}

                          onKeyDown={editKeys}
                          onClick={e => {
                            e.stopPropagation();
                            try {
                              if ('showPicker' in HTMLInputElement.prototype) {
                                (e.target as HTMLInputElement).showPicker();
                              }
                            } catch {}
                          }}
                          className="border border-slate-300 rounded px-1.5 py-0.5 outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 w-32 text-slate-900"
                         />{editActions()}</>
                      ) : (
                        <span className="hover:bg-slate-100 p-1 rounded transition-colors -ml-1 border border-transparent hover:border-slate-200 border-dashed">{order.deadline || <span className="text-slate-400">未定</span>}</span>
                      )}
                    </td>
                    <td role="button" tabIndex={0} aria-label="納期・金額を編集" onKeyDown={e => { if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); e.currentTarget.click(); } }} className="py-3 px-4 pr-5 font-bold text-slate-900 text-right cursor-text" onClick={(e) => startEditing(order.id, 'price', order.price, e)}>
                      {editingField?.orderId === order.id && editingField?.field === 'price' ? (
                        <><input aria-label="合計金額" disabled={isSaving}
                          autoFocus
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}

                          onKeyDown={editKeys}
                          onClick={e => e.stopPropagation()}
                          className="border border-slate-300 rounded px-1.5 py-0.5 outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 w-24 text-right"
                         />{editActions()}</>
                      ) : (
                        <span className="hover:bg-slate-100 p-1 rounded transition-colors -mr-1 border border-transparent hover:border-slate-200 border-dashed">{order.price !== null ? `¥${order.price.toLocaleString()}` : <span className="text-slate-400 font-normal text-xs">未見積もり</span>}</span>
                      )}
                    </td>
                    {(archived || activeTab === "CANCELED") && (
                      <td className="py-3 px-4 text-center">
                        <button
                          disabled={isSaving} onClick={(e) => void handleArchive(order.id, e)}
                          className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                          title={archived ? "復元する" : "アーカイブする"} aria-label={archived ? "依頼を復元" : "依頼をアーカイブ"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
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
