"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface OrderData {
  id: string;
  clientName: string;
  serviceType: string;
  songTitle?: string | null;
  options?: string | null;
  vocalKey?: string | null;
  referenceUrl?: string | null;
  referenceFidelity?: string | null;
  message?: string | null;
}

export function AiPostGeneratorPanel({ order }: { order: OrderData }) {
  const [postContent, setPostContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState("");

  const handleGenerate = async () => {
    setIsGenerating(true);
    setMessage("");
    try {
      const res = await fetch("/api/generate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });

      if (!res.ok) throw new Error("APIエラー");
      
      const data = await res.json();
      setPostContent(data.postContent);
    } catch (error) {
      console.error(error);
      setMessage("自動生成に失敗しました。");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!postContent.trim()) return;
    try {
      await navigator.clipboard.writeText(postContent);
      setMessage("✅ クリップボードにコピーしました！そのままX(Twitter)に貼り付けできます。");
      
      // 3秒後にメッセージを消す
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error(error);
      setMessage("コピーに失敗しました。手動でコピーしてください。");
    }
  };

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4 border-b pb-4">
        <span className="text-xl">✨</span>
        <h2 className="text-xl font-bold">SNS用実績ポスト自動生成</h2>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          この依頼の情報を元に、SNSで実績として告知するための文章（良いポイントの解説付き）を自動生成します。
        </p>
        
        <Button 
          onClick={handleGenerate} 
          disabled={isGenerating}
          className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-6 rounded-xl transition-all shadow-md"
        >
          {isGenerating ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              生成中...
            </span>
          ) : "AIで実績文章を自動生成する"}
        </Button>

        {postContent && (
          <div className="pt-4 space-y-4 animate-in fade-in duration-500">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">生成されたポスト内容 (自由に編集できます)</label>
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="w-full h-56 p-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-orange-500 outline-none resize-y text-sm leading-relaxed"
                placeholder="生成されたテキストがここに表示されます"
              />
            </div>
            
            <Button 
              onClick={handleCopy} 
              disabled={!postContent.trim()}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              テキストをコピーする
            </Button>
          </div>
        )}

        {message && (
          <div className={`p-3 rounded-xl text-sm font-bold text-center ${message.includes("失敗") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
