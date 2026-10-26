"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { FEEDBACK_ITEMS, FEEDBACK_RATINGS, feedbackClientName, feedbackExportErrors, buildCodexFeedbackRequest, type FeedbackContent, type FeedbackKey, type FeedbackRating } from "@/lib/feedback";
import type { FeedbackIdentity } from "@/lib/feedback-pdf";

const fieldClass = "w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-600 disabled:bg-slate-100";
const cardClass = "rounded-2xl border border-orange-100 bg-white p-5 md:p-7 space-y-5";
const buttonClass = "rounded-full border border-slate-200 px-4 py-2.5 text-sm font-bold hover:bg-orange-50 disabled:opacity-50";
const mainButtonClass = "rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-5 py-2.5 text-sm font-bold text-white hover:from-orange-700 hover:to-amber-600 disabled:opacity-50";

export function FeedbackEditor({ order, initialContent, initialVersion, previous }: {
  order: FeedbackIdentity; initialContent: FeedbackContent; initialVersion: number; previous: string;
}) {
  const [content, setContent] = useState(initialContent);
  const [version, setVersion] = useState(initialVersion);
  const [saved, setSaved] = useState(JSON.stringify(initialContent));
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [preview, setPreview] = useState(false);
  const [showEditor, setShowEditor] = useState(Boolean(initialContent.summary));
  const dirty = saved !== JSON.stringify(content);
  const endpoint = `/api/admin/orders/${encodeURIComponent(order.id)}/feedback`;

  useEffect(() => {
    if (!dirty) return;
    const preventLoss = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    const preventNavigation = (event: MouseEvent) => {
      const anchor = event.target instanceof Element ? event.target.closest("a") : null;
      if (anchor && anchor.target !== "_blank" && anchor.href !== window.location.href && !window.confirm("未保存の変更があります。保存せずに移動しますか？")) { event.preventDefault(); event.stopPropagation(); }
    };
    window.addEventListener("beforeunload", preventLoss);
    document.addEventListener("click", preventNavigation, true);
    return () => { window.removeEventListener("beforeunload", preventLoss); document.removeEventListener("click", preventNavigation, true); };
  }, [dirty]);

  function edit(patch: Partial<FeedbackContent>) {
    setContent(old => ({ ...old, ...patch, reviewed: false }));
    setMessage("");
  }
  function updateItem(key: FeedbackKey, patch: { rating?: FeedbackRating; comment?: string }) {
    edit({ items: { ...content.items, [key]: { ...content.items[key], ...patch } } });
  }
  async function saveSnapshot() {
    const response = await fetch(endpoint, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content, version }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "保存できませんでした。");
    setVersion(result.version); setSaved(JSON.stringify(content));
  }
  async function run(action: "save" | "download") {
    if (lock.current) return;
    setErrors([]); setMessage("");
    if (action === "download") {
      const missing = feedbackExportErrors(content);
      if (missing.length) { setErrors(missing); return; }
    }
    lock.current = true; setBusy(true);
    try {
      if (dirty || version === 0) await saveSnapshot();
      if (action === "save") { setMessage("下書きを保存しました。"); return; }
      const response = await fetch(endpoint, { cache: "no-store" });
      if (!response.ok) { const result = await response.json(); throw new Error(result.error || "PDFを作成できませんでした。"); }
      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a"); anchor.href = url;
      anchor.download = `フィードバック_${(order.songTitle || "楽曲名未設定").replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_")}.pdf`;
      document.body.appendChild(anchor); anchor.click(); anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      setMessage("確認済みの内容でPDFを作成しました。");
    } catch (error) { setErrors([error instanceof Error ? error.message : "処理に失敗しました。入力内容は画面に残っています。"]); }
    finally { lock.current = false; setBusy(false); }
  }
  async function copyToCodex() {
    if (!content.memo.trim()) { setErrors(["先に気づいたことをメモしてください。"]); return; }
    try {
      await navigator.clipboard.writeText(buildCodexFeedbackRequest(order, content, previous));
      setErrors([]); setMessage("Codex用の依頼文をコピーしました。Codexに貼り付けると、文章整理から固定デザインのPDF作成まで依頼できます。");
    } catch { setErrors(["コピーできませんでした。ブラウザーのクリップボード設定を確認してください。"]); }
  }
  function textArea(field: "summary" | "strengths" | "changes" | "closing", label: string, hint: string, max = 1200) {
    return <label className="block space-y-2"><span className="font-bold text-sm text-slate-800">{label}</span><textarea className={fieldClass} rows={3} value={content[field]} maxLength={max} placeholder={hint} onChange={event => edit({ [field]: event.target.value })} /><span className="block text-xs text-slate-500">{content[field].length} / {max}文字</span></label>;
  }

  return <div className="space-y-6">
    <section className={cardClass} aria-label="依頼から引き継いだ情報">
      <div className="flex flex-wrap items-start justify-between gap-5"><Image src="/logo.png" width={851} height={200} alt="SIEN.OFFICIAL" className="w-40 h-auto" /><div className="flex flex-wrap gap-6 text-sm"><div><span className="text-slate-500">クライアント名</span><p className="font-bold mt-1 break-words">{feedbackClientName(order.clientName)}</p></div><div><span className="text-slate-500">楽曲名</span><p className="font-bold mt-1 break-words">{order.songTitle || "未設定（依頼詳細から設定できます）"}</p></div></div></div>
      <p className="text-xs text-slate-500">お名前・楽曲名は依頼情報から自動で引き継ぎます。</p>
    </section>

    <fieldset disabled={busy} className={`${cardClass} min-w-0`}>
      <div><p className="text-xs font-bold tracking-widest text-orange-700">STEP 1 / MEMO</p><h2 className="text-xl font-extrabold mt-2">聴きながら、気づいたことをメモ</h2><p className="text-sm text-slate-500 mt-2">順番や分類は気にせず、箇条書き・短い単語で書いてください。「Codex用にメモをコピー」で依頼文をコピーし、Codexへ貼り付けてください。</p></div>
      <label className="block space-y-2"><span className="text-sm font-bold">箇条書きメモ（管理用・PDFには載りません）</span><textarea rows={8} maxLength={6000} value={content.memo} onChange={event => { edit({ memo: event.target.value }); }} className={fieldClass} placeholder={'・ノイズ目立つ、無音部分\n・サビ入りの音程低め\n・語尾きれい\n・部屋鳴りちょっとある\n・抑揚はいい'} /><span className="text-xs text-slate-500">{content.memo.length} / 6000文字</span></label>
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="space-y-2"><span className="text-sm font-bold">発行日</span><input type="date" required value={content.date} onChange={event => { edit({ date: event.target.value }); }} className={fieldClass} /></label>
        <label className="space-y-2"><span className="text-sm font-bold">前回との比較</span><select value={content.comparison} onChange={event => { edit({ comparison: event.target.value as FeedbackContent["comparison"] }); }} className={fieldClass}><option value="first">今回が初回（比較は掲載しない）</option><option value="compare">前回と比較する</option><option value="skip">今回は比較しない</option></select></label>
      </div>
      {content.comparison === "compare" && <div className="rounded-xl bg-orange-50 p-4 text-sm">{previous ? <details><summary className="cursor-pointer font-bold">前回のフィードバックを参考にする</summary><p className="whitespace-pre-wrap mt-3 text-slate-600">{previous}</p></details> : <p>過去のフィードバック記録はありません。比較したい場合は、メモに前回の状態と今回の変化を書いてください。根拠がない比較は作成しません。</p>}</div>}
      <div className="flex flex-wrap gap-3"><button type="button" onClick={() => void copyToCodex()} className={mainButtonClass}>Codex用にメモをコピー</button><button type="button" onClick={() => setShowEditor(!showEditor)} className={buttonClass}>{showEditor ? "項目別編集を閉じる" : "手入力・項目別編集を開く"}</button></div>
      <p className="text-xs text-slate-500">お名前・楽曲名・メモと固定PDFの作成指示をコピーします。前回比較を選んだ場合は前回本文も含みます。このサイトからAI APIを呼び出すことはありません。</p>
    </fieldset>

    <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-orange-100 bg-white/95 p-4 shadow-sm">
      <p className="text-sm text-slate-600" role="status">{busy ? "処理中…" : dirty ? "未保存の変更があります" : version ? "保存済み" : "新規作成"}</p>
      <div className="flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={() => setPreview(!preview)} className={buttonClass}>{preview ? "入力に戻る" : "内容プレビュー"}</button><button type="button" disabled={busy} onClick={() => void run("save")} className={buttonClass}>下書き保存</button><button type="button" disabled={busy} onClick={() => void run("download")} className={mainButtonClass}>保存してPDFダウンロード</button></div>
    </div>
    {message && <p role="status" className="rounded-xl bg-orange-50 p-4 text-sm text-orange-950">{message}</p>}
    {errors.length > 0 && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><p className="font-bold mb-2">内容を確認してください</p><ul className="list-disc pl-5 space-y-1">{errors.map((error, index) => <li key={index} className="whitespace-pre-line">{error}</li>)}</ul></div>}

    {preview ? <FeedbackPreview order={order} content={content} /> : showEditor && <fieldset disabled={busy} className="space-y-6 min-w-0">
      <section className={cardClass}><p className="text-xs tracking-widest font-bold text-orange-700">REVIEW & EDIT</p><h2 className="font-bold text-lg">総評・よかったところ</h2>{textArea("summary", "今回の総評", "メモから伝えたいことをまとめます。")}{textArea("strengths", "よかったところ（任意）", "根拠のある長所だけを書きます。なければ空欄で構いません。")}</section>
      {content.aiQuestions.length > 0 && <section className={cardClass}><h2 className="font-bold">確認事項（管理用・PDFには載りません）</h2><ul className="list-disc pl-5 text-sm space-y-2">{content.aiQuestions.map((q, i) => <li key={i}>{q}</li>)}</ul><p className="text-xs text-slate-500">必要な内容をメモに追記してCodexへ渡すか、下の文章を直接修正してください。</p></section>}
      {([ ["recording", "録音状態"], ["vocal", "歌唱について"] ] as const).map(([group, title]) => <section key={group} className={cardClass}>
        <h2 className="font-bold text-lg">{title}</h2><p className="text-xs text-slate-500">今回の音源について評価・文章を確認してください。メモにない項目は「確認対象外」です。</p>
        {FEEDBACK_ITEMS.filter(item => item.group === group).map(({ key, label }) => <div key={key} className="border-t border-orange-100 pt-5 space-y-3"><label className="flex flex-wrap items-center justify-between gap-2"><span className="text-sm font-bold">{label}</span><select aria-label={`${label}の評価`} value={content.items[key].rating} onChange={event => updateItem(key, { rating: event.target.value as FeedbackRating })} className={`${fieldClass} sm:max-w-52`}>{FEEDBACK_RATINGS.map(rating => <option key={rating}>{rating}</option>)}</select></label><textarea aria-label={`${label}のコメント`} rows={2} maxLength={600} value={content.items[key].comment} onChange={event => updateItem(key, { comment: event.target.value })} placeholder="気づいたこと、具体的な箇所など" className={fieldClass} /></div>)}
      </section>)}
      <section className={cardClass}><h2 className="font-bold text-lg">次回の優先ポイント（最大３つ）</h2><p className="text-xs text-slate-500">改善方法も確認・修正してください。使わない欄は空欄にします。</p>
        {content.priorities.map((point, index) => <div key={index} className="rounded-xl bg-orange-50/60 p-4 space-y-3"><h3 className="font-bold text-sm">改善ポイント {index + 1}</h3>{([ ["title", "見出し", 100], ["observation", "気になった箇所・状態", 600], ["action", "次回の具体的な試し方", 600] ] as const).map(([key, label, max]) => <label key={key} className="block space-y-1"><span className="text-xs font-semibold text-slate-600">{label}</span><textarea rows={key === "title" ? 1 : 2} maxLength={max} value={point[key]} className={fieldClass} onChange={event => edit({ priorities: content.priorities.map((value, position) => position === index ? { ...value, [key]: event.target.value } : value) })} /></label>)}</div>)}
      </section>
      <section className={cardClass}><h2 className="font-bold text-lg">{content.comparison === "compare" ? "前回からの変化・最後に" : "最後に"}</h2>{content.comparison === "compare" && textArea("changes", "前回からの変化（任意）", "確認できる変化がある場合だけ記載します。")}{textArea("closing", "最後に（任意）", "次回の録音につながる一言。", 600)}</section>
    </fieldset>}
    <section className={`${cardClass} border-orange-200`}>
      <label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" disabled={busy} checked={content.reviewed} onChange={event => setContent(old => ({ ...old, reviewed: event.target.checked }))} className="mt-1 h-5 w-5 accent-orange-600" /><span><span className="font-bold block">内容を確認・修正しました</span><span className="text-sm text-slate-500 block mt-1">評価・文章・改善方法を確認してからPDFにします。編集すると確認チェックは外れます。</span></span></label>
    </section>
    <p className="text-xs text-slate-500">下書きは依頼に紐づけて保存されます。初回・比較しない場合は比較欄をPDFに載せません。文章量に応じて自動改ページします。</p>
  </div>;
}

