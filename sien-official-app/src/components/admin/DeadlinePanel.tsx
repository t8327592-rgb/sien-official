"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function DeadlinePanel({ orderId, initialDeadline, clientName, songTitle }: { orderId: string, initialDeadline: string | null, clientName: string, songTitle: string | null }) {
  const [deadline, setDeadline] = useState(initialDeadline || "");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = async () => {
    setIsSaving(true);
    setMessage("");
    try {
      // DBに保存
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deadline }),
      });

      if (!res.ok) throw new Error("保存に失敗しました");
      
      // (将来拡張用) Google Calendar API へ同期
      // await fetch("/api/admin/calendar/sync", { ... })

      setMessage("保存しました！");
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
        <span className="text-xl">📅</span>
        <h2 className="text-xl font-bold text-slate-800">納期管理・カレンダー連携</h2>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          この依頼の納品予定日（デッドライン）を設定します。
        </p>
        
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">納品予定日</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full border border-slate-300 rounded-lg p-2 font-medium outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
        >
          {isSaving ? "保存中..." : "納期を保存してカレンダーに登録"}
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
