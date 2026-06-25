"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function FinancePanel({ orderId, initialPrice }: { orderId: string, initialPrice: number | null }) {
  const [price, setPrice] = useState(initialPrice?.toString() || "");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = async () => {
    setIsSaving(true);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: price ? parseInt(price, 10) : null }),
      });

      if (!res.ok) throw new Error("保存に失敗しました");
      
      setMessage("保存しました");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error(error);
      setMessage("エラーが発生しました");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm border-slate-200">
      <div className="flex items-center gap-2 mb-4 border-b pb-4">
        <span className="text-xl">💰</span>
        <h2 className="text-xl font-bold text-slate-800">売上管理 (支払金額)</h2>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          この依頼の最終的な支払金額を入力してください。ここで入力した金額が、売上として確定申告の集計ダッシュボードに反映されます。
        </p>
        
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-slate-700">¥</span>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="例: 15000"
            className="flex-1 border border-slate-300 rounded-lg p-2 font-bold text-lg outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-6 rounded-xl transition-all shadow-md"
        >
          {isSaving ? "保存中..." : "金額を保存する"}
        </Button>

        {message && (
          <div className={`p-3 rounded-xl text-sm font-bold text-center ${message.includes("エラー") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
