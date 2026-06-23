"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface OrderData {
  clientName: string;
  clientEmail: string;
  twitterId: string | null;
  contactMethod: string | null;
  isRepeater: boolean;
  serviceType: string;
  planId: string | null;
  songTitle: string | null;
  options: string | null;
  vocalKey: string | null;
  referenceUrl: string | null;
  referenceFidelity: string | null;
  materialsUrl: string | null;
  paymentMethod: string | null;
  deadline: string | null;
  message: string | null;
}

export function AiReplyPanel({ order }: { order: OrderData }) {
  const [replyText, setReplyText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/generate-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });

      if (!res.ok) {
        throw new Error("APIレスポンスエラー");
      }

      const data = await res.json();
      setReplyText(data.reply);
    } catch (err) {
      console.error(err);
      setError("返信文の生成に失敗しました。APIキーや設定を確認してください。");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(replyText);
    alert("クリップボードにコピーしました！");
  };

  return (
    <div className="rounded-xl border bg-gradient-to-b from-orange-50 to-white p-6 shadow-sm border-orange-100">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
        </div>
        <h2 className="text-lg font-bold text-orange-900">AI 返信アシスト (Gemini)</h2>
      </div>
      
      <p className="text-sm text-slate-600 mb-6">
        お客様からのご要望を解析し、最適な返信メールの下書きや見積もりを自動生成します。
      </p>
      
      <Button 
        onClick={handleGenerate} 
        disabled={isGenerating}
        className="w-full bg-orange-600 hover:bg-orange-700 shadow-md flex items-center justify-center gap-2 h-12 text-md"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.21 1.21 0 0 0 0-1.72Z"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H5"/><path d="M14 20h2"/><path d="M17 16h2"/></svg>
        {isGenerating ? "生成中..." : "AIで返信文を生成する"}
      </Button>

      {error && (
        <p className="text-sm text-red-500 mt-4 bg-red-50 p-3 rounded-md">{error}</p>
      )}

      <div className="mt-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">生成された返信文</label>
        <textarea 
          className="w-full h-64 p-3 text-sm border rounded-lg bg-white focus:ring-2 focus:ring-orange-500 outline-none" 
          placeholder="ここにAIが作成した返信文が表示されます..."
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
        />
        <Button 
          variant="outline" 
          className="w-full mt-2" 
          disabled={!replyText}
          onClick={handleCopy}
        >
          テキストをコピー
        </Button>
      </div>
    </div>
  );
}
