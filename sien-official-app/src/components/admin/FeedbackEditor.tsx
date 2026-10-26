"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { buildCodexFeedbackRequest, feedbackClientName, type FeedbackMemo } from "@/lib/feedback";

const fieldClass = "w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-600 disabled:bg-slate-100";
const cardClass = "rounded-2xl border border-orange-100 bg-white p-5 md:p-7 space-y-5";

type OrderIdentity = { id: string; clientName: string; songTitle: string | null };

export function FeedbackEditor({ order, initialMemo, initialVersion, previous }: {
  order: OrderIdentity; initialMemo: FeedbackMemo; initialVersion: number; previous: string;
}) {
  const [memo, setMemo] = useState(initialMemo);
  const [version, setVersion] = useState(initialVersion);
  const [saved, setSaved] = useState(JSON.stringify(initialMemo));
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [fallback, setFallback] = useState("");
  const dirty = saved !== JSON.stringify(memo);

  useEffect(() => {
    if (!dirty) return;
    const preventLoss = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    const preventNavigation = (event: MouseEvent) => {
      const anchor = event.target instanceof Element ? event.target.closest("a") : null;
      if (anchor && anchor.target !== "_blank" && anchor.href !== window.location.href && !window.confirm("未保存のメモがあります。保存せずに移動しますか？")) { event.preventDefault(); event.stopPropagation(); }
    };
    window.addEventListener("beforeunload", preventLoss);
    document.addEventListener("click", preventNavigation, true);
    return () => { window.removeEventListener("beforeunload", preventLoss); document.removeEventListener("click", preventNavigation, true); };
  }, [dirty]);

  function edit(patch: Partial<FeedbackMemo>) {
    setMemo(old => ({ ...old, ...patch })); setMessage(""); setError(""); setFallback("");
  }

  async function copyToCodex() {
    if (lock.current) return;
    if (!memo.memo.trim()) { setError("先に気づいたことをメモしてください。"); return; }
    lock.current = true; setBusy(true); setError(""); setMessage(""); setFallback("");
    let copied = false;
    const text = buildCodexFeedbackRequest(order, memo, previous);
    try {
      try { await navigator.clipboard.writeText(text); copied = true; }
      catch { setFallback(text); }
      if (dirty || version === 0) {
        const response = await fetch(`/api/admin/orders/${encodeURIComponent(order.id)}/feedback`, {
          method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...memo, version }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "メモを保存できませんでした。");
        setVersion(result.version); setSaved(JSON.stringify(memo));
      }
      setMessage(copied ? "コピーしました。Codexのチャットに貼り付けてください。メモも保存しました。" : "メモを保存しました。自動コピーができないため、下の依頼文を選択してコピーしてください。");
    } catch (failure) {
      if (copied) setMessage("Codex用の依頼文はコピーできています。");
      setError((failure instanceof Error ? failure.message : "メモの保存に失敗しました。") + " 入力したメモは画面に残っています。");
    } finally { lock.current = false; setBusy(false); }
  }

  return <div className="space-y-6">
    <section className={cardClass} aria-label="依頼から引き継いだ情報">
      <div className="flex flex-wrap items-start justify-between gap-5"><Image src="/logo.png" width={851} height={200} alt="SIEN.OFFICIAL" className="w-40 h-auto" /><div className="flex flex-wrap gap-6 text-sm"><div><span className="text-slate-500">クライアント名</span><p className="font-bold mt-1 break-words">{feedbackClientName(order.clientName)}</p></div><div><span className="text-slate-500">楽曲名</span><p className="font-bold mt-1 break-words">{order.songTitle || "未設定（依頼詳細から設定できます）"}</p></div></div></div>
      <p className="text-xs text-slate-500">お名前・楽曲名は、コピーする依頼文に自動で入ります。</p>
    </section>

    <fieldset disabled={busy} className={`${cardClass} min-w-0`}>
      <div><h2 className="text-xl font-extrabold">気づいたことをメモ</h2><p className="text-sm text-slate-500 mt-2">順番や分類は気にせず、箇条書き・短い単語で書いてください。</p></div>
      <label className="block space-y-2"><span className="text-sm font-bold">箇条書きメモ</span><textarea rows={9} maxLength={6000} value={memo.memo} onChange={event => edit({ memo: event.target.value })} className={fieldClass} placeholder={'・ノイズ目立つ、無音部分\n・サビ入りの音程低め\n・語尾きれい\n・部屋鳴りちょっとある\n・抑揚はいい'} /><span className="text-xs text-slate-500">{memo.memo.length} / 6000文字</span></label>
      <label className="block space-y-2 sm:max-w-sm"><span className="text-sm font-bold">前回との比較</span><select value={memo.comparison} onChange={event => edit({ comparison: event.target.value as FeedbackMemo["comparison"] })} className={fieldClass}><option value="first">今回が初回（比較は含めない）</option><option value="compare">前回と比較する</option><option value="skip">今回は比較しない</option></select></label>
      {memo.comparison === "compare" && <div className="rounded-xl bg-orange-50 p-4 text-sm">{previous ? <details><summary className="cursor-pointer font-bold">コピーに含める前回のフィードバック</summary><p className="whitespace-pre-wrap mt-3 text-slate-600">{previous}</p></details> : <p>過去のフィードバック記録はありません。比較したい場合は、前回の状態と今回の変化をメモに追記してください。</p>}</div>}
      <button type="button" onClick={() => void copyToCodex()} className="rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-6 py-3 text-sm font-bold text-white hover:from-orange-700 hover:to-amber-600 disabled:opacity-50">{busy ? "コピー・保存中…" : "Codex用にメモをコピー"}</button>
      <p className="text-xs text-slate-500" role="status">{dirty ? "コピーするとメモが保存されます。" : version ? "メモは保存済みです。" : "メモはコピー時に保存されます。"}</p>
    </fieldset>
    {message && <p role="status" className="rounded-xl bg-orange-50 p-4 text-sm text-orange-950">{message}</p>}
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
    {fallback && <label className="block space-y-2"><span className="text-sm font-bold">Codex用の依頼文（選択してコピーしてください）</span><textarea aria-label="Codex用の依頼文" readOnly value={fallback} rows={9} onFocus={event => event.target.select()} className={fieldClass} /></label>}
    <p className="text-sm leading-7 text-slate-600"><strong className="text-orange-800">コピー → Codexのチャットに貼り付ける → PDFを受け取る</strong><br />文章の整理と固定デザインのPDF作成は、Codexにお任せください。</p>
  </div>;
}
