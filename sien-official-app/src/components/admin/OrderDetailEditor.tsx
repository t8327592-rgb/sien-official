"use client";
import type { OrderRecord } from "@/lib/admin-types";
import { ADMIN_PAYMENT_OPTIONS, normalizePaymentMethod } from "@/lib/order-payment";
import { ORDER_STATUS_LABELS as STATUS_LABELS, ORDER_STATUS_COLORS as STATUS_COLORS, ORDER_STATUS_OPTIONS, normalizeOrderStatus } from "@/lib/order-status";
import type { Plan } from "@prisma/client";

import { useState, useRef } from "react";
import { parseAdminMoney, patchAdminOrder, syncAdminDeadline } from "@/lib/admin-order-client";
import { Copy, Edit2 } from "lucide-react";
import { toast } from "react-hot-toast";

type Order = OrderRecord;
type TextField = { [K in keyof Order]: Order[K] extends string | null ? K : never }[keyof Order]; // 簡易的な型定義

export function OrderDetailEditor({ initialOrder }: { initialOrder: Order, planDetails: Plan | null }) {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const savingRef = useRef(false);
  const [isSaving, setIsSaving] = useState(false);

  // ハイブリッド型のための全体編集モード状態
  const [isEditMode, setIsEditMode] = useState(false);
  const [bulkEditData, setBulkEditData] = useState<Partial<Order>>({});

  const handleCopyText = (text: string | null) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success("コピーしました");
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(order.clientEmail);
    toast.success("コピーしました");
  };

  const renderTwitterLink = (twitterId: string | null) => {
    if (!twitterId) return <span className="text-slate-400">未設定</span>;
    const url = twitterId.startsWith('@') ? `https://x.com/${twitterId.slice(1)}` : `https://x.com/${twitterId}`;
    return (
      <a href={url} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-700 underline underline-offset-2">
        {twitterId}
      </a>
    );
  };

  const startEditing = (field: string, initialVal: unknown) => {
    if (savingRef.current) return;
    setEditingField(field);
    const value = initialVal === null || initialVal === undefined ? "" : String(initialVal);
    setEditValue(field === "status" ? normalizeOrderStatus(value) : field === "paymentMethod" ? normalizePaymentMethod(value) : value);
  };

  const saveEdit = async () => {
    if (!editingField || savingRef.current) return;
    const field = editingField;
    savingRef.current = true;
    setIsSaving(true);
    try {
      const value = ["price", "basePrice", "optionPrice"].includes(field) ? parseAdminMoney(editValue) : editValue.trim() || null;
      setOrder(await patchAdminOrder(order.id, { [field]: value }));
      setEditingField(null);
      toast.success("保存しました");
      if (field === "deadline" && typeof value === "string") {
        try { toast.success(await syncAdminDeadline(order.id, value)); }
        catch (error) { toast.error(error instanceof Error ? error.message : "納期は保存しましたが、カレンダー同期に失敗しました"); }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "保存に失敗しました");
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  const handleBulkSave = async () => {
    if (savingRef.current) return;
    savingRef.current = true;
    setIsSaving(true);
    try {
      setOrder(await patchAdminOrder(order.id, bulkEditData));
      toast.success("保存しました");
      setIsEditMode(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "保存に失敗しました");
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  const cancelBulkEdit = () => {
    setBulkEditData({});
    setIsEditMode(false);
  };

  const renderEditable = (field: keyof Order, displayValue: React.ReactNode, type: 'text' | 'number' | 'textarea' | 'select' | 'date' = 'text', options?: {value: string, label: string}[], placeholder: string = "未設定") => {
    if (editingField === field) {
      return (
        <div className="flex gap-2 items-start w-full">
          {type === 'textarea' ? (
            <textarea aria-label={String(field)} id={`quick-${field}`}
              autoFocus disabled={isSaving}
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              className="w-full border border-slate-300 rounded p-2 text-sm outline-none focus:ring-2 focus:ring-orange-500 min-h-[120px]"
              placeholder={placeholder}
            />
          ) : type === 'select' ? (
            <select aria-label={String(field)} id={`quick-${field}`}
              autoFocus disabled={isSaving}
              value={editValue}
              onChange={e => {
                setEditValue(e.target.value);
              }}
              className="w-full border border-slate-300 rounded p-1.5 text-sm outline-none focus:ring-2 focus:ring-orange-500"
            >
              {field !== "status" && <option value="">未設定</option>}
              {options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          ) : (
            <input aria-label={String(field)} id={`quick-${field}`}
              type={type}
              autoFocus disabled={isSaving}
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              onKeyDown={e => { if(e.key === 'Enter') { e.preventDefault(); void saveEdit(); } if(e.key === 'Escape' && !savingRef.current) setEditingField(null); }}
              onClick={e => {
                if (type === 'date') {
                  try {
                    if ('showPicker' in HTMLInputElement.prototype) {
                      (e.target as HTMLInputElement).showPicker();
                    }
                  } catch {}
                }
              }}
              placeholder={placeholder}
              className={`w-full border border-slate-300 rounded px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-orange-500 ${type === 'date' ? 'min-h-[30px]' : ''}`}
            />
          )}
          <div className="flex flex-col gap-1 shrink-0">
            <button disabled={isSaving} onClick={saveEdit} className="bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded hover:bg-slate-700 shadow-sm">{isSaving ? "保存中…" : "保存"}</button>
            <button disabled={isSaving} onClick={() => setEditingField(null)} className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded hover:bg-slate-200">取消</button>
          </div>
        </div>
      );
    }

    return (
      <div
        role="button" tabIndex={0} aria-label={`${({status: "ステータス", paymentMethod: "お支払い方法", deadline: "希望納期", price: "合計金額", basePrice: "基本料金", optionPrice: "オプション料金"} as Partial<Record<keyof Order, string>>)[field] || field}：${order[field] ?? "未設定"}を編集`} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); startEditing(field, order[field]); } }} onClick={() => startEditing(field, order[field])}
        className="group relative cursor-pointer min-h-[24px] rounded px-1 -mx-1 hover:bg-slate-100 transition-colors flex items-center justify-between"
      >
        <div className="flex-1 w-full">{displayValue}</div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity pl-2 shrink-0">
          <Edit2 className="w-3 h-3 text-slate-400" />
        </div>
      </div>
    );
  };

  const renderHybridField = (field: TextField, label: string, type: 'text' | 'textarea' | 'select' = 'text', options?: {value: string, label: string}[]) => {
    const value = isEditMode && bulkEditData[field] !== undefined ? bulkEditData[field] : order[field];

    if (!isEditMode) {
      let displayVal = value;
      if (type === 'select' && options) {
        displayVal = options.find(o => o.value === value)?.label || value;
      }
      return <span className={`font-medium ${displayVal ? 'text-slate-800' : 'text-slate-400'}`}>{displayVal || "未設定"}</span>;
    }

    if (type === 'textarea') {
      return (
        <textarea disabled={isSaving} aria-label={label} id={`detail-${field}`}
          value={value || ""}
          onChange={e => setBulkEditData(prev => ({...prev, [field]: e.target.value}))}
          className="w-full border border-slate-300 rounded p-2 text-sm outline-none focus:ring-2 focus:ring-orange-500 min-h-[80px]"
        />
      );
    }

    if (type === 'select') {
      return (
        <select disabled={isSaving} aria-label={label} id={`detail-${field}`}
          value={value || ""}
          onChange={e => setBulkEditData(prev => ({...prev, [field]: e.target.value}))}
          className="w-full border border-slate-300 rounded p-1.5 text-sm outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="">未設定</option>
          {options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      );
    }

    return (
      <input disabled={isSaving} aria-label={label} id={`detail-${field}`}
        type="text"
        value={value || ""}
        onChange={e => setBulkEditData(prev => ({...prev, [field]: e.target.value}))}
        className="w-full border border-slate-300 rounded px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-orange-500"
      />
    );
  };

  return (
    <div className="space-y-6">

      {/* 画面トップ：モード切替ボタン */}
      <div className="flex justify-end gap-2">
        {isEditMode ? (
          <>
            <button disabled={isSaving} onClick={cancelBulkEdit} className="px-4 py-2 text-sm font-bold text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">キャンセル</button>
            <button disabled={isSaving} onClick={handleBulkSave} className="px-4 py-2 text-sm font-bold text-white bg-slate-800 rounded-lg hover:bg-slate-700 shadow-sm">保存して閲覧モードに戻る</button>
          </>
        ) : (
          <button onClick={() => { setBulkEditData({}); setIsEditMode(true); }} className="px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-200 shadow-sm rounded-lg hover:bg-slate-50 flex items-center gap-2">
            <Edit2 className="w-4 h-4" />
            詳細情報を編集する
          </button>
        )}
      </div>

      {/* 2カラム トップパネル */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* 左：基本情報 */}
        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
          <div className="bg-slate-50/50 px-5 py-3 border-b flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-600 flex items-center gap-1.5">
              <span className="text-orange-500">👤</span> 基本情報
            </h2>
          </div>
          <div className="p-5 grid grid-cols-2 gap-4 flex-1">
            <div>
              <p className="text-[11px] font-bold text-slate-400 mb-1">お名前</p>
              <span className="font-bold text-slate-800">{order.clientName}</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 mb-1 flex items-center justify-between">
                メールアドレス
                <button onClick={handleCopyEmail} className="text-slate-400 hover:text-slate-600 p-0.5 rounded" title="コピー">
                  <Copy className="w-3 h-3" />
                </button>
              </p>
              <span className="text-sm font-medium text-slate-700 break-all">{order.clientEmail}</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 mb-1">X (Twitter)</p>
              {renderTwitterLink(order.twitterId)}
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 mb-1 flex items-center justify-between">
                Discord ID
                {order.discordId && (
                  <button onClick={() => handleCopyText(order.discordId)} className="text-slate-400 hover:text-slate-600 p-0.5 rounded" title="コピー">
                    <Copy className="w-3 h-3" />
                  </button>
                )}
              </p>
              {renderEditable('discordId', <span className="font-bold text-slate-800">{order.discordId || <span className="text-slate-400 font-normal">未設定</span>}</span>)}
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 mb-1">顧客ステータス</p>
              {order.isRepeater ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">リピーター</span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">新規</span>
              )}
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 mb-1">希望する連絡手段</p>
              <span className="font-bold text-slate-800">{order.contactMethod || <span className="text-slate-400 font-normal">未設定</span>}</span>
            </div>
            <div className="col-span-2 grid grid-cols-2 gap-4 border-t border-slate-100 pt-3 mt-1">
              <div>
                <p className="text-[11px] font-bold text-slate-400 mb-1">受付日時 (作成日時)</p>
                <span className="text-xs font-medium text-slate-600">
                  {order.createdAt ? new Date(order.createdAt).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }) : <span className="text-slate-400">不明</span>}
                </span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 mb-1">最終更新日時</p>
                <span className="text-xs font-medium text-slate-600">
                  {order.updatedAt ? new Date(order.updatedAt).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }) : <span className="text-slate-400">不明</span>}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 右：クイック管理 */}
        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden flex flex-col h-full border-orange-100">
          <div className="bg-orange-50/30 px-5 py-3 border-b border-orange-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
              ⚡ クイック管理
            </h2>
            <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded">クリックで編集</span>
          </div>
          <div className="p-5 grid grid-cols-2 gap-4 flex-1">
            <div>
              <p className="text-[11px] font-bold text-slate-400 mb-1">ステータス</p>
              {renderEditable('status',
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${STATUS_COLORS[order.status] || "bg-slate-100 text-slate-700"}`}>
                  {STATUS_LABELS[order.status] || order.status}
                </span>,
                'select',
                ORDER_STATUS_OPTIONS.map(({ value, label }) => ({ value, label }))
              )}
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 mb-1">お支払い方法</p>
              {renderEditable('paymentMethod',
                <span className="font-bold text-slate-800">{order.paymentMethod ? normalizePaymentMethod(order.paymentMethod) : <span className="text-slate-400 font-normal">未設定</span>}</span>,
                'select',
                order.paymentMethod && !ADMIN_PAYMENT_OPTIONS.some(option => option.value === normalizePaymentMethod(order.paymentMethod!))
                  ? [...ADMIN_PAYMENT_OPTIONS, { value: order.paymentMethod, label: `${order.paymentMethod}（現在の値）` }]
                  : ADMIN_PAYMENT_OPTIONS
              )}
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 mb-1">希望納期</p>
              {renderEditable('deadline', <span className="font-bold text-slate-800">{order.deadline || <span className="text-slate-400 font-normal">未設定</span>}</span>, 'date')}
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 mb-1">合計金額 (円)</p>
              {renderEditable('price', <span className="font-bold text-slate-800">{order.price !== null ? `¥${order.price.toLocaleString()}` : <span className="text-slate-400 font-normal">未設定</span>}</span>, 'number')}
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 mb-1">基本料金 (内訳用)</p>
              {renderEditable('basePrice', <span className="font-bold text-slate-800">{order.basePrice !== null ? `¥${order.basePrice.toLocaleString()}` : <span className="text-slate-400 font-normal">未入力</span>}</span>, 'number')}
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 mb-1">オプション料金 (内訳用)</p>
              {renderEditable('optionPrice', <span className="font-bold text-slate-800">{order.optionPrice !== null ? `¥${order.optionPrice.toLocaleString()}` : <span className="text-slate-400 font-normal">未入力</span>}</span>, 'number')}
            </div>
          </div>
        </div>
      </div>

      {/* ご依頼内容・楽曲情報 */}
      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-slate-50/50 px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
            🎵 ご依頼内容・楽曲情報
          </h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
          <div className="grid grid-cols-[100px_1fr] items-start border-b border-slate-100 pb-2">
            <span className="text-[11px] font-bold text-slate-400 mt-1">サービス種別</span>
            <span className="font-medium text-slate-800">
              {order.serviceType === "MIX" ? "MIX・マスタリング" : order.serviceType === "ORIGINAL" ? "オリジナル楽曲制作" : order.serviceType === "GUIDE" ? "ボーカルガイド作成" : order.serviceType}
            </span>
          </div>
          <div className="grid grid-cols-[100px_1fr] items-start border-b border-slate-100 pb-2">
            <span className="text-[11px] font-bold text-slate-400 mt-1">プラン名</span>
            <span className="font-medium text-slate-800">
              {order.planId || <span className="text-slate-400">指定なし</span>}
            </span>
          </div>
          <div className="grid grid-cols-[100px_1fr] items-start border-b border-slate-100 pb-2">
            <span className="text-[11px] font-bold text-slate-400 mt-1">曲名</span>
            {renderHybridField('songTitle', '曲名')}
          </div>
          <div className="grid grid-cols-[100px_1fr] items-start border-b border-slate-100 pb-2">
            <span className="text-[11px] font-bold text-slate-400 mt-1">歌唱キー</span>
            {renderHybridField('vocalKey', '歌唱キー')}
          </div>

          {order.serviceType === "ORIGINAL" && (
            <>
              <div className="grid grid-cols-[100px_1fr] items-start border-b border-slate-100 pb-2">
                <span className="text-[11px] font-bold text-slate-400 mt-1">希望ジャンル</span>
                {renderHybridField('genre', '希望ジャンル')}
              </div>
              <div className="grid grid-cols-[100px_1fr] items-start border-b border-slate-100 pb-2">
                <span className="text-[11px] font-bold text-slate-400 mt-1">作詞の有無</span>
                {renderHybridField('lyricsStatus', '作詞の有無')}
              </div>
              <div className="grid grid-cols-[100px_1fr] items-start border-b border-slate-100 pb-2">
                <span className="text-[11px] font-bold text-slate-400 mt-1">仮歌の有無</span>
                {renderHybridField('vocalGuideStatus', '仮歌の有無')}
              </div>
            </>
          )}

          <div className="md:col-span-2 grid grid-cols-[100px_1fr] items-start">
            <span className="text-[11px] font-bold text-slate-400 mt-1">オプション</span>
            {renderHybridField('options', 'オプション', 'textarea')}
          </div>
        </div>
      </div>

      {/* 素材・参考URL */}
      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-slate-50/50 px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
            📁 素材・参考URL
          </h2>
        </div>
        <div className="p-6 grid grid-cols-1 gap-5">
          <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] items-start border-b border-slate-100 pb-3">
            <span className="text-[11px] font-bold text-slate-400 mt-1">素材提出URL</span>
            <div className="flex items-start justify-between group">
              {order.materialsUrl ? (
                <a href={order.materialsUrl} target="_blank" rel="noreferrer" className="text-orange-600 hover:text-orange-700 font-medium underline underline-offset-4 break-all">{order.materialsUrl}</a>
              ) : (
                <span className="text-slate-400">未提出</span>
              )}
              {order.materialsUrl && (
                <button onClick={() => handleCopyText(order.materialsUrl)} className="text-slate-300 hover:text-slate-600 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0" title="URLをコピー">
                  <Copy className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] items-start border-b border-slate-100 pb-3">
            <span className="text-[11px] font-bold text-slate-400 mt-1">参考曲URL</span>
            <div className="flex items-start justify-between group">
              {order.referenceUrl ? (
                <a href={order.referenceUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-700 font-medium underline underline-offset-4 break-all">{order.referenceUrl}</a>
              ) : (
                <span className="text-slate-400">なし</span>
              )}
              {order.referenceUrl && (
                <button onClick={() => handleCopyText(order.referenceUrl)} className="text-slate-300 hover:text-slate-600 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0" title="URLをコピー">
                  <Copy className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] items-start">
            <span className="text-[11px] font-bold text-slate-400 mt-1">リファレンス再現度</span>
            <span className="font-medium text-slate-800">
              {order.referenceFidelity === "1" && "1. お任せ"}
              {order.referenceFidelity === "2" && "2. 参考にしつつお任せ"}
              {order.referenceFidelity === "3" && "3. 完全準拠"}
              {!order.referenceFidelity && <span className="text-slate-400">未設定</span>}
            </span>
          </div>
        </div>
      </div>

      {/* ご要望・メッセージ */}
      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-slate-50/50 px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
            💬 ご要望・メッセージ
          </h2>
        </div>
        <div className="p-6">
          {isEditMode ? (
            renderHybridField('message', 'ご要望・メッセージ', 'textarea')
          ) : (
            <div className="text-sm whitespace-pre-wrap leading-relaxed text-slate-700 min-h-[4rem]">
              {order.message || <span className="text-slate-400">メッセージはありません</span>}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
