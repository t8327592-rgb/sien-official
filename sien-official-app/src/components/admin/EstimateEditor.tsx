"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { adminRequest } from "@/lib/admin-request";
import { estimateTotals, estimateMessage, validateEstimate, yen, type EstimateContent, type EstimateLine } from "@/lib/estimates";

const input = "mt-1 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900";
const button = "rounded-lg border bg-white px-4 py-2.5 text-sm font-bold disabled:opacity-50";
type Saved = { id: string; revision: number };
export function EstimateEditor({ initial, orderIds, warnings = [], saved, latestId }: {
  initial: EstimateContent; orderIds: string[]; warnings?: string[]; saved?: Saved; latestId?: string;
}) {
  const router = useRouter();
  const [content, setContent] = useState(initial), [busy, setBusy] = useState(false), [error, setError] = useState("");
  const saving = useRef(false), key = useRef<string | null>(null);
  const [lastSave, setLastSave] = useState<Saved | undefined>(saved);
  const [savedJson, setSavedJson] = useState(saved ? JSON.stringify(initial) : "");
  const dirty = JSON.stringify(content) !== savedJson;
  const stale = !!saved && !!latestId && saved.id !== latestId;
  let calculationError = "", totals = { base: 0, options: 0, subtotal: 0, eligible: 0, discount: 0, total: 0 };
  try { totals = estimateTotals(content); } catch (error) { calculationError = error instanceof Error ? error.message : "金額を確認してください。"; }
  const change = <K extends keyof EstimateContent>(field: K, value: EstimateContent[K]) => setContent(previous => ({ ...previous, [field]: value }));
  const lineChange = (id: string, update: Partial<EstimateLine>) => change("lines", content.lines.map(line => line.id === id ? { ...line, ...update } : line));
  const discountChange = (update: Partial<EstimateContent["discount"]>) => change("discount", { ...content.discount, ...update });
  function removeLine(id: string) {
    setContent(previous => ({ ...previous, lines: previous.lines.filter(line => line.id !== id), discount: { ...previous.discount, lineIds: previous.discount.lineIds.filter(lineId => lineId !== id) } }));
  }
  function addOption(orderId: string) {
    const source = content.lines.find(line => line.orderId === orderId && line.kind === "BASE")!;
    change("lines", [...content.lines, { id: crypto.randomUUID(), orderId, kind: "OPTION", songTitle: source.songTitle, name: "追加オプション", quantity: 1, unitPrice: 0, note: "" }]);
  }
  async function save() {
    const checked = validateEstimate(content);
    if (lastSave && !dirty) return lastSave;
    key.current ??= crypto.randomUUID();
    const response = await adminRequest("/api/admin/estimates", "POST", { content: checked, orderIds, previousId: lastSave?.id ?? null, requestKey: key.current });
    const result = { id: response.id as string, revision: response.revision as number };
    setLastSave(result); setSavedJson(JSON.stringify(content)); key.current = null;
    toast.success(`第${result.revision}版を保存しました`);
    router.replace(`/admin/estimates/${result.id}`, { scroll: false });
    return result;
  }
  async function perform(action: "SAVE" | "DOWNLOAD" | "PREVIEW") {
    if (saving.current) return;
    saving.current = true; setBusy(true); setError("");
    try {
      const checked = validateEstimate(content);
      let response: Response, pdfRevision = revision;
      if (action === "PREVIEW") {
        response = await fetch("/api/admin/estimates/preview", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: checked, orderIds, revision: (lastSave?.revision ?? 0) + (dirty ? 1 : 0) || 1 }), signal: AbortSignal.timeout(60000) });
      } else {
        const result = await save();
        pdfRevision = result.revision;
        if (action === "SAVE") return;
        response = await fetch(`/api/admin/estimates/${result.id}/pdf`, { signal: AbortSignal.timeout(60000) });
      }
      if (!response.ok) { const data = await response.json().catch(() => null); throw new Error(data?.error || "PDFをダウンロードできませんでした。保存済み一覧から再試行できます。"); }
      const url = URL.createObjectURL(await response.blob()), anchor = document.createElement("a");
      anchor.href = url; anchor.download = `${action === "PREVIEW" ? "未保存プレビュー_" : ""}見積書_${checked.number.replace(/[\\/:*?"<>|]/g, "_")}_第${pdfRevision}版.pdf`;
      anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) { setError(error instanceof Error ? error.message : "処理に失敗しました。"); }
    finally { saving.current = false; setBusy(false); }
  }
  async function copyMessage() {
    try { validateEstimate(content); await navigator.clipboard.writeText(content.message || estimateMessage(content)); toast.success("案内文をコピーしました"); }
    catch (error) { setError(error instanceof Error ? error.message : "コピーできませんでした。案内文を選択してコピーしてください。"); }
  }
  const revision = (lastSave?.revision ?? 0) + (dirty ? 1 : 0) || 1;
  return <div className="space-y-6 pb-16">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h1 className="text-2xl font-bold">見積書の編集</h1><p className="mt-1 text-sm text-slate-600">{orderIds.length}件の依頼 / 第{revision}版{dirty ? "（未保存）" : "（保存済み）"}</p></div>
      <Link href="/admin/estimates" className="text-sm underline">保存済みの見積書</Link>
    </div>
    <p className="rounded-xl border bg-slate-50 p-4 text-sm">見積書は依頼の見積額・確定金額・売上・入金履歴から独立して保存されます。備考の金額は自動計算に含まれません。編集後の保存は改訂版として残ります。</p>
    {warnings.length > 0 && <div role="status" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm"><p className="font-bold">自動入力の確認事項</p><ul className="mt-2 list-disc space-y-1 pl-5">{warnings.map((warning, index) => <li key={index}>{warning}</li>)}</ul></div>}
    {stale && <p role="alert" className="rounded-xl border border-amber-400 bg-amber-50 p-4">この見積書には新版があります。改訂する場合は<Link href={`/admin/estimates/${latestId}`} className="underline">最新版</Link>を開いてください。旧版PDFはそのままダウンロードできます。</p>}
    <fieldset disabled={busy} className="space-y-6 disabled:opacity-70">
      <div className="grid gap-4 rounded-xl border bg-white p-5 sm:grid-cols-2">
        <label>クライアント名<input className={input} value={content.clientName} maxLength={180} onChange={e => change("clientName", e.target.value)} /></label>
        <label>見積書番号<input className={input} value={content.number} maxLength={80} onChange={e => change("number", e.target.value)} /></label>
        <label>発行日<input className={input} type="date" value={content.issuedOn} onChange={e => change("issuedOn", e.target.value)} /></label>
        <label>見積有効期限<input className={input} type="date" value={content.validUntil} onChange={e => change("validUntil", e.target.value)} /></label>
      </div>
      {(["BASE", "OPTION"] as const).map(kind => <section key={kind} className="space-y-3 rounded-xl border bg-white p-4 sm:p-5">
        <h2 className="text-lg font-bold">{kind === "BASE" ? "① 基本料金" : "② オプション料金"}</h2>
        {content.lines.filter(line => line.kind === kind).map((line, index) => <div key={line.id} className="space-y-3 rounded-lg border bg-slate-50 p-3">
          <div className="flex items-center justify-between gap-3 text-sm"><Link className="underline" href={`/admin/orders/${line.orderId}`} target="_blank" rel="noreferrer">対象依頼を確認 ↗</Link><span>{index + 1} / {yen(line.quantity * line.unitPrice)}</span></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">{kind === "BASE" ? "楽曲名" : "対象楽曲（複数曲は併記可）"}<input className={input} value={line.songTitle} maxLength={300} onChange={e => {
              if (kind === "BASE") change("lines", content.lines.map(item => item.id === line.id || item.orderId === line.orderId && item.songTitle === line.songTitle ? { ...item, songTitle: e.target.value } : item));
              else lineChange(line.id, { songTitle: e.target.value });
            }} /></label>
            <label className="text-sm">{kind === "BASE" ? "MIXプラン・サービス名" : "オプション名"}<input className={input} value={line.name} maxLength={150} onChange={e => lineChange(line.id, { name: e.target.value })} /></label>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <label className="text-sm">数量<input className={input} type="number" min={1} max={9999} step={1} value={line.quantity} onChange={e => lineChange(line.id, { quantity: Number(e.target.value) })} /></label>
            <label className="text-sm">単価（税込・円）<input className={input} type="number" min={0} max={100000000} step={1} value={line.unitPrice} onChange={e => lineChange(line.id, { unitPrice: Number(e.target.value) })} /></label>
            {kind === "OPTION" && <button type="button" className={`${button} self-end`} onClick={() => removeLine(line.id)}>この明細を削除</button>}
          </div>
          <label className="block text-sm">この明細の特記事項（計算には含めません）<textarea className={input} rows={2} maxLength={500} value={line.note} onChange={e => lineChange(line.id, { note: e.target.value })} /></label>
        </div>)}
        {kind === "OPTION" && <div className="flex flex-wrap gap-2">{orderIds.map((id, index) => <button key={id} type="button" onClick={() => addOption(id)} disabled={content.lines.length >= 400} className={button}>{index + 1}曲目にオプションを追加</button>)}</div>}
        <p className="text-right font-bold">小計：{yen(kind === "BASE" ? totals.base : totals.options)}</p>
      </section>)}
      <section className="space-y-4 rounded-xl border bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-bold">③ 割引</h2><button type="button" className={button} onClick={() => discountChange({ value: 0, name: "", lineIds: [], target: "ALL" })}>割引を解除</button></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label>割引名称<input className={input} value={content.discount.name} maxLength={150} onChange={e => discountChange({ name: e.target.value })} /></label>
          <label>割引方式<select className={input} value={content.discount.mode} onChange={e => discountChange({ mode: e.target.value as "PERCENT" | "FIXED", value: 0 })}><option value="PERCENT">割引率（%）</option><option value="FIXED">固定額（円）</option></select></label>
          <label>割引値<input className={input} type="number" min={0} max={content.discount.mode === "PERCENT" ? 100 : totals.eligible} step={content.discount.mode === "PERCENT" ? ".01" : "1"} value={content.discount.value} onChange={e => discountChange({ value: Number(e.target.value) })} /></label>
          <label>割引対象<select className={input} value={content.discount.target} onChange={e => discountChange({ target: e.target.value as EstimateContent["discount"]["target"] })}><option value="ALL">すべての明細</option><option value="BASE">基本料金のみ</option><option value="OPTION">オプションのみ</option><option value="SELECTED">明細を指定</option></select></label>
        </div>
        {content.discount.target === "SELECTED" && <div className="space-y-2">{content.lines.map(line => <label key={line.id} className="flex items-start gap-2 text-sm"><input className="mt-1 size-4 shrink-0" type="checkbox" checked={content.discount.lineIds.includes(line.id)} onChange={e => discountChange({ lineIds: e.target.checked ? [...content.discount.lineIds, line.id] : content.discount.lineIds.filter(id => id !== line.id) })} />{line.songTitle} / {line.name}（{yen(line.quantity * line.unitPrice)}）</label>)}</div>}
        <p className="text-sm text-slate-600">対象額 {yen(totals.eligible)} / 割引額 {yen(totals.discount)}。端数は既存の料金計算と同じく依頼ごとの割引後金額で切り捨て、割引額を最後に合算します。</p>
      </section>
      <div className="space-y-4 rounded-xl border bg-white p-5">
        <label className="block">備考・特記事項<textarea aria-label="備考・特記事項" className={input} rows={4} maxLength={6000} value={content.notes} onChange={e => change("notes", e.target.value)} /></label>
        <label className="block">支払いに関する案内<textarea aria-label="支払いに関する案内" className={input} rows={3} maxLength={4000} value={content.paymentGuide} onChange={e => change("paymentGuide", e.target.value)} /></label>
      </div>
    </fieldset>
    <section aria-label="見積内容プレビュー" className="space-y-4 rounded-xl border bg-white p-5 sm:p-8">
      <div className="flex flex-wrap justify-between gap-3"><h2 className="text-xl font-bold">見積書プレビュー</h2><span className="text-sm text-slate-500">第{revision}版 / {content.number}</span></div>
      <p className="break-words text-lg">{content.clientName} 様</p>
      <p className="text-sm text-slate-500">発行日 {content.issuedOn} / 有効期限 {content.validUntil}</p>
      <div className="space-y-2 text-sm">{(["BASE", "OPTION"] as const).map(kind => <div key={kind} className="space-y-2"><h3 className="border-b pb-2 font-bold">{kind === "BASE" ? "基本料金" : "オプション料金"}</h3>{content.lines.filter(line => line.kind === kind).map(line => <div key={line.id} className="flex justify-between gap-3 border-b border-slate-100 py-2"><div className="min-w-0 break-words"><p>{line.songTitle} / {line.name}</p><p className="text-slate-500">{yen(line.unitPrice)} × {line.quantity}</p>{line.note && <p className="whitespace-pre-wrap text-slate-500">{line.note}</p>}</div><span className="shrink-0">{yen(line.unitPrice * line.quantity)}</span></div>)}</div>)}</div>
      <dl className="ml-auto max-w-md space-y-2"><div className="flex justify-between"><dt>割引前合計</dt><dd>{yen(totals.subtotal)}</dd></div><div className="flex justify-between gap-4"><dt className="break-words">{content.discount.name || "割引"}</dt><dd className="shrink-0">−{yen(totals.discount)}</dd></div><div className="flex flex-wrap justify-between gap-2 border-t-2 pt-3 text-xl font-bold"><dt>お支払い総額（税込）</dt><dd>{yen(totals.total)}</dd></div></dl>
      {content.notes && <div><h3 className="font-bold">備考</h3><p className="whitespace-pre-wrap break-words text-sm">{content.notes}</p></div>}
      {content.paymentGuide && <p className="whitespace-pre-wrap break-words text-sm">{content.paymentGuide}</p>}
    </section>
    {(error || calculationError) && <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800">{error || calculationError}</p>}
    <div className="flex flex-wrap gap-3">
      <button disabled={busy || !!calculationError || stale && dirty} className="rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50" onClick={() => void perform("SAVE")}>{busy ? "処理中…" : lastSave ? "改訂版を保存" : "見積書を保存"}</button>
      <button disabled={busy || !!calculationError || stale && dirty} className={button} onClick={() => void perform("DOWNLOAD")}>保存してPDFをダウンロード</button>
      <button disabled={busy || !!calculationError} className={button} onClick={() => void perform("PREVIEW")}>PDFプレビューをダウンロード（保存しない）</button>
      {lastSave && <Link className={button} href={`/admin/estimates/new?copy=${lastSave.id}`}>複製して新規作成</Link>}
    </div>
    <section className="space-y-3 rounded-xl border bg-white p-5">
      <h2 className="text-lg font-bold">送付用の案内文</h2>
      <p className="text-sm text-slate-600">自動生成文は金額・支払い案内に連動します。手動編集後に金額を変えた場合は「案内文を再生成」で更新してください。案内文はPDFには入りません。</p>
      <label className="block">案内文<textarea aria-label="案内文" className={input} rows={12} maxLength={8000} value={content.message || (!calculationError ? estimateMessage(content) : "")} onChange={e => change("message", e.target.value)} disabled={busy} /></label>
      <div className="flex flex-wrap gap-3"><button className={button} disabled={busy || !!calculationError} onClick={() => void copyMessage()}>案内文をコピー</button><button className={button} disabled={busy || !!calculationError} onClick={() => change("message", "")}>案内文を再生成</button></div>
    </section>
  </div>;
}
