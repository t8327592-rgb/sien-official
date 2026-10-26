"use client";

import { useEffect, useRef, useState } from "react";
import { FEEDBACK_ITEMS, FEEDBACK_RATINGS, feedbackClientName, feedbackExportErrors, type FeedbackContent, type FeedbackKey, type FeedbackRating } from "@/lib/feedback";
import type { FeedbackIdentity } from "@/lib/feedback-pdf";

const fieldClass = "w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 disabled:bg-slate-100";
const cardClass = "rounded-xl border border-slate-200 bg-white p-5 md:p-7 space-y-5";

export function FeedbackEditor({ order, initialContent, initialVersion }: {
  order: FeedbackIdentity; initialContent: FeedbackContent; initialVersion: number;
}) {
  const [content, setContent] = useState(initialContent);
  const [version, setVersion] = useState(initialVersion);
  const [saved, setSaved] = useState(JSON.stringify(initialContent));
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [preview, setPreview] = useState(false);
  const dirty = saved !== JSON.stringify(content);
  const endpoint = `/api/admin/orders/${encodeURIComponent(order.id)}/feedback`;

  useEffect(() => {
    if (!dirty) return;
    const preventLoss = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", preventLoss);
    // Next links do not trigger beforeunload.
    const preventNavigation = (event: MouseEvent) => {
      const anchor = event.target instanceof Element ? event.target.closest("a") : null;
      if (anchor && anchor.target !== "_blank" && anchor.href !== window.location.href && !window.confirm("未保存の変更があります。保存せずに移動しますか？")) {
        event.preventDefault(); event.stopPropagation();
      }
    };
    document.addEventListener("click", preventNavigation, true);
    return () => { window.removeEventListener("beforeunload", preventLoss); document.removeEventListener("click", preventNavigation, true); };
  }, [dirty]);

  function update(field: "date" | "summary" | "strengths" | "changes" | "closing", value: string) {
    setContent(previous => ({ ...previous, [field]: value }));
  }
  function updateItem(key: FeedbackKey, patch: { rating?: FeedbackRating; comment?: string }) {
    setContent(previous => ({ ...previous, items: { ...previous.items, [key]: { ...previous.items[key], ...patch } } }));
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
      anchor.download = `フィードバック_${(order.songTitle || order.id).replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_")}.pdf`;
      document.body.appendChild(anchor); anchor.click(); anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      setMessage("保存した内容でPDFを作成しました。");
    } catch (error) { setErrors([error instanceof Error ? error.message : "処理に失敗しました。入力内容は画面に残っています。"]); }
    finally { lock.current = false; setBusy(false); }
  }

  function textArea(field: "summary" | "strengths" | "changes" | "closing", label: string, hint: string, max = 1200) {
    return <label className="block space-y-2"><span className="font-bold text-sm text-slate-800">{label}</span><textarea className={fieldClass} rows={3} value={content[field]} maxLength={max} placeholder={hint} onChange={event => update(field, event.target.value)} /><span className="block text-xs text-slate-500">{content[field].length} / {max}文字</span></label>;
  }

  return <div className="space-y-6">
    <section className={cardClass} aria-label="依頼から引き継いだ情報">
      <div className="flex flex-wrap gap-6 text-sm"><div><span className="text-slate-500">クライアント名</span><p className="font-bold mt-1 break-words">{feedbackClientName(order.clientName)}</p></div><div><span className="text-slate-500">楽曲名</span><p className="font-bold mt-1 break-words">{order.songTitle || "未設定（依頼詳細から設定できます）"}</p></div></div>
      <p className="text-xs text-slate-500 break-all">依頼ID：{order.id} ／ 名前・楽曲名は依頼情報から自動で引き継ぎます。</p>
    </section>

    <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white/95 p-4 shadow-sm">
      <p className="text-sm text-slate-600" role="status">{busy ? "処理中…" : dirty ? "未保存の変更があります" : version ? "保存済み" : "新規作成"}</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy} onClick={() => setPreview(!preview)} className="rounded-lg border px-4 py-2 text-sm font-bold hover:bg-slate-50 disabled:opacity-50">{preview ? "入力に戻る" : "内容プレビュー"}</button>
        <button type="button" disabled={busy} onClick={() => void run("save")} className="rounded-lg border px-4 py-2 text-sm font-bold hover:bg-slate-50 disabled:opacity-50">下書き保存</button>
        <button type="button" disabled={busy} onClick={() => void run("download")} className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-50">保存してPDFダウンロード</button>
      </div>
    </div>
    {message && <p role="status" className="rounded-lg bg-teal-50 p-4 text-sm text-teal-900">{message}</p>}
    {errors.length > 0 && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"><p className="font-bold mb-2">内容を確認してください</p><ul className="list-disc pl-5 space-y-1">{errors.map((error, index) => <li key={index} className="whitespace-pre-line">{error}</li>)}</ul></div>}

    {preview ? <FeedbackPreview order={order} content={content} /> : <fieldset disabled={busy} className="space-y-6 min-w-0">
      <section className={cardClass}>
        <h2 className="font-bold text-lg text-slate-800">01　総評・よかったところ</h2>
        <label className="block space-y-2"><span className="font-bold text-sm">発行日</span><input type="date" required value={content.date} onChange={event => update("date", event.target.value)} className={`${fieldClass} max-w-56 block`} /></label>
        {textArea("summary", "今回の総評", "今回の特徴と、次回意識するとよいことを簡潔に。")}
        {textArea("strengths", "よかったところ", "よかった箇所と、その理由を具体的に。")}
      </section>
      {([ ["recording", "02　録音状態"], ["vocal", "03　歌唱について"] ] as const).map(([group, title]) => <section key={group} className={cardClass}>
        <h2 className="font-bold text-lg text-slate-800">{title}</h2>
        <p className="text-xs text-slate-500">今回の音源を基準に評価します。判断できない項目は「確認対象外」を選んでください。</p>
        {FEEDBACK_ITEMS.filter(item => item.group === group).map(({ key, label }) => <div key={key} className="border-t pt-5 space-y-3">
          <label className="flex flex-wrap items-center justify-between gap-2"><span className="text-sm font-bold text-slate-800">{label}</span><select aria-label={`${label}の評価`} value={content.items[key].rating} onChange={event => updateItem(key, { rating: event.target.value as FeedbackRating })} className={`${fieldClass} sm:max-w-52`}>
            {FEEDBACK_RATINGS.map(rating => <option key={rating}>{rating}</option>)}
          </select></label>
          <textarea aria-label={`${label}のコメント`} rows={2} maxLength={600} value={content.items[key].comment} onChange={event => updateItem(key, { comment: event.target.value })} placeholder="気づいたこと、具体的な箇所・タイムスタンプなど" className={fieldClass} />
        </div>)}
      </section>)}
      <section className={cardClass}>
        <h2 className="font-bold text-lg text-slate-800">04　次回の優先ポイント（最大３つ）</h2>
        <p className="text-xs text-slate-500">優先度が高い順に記入してください。必要な数だけ使い、使わない欄は空欄のままにします。</p>
        {content.priorities.map((point, index) => <div key={index} className="rounded-lg bg-slate-50 p-4 space-y-3">
          <h3 className="font-bold text-sm">改善ポイント {index + 1}</h3>
          {([ ["title", "見出し", 100], ["observation", "気になった箇所・状態", 600], ["action", "次回の具体的な試し方", 600] ] as const).map(([key, label, max]) => <label key={key} className="block space-y-1"><span className="text-xs font-semibold text-slate-600">{label}</span><textarea rows={key === "title" ? 1 : 2} maxLength={max} value={point[key]} className={fieldClass} onChange={event => setContent(previous => ({ ...previous, priorities: previous.priorities.map((value, position) => position === index ? { ...value, [key]: event.target.value } : value) }))} /></label>)}
        </div>)}
      </section>
      <section className={cardClass}>
        <h2 className="font-bold text-lg text-slate-800">05　前回からの変化・最後に</h2>
        {textArea("changes", "前回からの変化（任意）", "前回よりよくなった点、継続する課題など。初回は空欄で構いません。")}
        {textArea("closing", "最後に（任意）", "今回の強みを踏まえ、次回につながる一言。", 600)}
      </section>
    </fieldset>}
    <p className="text-xs text-slate-500">下書きは依頼に紐づけて保存されます。空欄の任意項目はPDFに掲載されません。PDFのページ数は文章量に合わせて調整されます。</p>
  </div>;
}

