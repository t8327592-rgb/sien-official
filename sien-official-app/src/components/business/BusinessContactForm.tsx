"use client";
import { useFormAccessibility } from "@/lib/form-accessibility";
import { FormSubmissionError, submitForm } from "@/lib/form-submission";
import { useRetryCountdown } from "@/lib/retry-countdown";
import { useFormDraft } from "@/lib/form-draft";
import { DraftNotice } from "@/components/order/DraftNotice";
import { TERMS_VERSION } from "@/lib/contract-terms";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, Loader2, Building2 } from "lucide-react";

// PolicyModal was removed in favor of linking directly to /policy/guidelines

export function BusinessContactForm({ onSuccess }: { onSuccess?: (email: string, receiptNumber: string) => void }) {
 const validation = useFormAccessibility();
  const [retryUntil, setRetryUntil] = useState(0);
  const retrySeconds = useRetryCountdown(retryUntil);
  const errorRef = useRef<HTMLDivElement>(null);
  const [conflict, setConflict] = useState(false);
  function newSubmission() { submissionKey.current = crypto.randomUUID(); setSubmissionId(submissionKey.current); setConflict(false); setError("入力内容を保持して新しい依頼を準備しました。以前の受付内容は変更されません。確認後に送信してください。"); }
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submissionId, setSubmissionId] = useState("");
  const submissionKey = useRef("");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    inquiryType: "",
    budget: "",
    deadline: "",
    message: ""
  });

  const draft = useFormDraft("business", { formData, idempotencyKey: submissionId }, !!(formData.companyName || formData.email || formData.message), !receiptNumber);
  function restoreDraft() { const saved = draft.restore(); if (saved) { setFormData(saved.formData); submissionKey.current = saved.idempotencyKey; setSubmissionId(saved.idempotencyKey); setTermsAccepted(false); } }
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || retrySeconds > 0) return;
    if (!submissionKey.current) submissionKey.current = crypto.randomUUID();
    setSubmissionId(submissionKey.current);
    setIsSubmitting(true);
    setError("");

    try {
      const result = await submitForm("/api/business-contact", { ...formData, idempotencyKey: submissionKey.current, termsAccepted, termsVersion: TERMS_VERSION });
      setReceiptNumber(result.receiptNumber);
      if (onSuccess) {
        onSuccess(formData.email, result.receiptNumber);
      }
    } catch (err) {
      if (err instanceof FormSubmissionError) { setRetryUntil(err.retryUntil); setConflict(err.code === "IDEMPOTENCY_CONFLICT"); }
      setError(err instanceof Error ? err.message : "送信に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => { if (error) errorRef.current?.focus(); }, [error]);

  return (
    <>
      {receiptNumber && <p role="status">受付番号：{receiptNumber}</p>}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">お問い合わせ・ご相談</h2>
        <p className="text-slate-500">
          些細なご相談やお見積りのみでも歓迎いたします。<br className="hidden md:block" />
          以下のフォームよりお気軽にご連絡ください。
        </p>
      </div>
      <div className="bg-white rounded-[2rem] p-4 md:p-10 border border-slate-100 shadow-xl max-w-3xl mx-auto relative overflow-hidden">
        {/* 装飾 */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none opacity-60"></div>

      <div className="relative z-10 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <Building2 className="w-6 h-6 text-orange-700" />
            お問い合わせフォーム
          </h2>
          <p className="text-slate-500 text-sm mt-2">必須項目（*）は必ずご入力ください。</p>
        </div>
      </div>

      {error && (
        <div ref={errorRef} tabIndex={-1} role="alert" className="mb-8 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-start gap-3">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <p>{error}{retrySeconds > 0 && <span className="block">再送まであと{retrySeconds}秒</span>}{conflict && <button type="button" onClick={newSubmission} className="block mt-3 rounded-lg border border-red-800 p-3 font-bold">入力内容を引き継いで新しい依頼を作成</button>}</p>
        </div>
      )}

      <DraftNotice available={draft.available} onRestore={restoreDraft} onClear={draft.clear} />
      <form onInvalidCapture={validation.onInvalidCapture} onChangeCapture={validation.onChangeCapture} onSubmit={handleSubmit} className="relative z-10 space-y-8">

        {/* お客様情報 */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="w-1 h-5 bg-orange-500 rounded-full"></span>
            お客様情報
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="businesscontactform-field-1" className="text-sm font-bold text-slate-700 flex items-center gap-2">
                貴社名 <span className="text-orange-700 text-[10px] bg-orange-50 px-2 py-0.5 rounded-sm">必須</span>
              </label>
              <input {...validation.field("businesscontactform-field-1")} id="businesscontactform-field-1"
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="例：株式会社Sien-Official"
                required
                className="w-full text-base h-12 px-4 rounded-xl border bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors outline-none"
              />{validation.message("businesscontactform-field-1")}
            </div>
            <div className="space-y-2">
              <label htmlFor="businesscontactform-field-2" className="text-sm font-bold text-slate-700 flex items-center gap-2">
                ご担当者名 <span className="text-orange-700 text-[10px] bg-orange-50 px-2 py-0.5 rounded-sm">必須</span>
              </label>
              <input {...validation.field("businesscontactform-field-2")} id="businesscontactform-field-2"
                type="text"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                placeholder="例：山田 太郎"
                required
                className="w-full text-base h-12 px-4 rounded-xl border bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors outline-none"
              />{validation.message("businesscontactform-field-2")}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="businesscontactform-field-3" className="text-sm font-bold text-slate-700 flex items-center gap-2">
              メールアドレス <span className="text-orange-700 text-[10px] bg-orange-50 px-2 py-0.5 rounded-sm">必須</span>
            </label>
            <input {...validation.field("businesscontactform-field-3")} id="businesscontactform-field-3"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="例：info@example.com"
              required
              className="w-full text-base h-12 px-4 rounded-xl border bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors outline-none"
            />{validation.message("businesscontactform-field-3")}
          </div>
        </div>

        <div className="h-px w-full bg-slate-100 my-8"></div>

        {/* ご相談内容 */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="w-1 h-5 bg-orange-500 rounded-full"></span>
            ご相談内容
          </h3>

          <div className="space-y-2">
            <label htmlFor="businesscontactform-field-4" className="text-sm font-bold text-slate-700 flex items-center gap-2">
              ご用件 <span className="text-orange-700 text-[10px] bg-orange-50 px-2 py-0.5 rounded-sm">必須</span>
            </label>
            <select {...validation.field("businesscontactform-field-4")} id="businesscontactform-field-4"
              name="inquiryType"
              value={formData.inquiryType}
              onChange={handleChange}
              required
              className="w-full text-base h-12 px-4 rounded-xl border bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors outline-none appearance-none"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
            >
              <option value="" disabled>選択してください</option>
              <option value="歌ってみたMIX・マスタリング">歌ってみたMIX・マスタリング</option>
              <option value="オリジナル楽曲制作（ゲーム・アプリ等）">オリジナル楽曲制作（ゲーム・アプリ等）</option>
              <option value="企業PR・CM用楽曲制作">企業PR・CM用楽曲制作</option>
              <option value="その他音源制作・ディレクション">その他音源制作・ディレクション</option>
              <option value="お見積りのご依頼">お見積りのご依頼</option>
              <option value="その他のお問い合わせ">その他のお問い合わせ</option>
            </select>{validation.message("businesscontactform-field-4")}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="businesscontactform-field-5" className="text-sm font-bold text-slate-700 flex items-center gap-2">
                ご予算感 <span className="text-slate-600 text-[10px] bg-slate-100 px-2 py-0.5 rounded-sm">任意</span>
              </label>
              <input {...validation.field("businesscontactform-field-5")} id="businesscontactform-field-5"
                type="text"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                placeholder="例：50万円程度、要相談など"
                className="w-full text-base h-12 px-4 rounded-xl border bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors outline-none"
              />{validation.message("businesscontactform-field-5")}
            </div>
            <div className="space-y-2">
              <label htmlFor="businesscontactform-field-6" className="text-sm font-bold text-slate-700 flex items-center gap-2">
                希望納期 <span className="text-slate-600 text-[10px] bg-slate-100 px-2 py-0.5 rounded-sm">任意</span>
              </label>
              <input {...validation.field("businesscontactform-field-6")} id="businesscontactform-field-6"
                type="text"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                placeholder="例：2026年12月末、未定など"
                className="w-full text-base h-12 px-4 rounded-xl border bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors outline-none"
              />{validation.message("businesscontactform-field-6")}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="businesscontactform-field-7" className="text-sm font-bold text-slate-700 flex items-center gap-2">
              お問い合わせ内容 <span className="text-orange-700 text-[10px] bg-orange-50 px-2 py-0.5 rounded-sm">必須</span>
            </label>
            <textarea {...validation.field("businesscontactform-field-7")} id="businesscontactform-field-7"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="プロジェクトの概要、ご検討中のサービス、ご質問などをご自由にご記入ください。"
              required
              className="w-full min-h-[200px] p-4 rounded-xl border bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors resize-y text-base outline-none"
            />{validation.message("businesscontactform-field-7")}
          </div>
        </div>

        <div className="pt-8 flex flex-col items-center border-t border-slate-100">
          <label htmlFor="businesscontactform-field-8" className="flex items-center justify-center gap-3 cursor-pointer mb-6 text-slate-700 hover:text-slate-900 transition-colors group">
            <input {...validation.field("businesscontactform-field-8")} id="businesscontactform-field-8" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} required type="checkbox" className="w-5 h-5 text-orange-700 rounded border-slate-300 focus:ring-orange-500 focus:ring-offset-white bg-white" />{validation.message("businesscontactform-field-8")}
            <span className="font-bold text-sm md:text-base">
              <a href="/policy/guidelines" target="_blank" rel="noopener noreferrer" className="text-orange-700 hover:text-orange-700 underline underline-offset-4 decoration-orange-500/50 transition-colors mx-1">
                ご依頼に関する留意事項
              </a>
              ・<a href="/policy/privacy" target="_blank" rel="noopener noreferrer" className="text-orange-700 underline">プライバシーポリシー</a>に同意する <span className="text-orange-700 text-[10px] bg-orange-50 px-2 py-0.5 rounded-sm ml-1">必須</span>
            </span>
          </label>

          <Button
            type="submit"
            disabled={isSubmitting || retrySeconds > 0}
            className="w-full md:w-auto md:min-w-[300px] h-14 rounded-full bg-orange-600 hover:bg-orange-500 text-white font-bold text-lg shadow-lg shadow-orange-500/20 hover:scale-[1.02] transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                送信中...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                この内容で送信する
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
    </>
  );
}
