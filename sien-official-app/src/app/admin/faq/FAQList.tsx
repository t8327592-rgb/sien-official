"use client";
import type { FAQ } from "@prisma/client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { createFAQ, deleteFAQ } from "@/app/actions/cms";
import toast from "react-hot-toast";

export function FAQList({ initialFaqs }: { initialFaqs: FAQ[] }) {
  const [faqs, setFaqs] = useState(initialFaqs);
  const [isAdding, setIsAdding] = useState(false);
  const [newFaq, setNewFaq] = useState({ question: "", answer: "", category: "COMMON", orderIndex: 0 });

  const [busy, setBusy] = useState(false);
  const saving = useRef(false);

  const handleAdd = async () => {
    if (saving.current) return;
    if (!newFaq.question || !newFaq.answer) {
      toast.error("質問と回答を入力してください");
      return;
    }
    saving.current = true; setBusy(true);
    try {
      const res = await createFAQ(newFaq);
      setFaqs([...faqs, res.data]);
      setIsAdding(false);
      setNewFaq({ question: "", answer: "", category: "COMMON", orderIndex: 0 });
      toast.success("追加しました");
    } catch {
      toast.error("保存できませんでした。入力内容と接続状態を確認してください。");
    } finally { saving.current = false; setBusy(false); }
  };

  const handleDelete = async (id: string) => {
    if (saving.current || !confirm("削除しますか？")) return;
    saving.current = true; setBusy(true);
    try {
      await deleteFAQ(id);
      setFaqs(faqs.filter(f => f.id !== id));
      toast.success("削除しました");
    } catch {
      toast.error("保存できませんでした。入力内容と接続状態を確認してください。");
    } finally { saving.current = false; setBusy(false); }
  };

  return (
    <div className="space-y-6">
      {/* 新規追加フォーム */}
      <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
        <h2 className="text-lg font-bold">
          <button type="button" aria-expanded={isAdding} className="w-full flex justify-between items-center text-left" onClick={() => setIsAdding(!isAdding)}>＋ 新規追加</button>
        </h2>
        {isAdding && (
          <div className="space-y-4 pt-4 border-t mt-4">
            <input type="text" aria-label="質問 (Q)" placeholder="質問 (Q)" className="w-full border p-2 rounded" value={newFaq.question} onChange={e => setNewFaq({...newFaq, question: e.target.value})} />
            <textarea aria-label="回答 (A)" placeholder="回答 (A)" className="w-full border p-2 rounded h-24" value={newFaq.answer} onChange={e => setNewFaq({...newFaq, answer: e.target.value})} />
            <div className="flex gap-4">
              <select aria-label="カテゴリ" className="border p-2 rounded" value={newFaq.category} onChange={e => setNewFaq({...newFaq, category: e.target.value})}>
                <option value="COMMON">共通</option>
                <option value="MIX">MIX</option>
                <option value="ORIGINAL">オリジナル楽曲</option>
              </select>
              <Button disabled={busy} onClick={handleAdd}>追加する</Button>
            </div>
          </div>
        )}
      </div>

      {/* 一覧 */}
      <div className="space-y-4">
        {faqs.map((faq) => (
          <div key={faq.id} className="bg-white p-6 rounded-2xl border shadow-sm">
            <div className="flex justify-between">
              <div className="space-y-2 w-full pr-4">
                <div className="font-bold text-lg">Q. {faq.question}</div>
                <div className="text-slate-600 whitespace-pre-wrap">A. {faq.answer}</div>
                <div className="text-xs text-slate-400 mt-2">カテゴリ: {faq.category}</div>
              </div>
              <div>
                <Button variant="destructive" size="sm" disabled={busy} onClick={() => handleDelete(faq.id)}>削除</Button>
              </div>
            </div>
          </div>
        ))}
        {faqs.length === 0 && <p className="text-slate-500">FAQがありません</p>}
      </div>
    </div>
  );
}