function FeedbackPreview({ order, content }: { order: FeedbackIdentity; content: FeedbackContent }) {
  const paragraph = (value: string) => <p className="whitespace-pre-wrap break-words text-sm leading-7">{value || "（未入力）"}</p>;
  return <article aria-label="フィードバック内容プレビュー" className="rounded-xl border bg-white p-6 md:p-12 space-y-7 text-slate-800">
    <header className="border-b border-teal-800 pb-6 space-y-2"><p className="text-xs tracking-widest text-teal-700">SIEN / RECORDING & VOCAL FEEDBACK</p><h2 className="text-2xl font-bold">録音・歌唱フィードバック</h2><p className="text-sm break-words">{feedbackClientName(order.clientName)} ／ {order.songTitle || "楽曲名未設定"}</p><p className="text-xs text-slate-500">発行日：{content.date}</p></header>
    <section className="space-y-2"><h3 className="font-bold text-teal-800">今回の総評</h3>{paragraph(content.summary)}</section>
    <section className="space-y-2"><h3 className="font-bold text-teal-800">よかったところ</h3>{paragraph(content.strengths)}</section>
    {([ ["recording", "録音状態"], ["vocal", "歌唱について"] ] as const).map(([group, title]) => <section key={group} className="space-y-3"><h3 className="font-bold text-teal-800">{title}</h3>{FEEDBACK_ITEMS.filter(item => item.group === group).map(({ key, label }) => <div key={key} className="rounded-lg bg-teal-50/60 p-4 space-y-2"><div className="flex flex-wrap justify-between gap-2 text-sm"><strong>{label}</strong><span className="text-teal-800">{content.items[key].rating}</span></div>{paragraph(content.items[key].comment || (content.items[key].rating === "確認対象外" ? "今回の確認対象外です。" : ""))}</div>)}</section>)}
    {content.priorities.some(point => point.title || point.observation || point.action) && <section className="space-y-4"><h3 className="font-bold text-teal-800">次回の優先ポイント</h3>{content.priorities.filter(point => point.title || point.observation || point.action).map((point, index) => <div key={index} className="space-y-2"><h4 className="font-bold break-words">{index + 1}. {point.title}</h4>{paragraph(point.observation)}{paragraph(`次回の試し方：${point.action}`)}</div>)}</section>}
    {content.changes && <section className="space-y-2"><h3 className="font-bold text-teal-800">前回からの変化</h3>{paragraph(content.changes)}</section>}
    {content.closing && <section className="space-y-2"><h3 className="font-bold text-teal-800">最後に</h3>{paragraph(content.closing)}</section>}
    <p className="text-xs text-slate-500">内容確認用のプレビューです。PDFのページ割りは文章量に合わせて調整されます。</p>
  </article>;
}
