"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "react-hot-toast";

type Order = any; // 簡易的な型定義

const PLAN_LABELS: Record<string, string> = {
  lite: "ライトプラン",
  std: "スタンダードプラン",
  pro: "プロプラン",
};

const PAYMENT_LABELS: Record<string, string> = {
  bank_transfer: "銀行振込",
  credit_card: "クレジットカード",
  paypay: "PayPay",
};

export function OrderDetailEditor({ initialOrder, planDetails }: { initialOrder: Order, planDetails: any }) {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  const formattedDate = new Date(order.createdAt).toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(order.clientEmail);
    toast.success("コピーしました");
  };

  const renderTwitterLink = (twitterId: string | null) => {
    if (!twitterId) return <p className="font-medium text-slate-400">未設定</p>;
    const url = twitterId.startsWith('@') ? `https://x.com/${twitterId.slice(1)}` : `https://x.com/${twitterId}`;
    return (
      <a href={url} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-700 font-medium underline underline-offset-4">
        {twitterId}
      </a>
    );
  };

  const startEditing = (field: string, initialVal: string | null) => {
    setEditingField(field);
    setEditValue(initialVal || "");
  };

  const saveEdit = async () => {
    if (!editingField) return;
    const field = editingField;
    const valueToSave = editValue.trim() === "" ? null : editValue;

    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: valueToSave })
      });
      if (res.ok) {
        setOrder((prev: any) => ({ ...prev, [field]: valueToSave }));
        toast.success("更新しました");
      } else {
        toast.error("更新に失敗しました");
      }
    } catch (error) {
      console.error(`Failed to update ${field}:`, error);
      toast.error("エラーが発生しました");
    } finally {
      setEditingField(null);
    }
  };

  const renderEditable = (field: string, displayValue: string | React.ReactNode, type: 'text' | 'textarea' | 'select' = 'text', options?: {value: string, label: string}[]) => {
    if (editingField === field) {
      return (
        <div className="flex gap-2 items-start mt-1">
          {type === 'textarea' ? (
            <textarea 
              autoFocus
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              className="w-full border border-slate-300 rounded p-2 text-sm outline-none focus:ring-2 focus:ring-orange-500 min-h-[100px]"
            />
          ) : type === 'select' ? (
            <select
              autoFocus
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              className="w-full border border-slate-300 rounded p-2 text-sm outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">未設定</option>
              {options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          ) : (
            <input 
              type="text"
              autoFocus
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              onKeyDown={e => { if(e.key === 'Enter') saveEdit(); }}
              className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-orange-500"
            />
          )}
          <div className="flex flex-col gap-1 shrink-0">
            <button onClick={saveEdit} className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded hover:bg-orange-600">保存</button>
            <button onClick={() => setEditingField(null)} className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded hover:bg-slate-200">ｷｬﾝｾﾙ</button>
          </div>
        </div>
      );
    }

    return (
      <div 
        onClick={() => startEditing(field, order[field])} 
        className="cursor-text hover:bg-slate-50 p-1 -mx-1 rounded transition-colors group relative min-h-[28px] border border-transparent hover:border-slate-200 border-dashed"
      >
        {displayValue}
      </div>
    );
  };

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm space-y-8">
      
      <section>
        <h2 className="text-xl font-bold border-b pb-2 mb-4 text-slate-800 flex items-center gap-2">
          <span className="text-orange-500">👤</span> 基本情報
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-4 rounded-lg">
          <div>
            <p className="text-xs text-slate-500 font-bold mb-1">お名前</p>
            {renderEditable('clientName', <p className="font-semibold text-lg text-slate-900">{order.clientName}</p>)}
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold mb-1">メールアドレス</p>
            <div className="flex items-center gap-2">
              {renderEditable('clientEmail', <p className="font-medium text-slate-700 break-all">{order.clientEmail}</p>)}
              <button onClick={handleCopyEmail} className="p-1.5 hover:bg-slate-200 rounded text-slate-500 transition-colors shrink-0" title="コピー">
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold mb-1">X（Twitter）ID</p>
            {renderEditable('twitterId', renderTwitterLink(order.twitterId))}
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold mb-1">希望連絡手段</p>
            {renderEditable('contactMethod', <p className="font-medium text-slate-700">{order.contactMethod || <span className="text-slate-400 font-normal">未設定</span>}</p>)}
          </div>
          <div className="md:col-span-2">
            <p className="text-xs text-slate-500 font-bold mb-1">顧客ステータス</p>
            {order.isRepeater ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                リピーター（依頼経験あり）
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                新規のお客様
              </span>
            )}
            <p className="text-[10px] text-slate-400 mt-1">※情報編集時に再計算されます</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold border-b pb-2 mb-4 text-slate-800 flex items-center gap-2">
          <span className="text-orange-500">🎵</span> ご依頼内容・楽曲情報
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-slate-500 font-bold mb-1">サービス種別</p>
            {renderEditable('serviceType', 
              <p className="font-semibold text-slate-900">{order.serviceType === "mix" ? "ボーカルMIX" : "オリジナル楽曲制作"}</p>,
              'select',
              [{value: 'mix', label: 'ボーカルMIX'}, {value: 'original', label: 'オリジナル楽曲制作'}]
            )}
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold mb-1">選択プラン</p>
            {renderEditable('planId', 
              <div className="font-semibold text-slate-900">
                {order.planId ? (planDetails?.name || PLAN_LABELS[order.planId] || order.planId) : <span className="text-slate-400 font-normal">指定なし</span>}
              </div>
            )}
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold mb-1">曲名</p>
            {renderEditable('songTitle', <p className="font-medium text-slate-700">{order.songTitle || <span className="text-slate-400 font-normal">未設定</span>}</p>)}
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold mb-1">歌唱キー</p>
            {renderEditable('vocalKey', <p className="font-medium text-slate-700">{order.vocalKey || <span className="text-slate-400 font-normal">未設定</span>}</p>)}
          </div>
          
          {order.serviceType === "original" && (
            <>
              <div>
                <p className="text-xs text-slate-500 font-bold mb-1">希望ジャンル</p>
                {renderEditable('genre', <p className="font-medium text-slate-700">{order.genre || <span className="text-slate-400 font-normal">未設定</span>}</p>)}
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold mb-1">作詞の有無</p>
                {renderEditable('lyricsStatus', <p className="font-medium text-slate-700">{order.lyricsStatus || <span className="text-slate-400 font-normal">未設定</span>}</p>)}
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold mb-1">仮歌の有無</p>
                {renderEditable('vocalGuideStatus', <p className="font-medium text-slate-700">{order.vocalGuideStatus || <span className="text-slate-400 font-normal">未設定</span>}</p>)}
              </div>
            </>
          )}
          
          <div className="md:col-span-2">
            <p className="text-xs text-slate-500 font-bold mb-1">オプション</p>
            {renderEditable('options', <p className="font-medium text-slate-700">{order.options || <span className="text-slate-400 font-normal">なし</span>}</p>, 'textarea')}
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold border-b pb-2 mb-4 text-slate-800 flex items-center gap-2">
          <span className="text-orange-500">📁</span> 素材・リファレンス
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <p className="text-xs text-slate-500 font-bold mb-1">素材提出URL</p>
            {renderEditable('materialsUrl', 
              order.materialsUrl ? (
                <a href={order.materialsUrl} target="_blank" rel="noreferrer" className="text-orange-600 hover:text-orange-700 font-medium underline underline-offset-4 break-all">{order.materialsUrl}</a>
              ) : (
                <p className="font-medium text-slate-400">未提出</p>
              )
            )}
          </div>
          <div className="md:col-span-2">
            <p className="text-xs text-slate-500 font-bold mb-1">参考曲URL</p>
            {renderEditable('referenceUrl', 
              order.referenceUrl ? (
                <a href={order.referenceUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-700 font-medium underline underline-offset-4 break-all">{order.referenceUrl}</a>
              ) : (
                <p className="font-medium text-slate-400">なし</p>
              )
            )}
          </div>
          <div className="md:col-span-2">
            <p className="text-xs text-slate-500 font-bold mb-1">リファレンス再現度</p>
            {renderEditable('referenceFidelity', 
              <p className="font-medium text-slate-700">
                {order.referenceFidelity === "1" && "1. お任せ"}
                {order.referenceFidelity === "2" && "2. 参考にしつつお任せ"}
                {order.referenceFidelity === "3" && "3. 完全準拠"}
                {!order.referenceFidelity && "未設定"}
              </p>,
              'select',
              [{value: '1', label: '1. お任せ'}, {value: '2', label: '2. 参考にしつつお任せ'}, {value: '3', label: '3. 完全準拠'}]
            )}
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold border-b pb-2 mb-4 text-slate-800 flex items-center gap-2">
          <span className="text-orange-500">💬</span> お支払い・ご要望
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-slate-500 font-bold mb-1">お支払い方法</p>
            {renderEditable('paymentMethod', 
              <p className="font-semibold text-slate-900">{order.paymentMethod ? (PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod) : <span className="text-slate-400 font-normal">未設定</span>}</p>,
              'select',
              [{value: 'bank_transfer', label: '銀行振込'}, {value: 'credit_card', label: 'クレジットカード'}, {value: 'paypay', label: 'PayPay'}]
            )}
          </div>
          <div className="md:col-span-2">
            <p className="text-xs text-slate-500 font-bold mb-2">ご要望・メッセージ</p>
            {renderEditable('message', 
              <div className="bg-slate-50 p-4 rounded-lg border text-sm whitespace-pre-wrap leading-relaxed text-slate-700">
                {order.message || <span className="text-slate-400">メッセージはありません</span>}
              </div>,
              'textarea'
            )}
          </div>
        </div>
      </section>

      <div className="pt-4 border-t text-right flex justify-between items-center">
        <p className="text-xs text-slate-400 text-left">※納期と金額の管理は<br/>一覧画面から行えます</p>
        <p className="text-sm font-medium text-slate-400">受付日時: {formattedDate}</p>
      </div>
    </div>
  );
}