function FeedbackPreview({ order, content }: { order: FeedbackIdentity; content: FeedbackContent }) {
  const paragraph = (value: string) => <p className="whitespace-pre-wrap break-words text-sm leading-7">{value || "（未入力）"}</p>;
  return <article aria-label="フィードバック内容プレビュー" className="rounded-xl border border-orange-100 bg-white p-6 md:p-10 space-y-7 text-slate-900">
    <header className="border-b-4 border-orange-500 pb-6 space-y-3"><Image src="/logo.png" width={851} height={200} alt="SIEN.OFFICIAL" className="w-44 h-auto" /><p className="text-xs tracking-widest text-orange-700">RECORDING & VOCAL FEEDBACK</p><h2 className="text-2xl font-extrabold">録音・歌唱フィードバック</h2><p className="text-sm break-words">{feedbackClientName(order.clientName)} ／ {order.songTitle || "楽曲名未設定"}</p><p className="text-xs text-slate-500">発行日：{content.date}</p></header>
    <section className="space-y-2"><h3 className="font-bold border-l-4 border-orange-500 pl-3">今回の総評</h3>{paragraph(content.summary)}</section>
    {content.strengths.trim() && <section className="space-y-2"><h3 className="font-bold border-l-4 border-orange-500 pl-3">よかったところ</h3>{paragraph(content.strengths)}</section>}
    {([ ["recording", "録音状態"], ["vocal", "歌唱について"] ] as const).map(([group, title]) => <section key={group} className="space-y-3"><h3 className="font-bold border-l-4 border-orange-500 pl-3">{title}</h3>{FEEDBACK_ITEMS.filter(item => item.group === group).map(({ key, label }) => <div key={key} className="rounded-xl bg-orange-50/70 p-4 space-y-2"><div className="flex flex-wrap justify-between gap-2 text-sm"><strong>{label}</strong><span className="text-orange-800">{content.items[key].rating}</span></div>{paragraph(content.items[key].comment || (content.items[key].rating === "確認対象外" ? "今回の確認対象外です。" : ""))}</div>)}</section>)}
    {content.priorities.some(point => point.title || point.observation || point.action) && <section className="space-y-4"><h3 className="font-bold border-l-4 border-orange-500 pl-3">次回の優先ポイント</h3>{content.priorities.filter(point => point.title || point.observation || point.action).map((point, index) => <div key={index} className="space-y-2"><h4 className="font-bold break-words text-orange-800">{index + 1}. {point.title}</h4>{paragraph(point.observation)}{paragraph(`次回の試し方：${point.action}`)}</div>)}</section>}
    {content.comparison === "compare" && content.changes.trim() && <section className="space-y-2"><h3 className="font-bold border-l-4 border-orange-500 pl-3">前回からの変化</h3>{paragraph(content.changes)}</section>}
    {content.closing.trim() && <section className="space-y-2"><h3 className="font-bold border-l-4 border-orange-500 pl-3">最後に</h3>{paragraph(content.closing)}</section>}
    <footer className="border-t border-orange-100 pt-4 text-xs text-slate-500">SIEN.OFFICIAL / www.sien-official.com</footer>
  </article>;
}
