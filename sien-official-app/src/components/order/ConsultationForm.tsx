"use client";
import { useFormAccessibility } from "@/lib/form-accessibility";
import { FormSubmissionError, submitForm } from "@/lib/form-submission";
import { useRetryCountdown } from "@/lib/retry-countdown";
import { useFormDraft } from "@/lib/form-draft";
import { DraftNotice } from "@/components/order/DraftNotice";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { TERMS_VERSION } from "@/lib/contract-terms";

export function ConsultationForm({ service = "MIX" }: { service?: string }) {
 const validation = useFormAccessibility();
  const [retryUntil, setRetryUntil] = useState(0);
  const retrySeconds = useRetryCountdown(retryUntil);
  const errorRef = useRef<HTMLDivElement>(null);
  const successHeading = useRef<HTMLHeadingElement>(null);
  const [conflict, setConflict] = useState(false);
  function newSubmission() { key.current = crypto.randomUUID(); setSubmissionId(key.current); setConflict(false); setError("入力内容を保持して新しい依頼を準備しました。以前の受付内容は変更されません。確認後に送信してください。"); }
  const [data, setData] = useState({ clientName: "", clientEmail: "", serviceType: service === "ORIGINAL" ? "ORIGINAL" : service === "GUIDE" ? "GUIDE" : "MIX", message: "" });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState("");
  const key = useRef("");
  const draft = useFormDraft("consultation", { data, idempotencyKey: submissionId }, !!(data.clientName || data.clientEmail || data.message), !submitted);
  function restoreDraft() { const saved = draft.restore(); if (saved && ["MIX", "ORIGINAL", "GUIDE"].includes(saved.data.serviceType)) { setData(saved.data); key.current = saved.idempotencyKey; setSubmissionId(saved.idempotencyKey); setTermsAccepted(false); } }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (pending || retrySeconds > 0) return;
    setPending(true); setError("");
    key.current ||= crypto.randomUUID();
    setSubmissionId(key.current);
    try {
      await submitForm("/api/orders", { ...data, intent: "CONSULTATION", idempotencyKey: key.current, termsAccepted, termsVersion: TERMS_VERSION });
      setSubmitted(true);
    } catch (cause) { if (cause instanceof FormSubmissionError) { setRetryUntil(cause.retryUntil); setConflict(cause.code === "IDEMPOTENCY_CONFLICT"); } setError(cause instanceof Error ? cause.message : "通信できませんでした。入力内容は保持されています。時間をおいて再送してください。"); }
    finally { setPending(false); }
  }
  useEffect(() => { if (error) errorRef.current?.focus(); }, [error]);
  useEffect(() => { if (submitted) { successHeading.current?.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: "instant" }); } }, [submitted]);
  if (submitted) return <section className="mx-auto max-w-2xl px-4 py-10 md:py-20 text-center"><h1 ref={successHeading} tabIndex={-1} className="mb-6 text-3xl font-bold">無料相談を受け付けました</h1><p>原則24時間以内にメールで返信します。この送信で制作契約や料金は発生しません。</p><Link href="/" className="mt-8 inline-block text-orange-800 underline">トップページへ戻る</Link></section>;
  const inputClass = "w-full min-h-12 text-base rounded-lg border border-slate-300 bg-white p-3 focus-visible:outline-2 focus-visible:outline-orange-700";
  return <section className="mx-auto max-w-2xl px-4 py-10 md:py-20"><h1 className="mb-6 text-3xl font-bold">無料相談・お見積もり</h1><p className="mb-4">プランや素材が決まっていなくても相談できます。制作の開始・お支払いは、正式見積に合意した後です。</p><Link href={`/order?service=${data.serviceType}`} className="text-orange-800 underline">プランを選んで制作を依頼する</Link>
    <DraftNotice available={draft.available} onRestore={restoreDraft} onClear={draft.clear} />
    <form onInvalidCapture={validation.onInvalidCapture} onChangeCapture={validation.onChangeCapture} onSubmit={submit} className="mt-8 space-y-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:p-8">
      {error && <div ref={errorRef} tabIndex={-1} role="alert" className="rounded-lg bg-red-50 p-4 text-red-800 focus-visible:outline-2">{error}{retrySeconds > 0 && <p>再送まであと{retrySeconds}秒</p>}{conflict && <button type="button" onClick={newSubmission} className="block mt-3 rounded-lg border border-red-800 p-3 font-bold">入力内容を引き継いで新しい依頼を作成</button>}</div>}
      <div><label htmlFor="consult-name" className="mb-2 block font-bold">活動名・お名前（必須）</label><input {...validation.field("consult-name")} id="consult-name" required maxLength={120} autoComplete="name" value={data.clientName} onChange={e => setData({ ...data, clientName: e.target.value })} className={inputClass} />{validation.message("consult-name")}</div>
      <div><label htmlFor="consult-email" className="mb-2 block font-bold">メールアドレス（必須）</label><input {...validation.field("consult-email")} id="consult-email" type="email" required maxLength={254} autoComplete="email" value={data.clientEmail} onChange={e => setData({ ...data, clientEmail: e.target.value })} className={inputClass} />{validation.message("consult-email")}<p className="mt-2 text-sm text-slate-600">相談への返信はメールでお送りします。</p></div>
      <div><label htmlFor="consult-service" className="mb-2 block font-bold">ご相談のサービス</label><select {...validation.field("consult-service")} id="consult-service" value={data.serviceType} onChange={e => setData({ ...data, serviceType: e.target.value })} className={inputClass}><option value="MIX">MIX・マスタリング</option><option value="ORIGINAL">オリジナル楽曲制作</option><option value="GUIDE">ボーカルガイド作成</option></select>{validation.message("consult-service")}</div>
      <div><label htmlFor="consult-message" className="mb-2 block font-bold">ご相談内容（必須）</label><textarea {...validation.field("consult-message")} id="consult-message" required maxLength={5000} rows={6} value={data.message} onChange={e => setData({ ...data, message: e.target.value })} className={inputClass} placeholder="料金・納期・制作内容など、ご不明な点をお知らせください。" />{validation.message("consult-message")}</div>
      <div className="flex items-start gap-3"><input {...validation.field("consult-consent")} id="consult-consent" type="checkbox" required checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} className="mt-1 size-5 shrink-0" />{validation.message("consult-consent")}<label htmlFor="consult-consent"><Link href="/policy/guidelines" target="_blank" rel="noopener noreferrer" className="text-orange-800 underline">留意事項</Link>と<Link href="/policy/privacy" target="_blank" rel="noopener noreferrer" className="text-orange-800 underline">プライバシーポリシー</Link>を確認し、同意する（必須）</label></div>
      <button type="submit" disabled={pending || retrySeconds > 0} className="w-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4 font-bold text-white shadow-lg shadow-orange-500/20 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60">{pending ? "送信中…" : "無料相談を送信する"}</button>
    </form>
  </section>;
}
