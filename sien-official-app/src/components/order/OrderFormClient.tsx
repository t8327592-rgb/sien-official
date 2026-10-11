"use client";
import Link from "next/link";
import { useFormAccessibility } from "@/lib/form-accessibility";
import { FormSubmissionError, submitForm } from "@/lib/form-submission";
import { useRetryCountdown } from "@/lib/retry-countdown";
import { useFormDraft } from "@/lib/form-draft";
import { DraftNotice } from "@/components/order/DraftNotice";
import { TERMS_VERSION } from "@/lib/contract-terms";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { calculateOrderPrice } from "@/lib/order-pricing";
import { formatYen } from "@/lib/public-format";
import { resolveOrderSelection, type OrderService } from "@/lib/order-selection";
import type { getSiteSetting } from "@/lib/data/site-setting";
import { VOCAL_GUIDES, isHumanVocalGuide, type VocalGuide } from "@/lib/vocal-guide";

interface Plan {
  id: string;
  name: string;
  category: string;
  price: number | null;
  hasConsultation?: boolean;
}

interface Option {
  id: string;
  name: string;
  category: string;
  priceText: string;
}

// PolicyModal was removed in favor of linking directly to /policy/guidelines

const HelpTooltip = ({ text }: { text: string }) => (
  <span tabIndex={0} aria-label={text} onKeyDown={e => { if (e.key === "Escape") e.currentTarget.blur(); }} className="relative group/tooltip inline-block ml-2 cursor-help align-middle focus-visible:outline-2 focus-visible:outline-orange-700">
    <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-500 text-[10px] flex items-center justify-center font-bold hover:bg-orange-600 hover:text-slate-900 transition-colors">?</span>
    <span className="absolute bottom-full -left-4 mb-2 w-64 p-3 bg-white border border-slate-200 text-slate-700 text-xs rounded-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible group-focus/tooltip:opacity-100 group-focus/tooltip:visible transition-all z-50 text-left shadow-xl font-normal leading-relaxed">
      {text}
      <span className="absolute top-full left-6 -translate-x-1/2 border-4 border-transparent border-t-white z-10"></span>
      <span className="absolute top-full left-6 -translate-x-1/2 border-4 border-transparent border-t-slate-200" style={{ marginTop: '1px' }}></span>
    </span>
  </span>
);

export default function OrderFormClient({ initialPlans, initialOptions = [], siteSetting, initialSelection = resolveOrderSelection(initialPlans) }: { initialPlans: Plan[], initialOptions?: Option[], siteSetting?: Awaited<ReturnType<typeof getSiteSetting>>, initialSelection?: ReturnType<typeof resolveOrderSelection> }) {
 const validation = useFormAccessibility();
  const [retryUntil, setRetryUntil] = useState(0);
  const retrySeconds = useRetryCountdown(retryUntil);
  const errorRef = useRef<HTMLDivElement>(null);
  const successHeading = useRef<HTMLHeadingElement>(null);
  const [conflict, setConflict] = useState(false);
  function newSubmission() { submissionKey.current = crypto.randomUUID(); setSubmissionId(submissionKey.current); setConflict(false); setErrorMessage("入力内容を保持して新しい依頼を準備しました。以前の受付内容は変更されません。確認後に送信してください。"); }
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submissionId, setSubmissionId] = useState("");
  const submissionKey = useRef("");
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    twitterId: "",
    discordId: "",
    contactMethod: "メール",
    isRepeater: false,
    serviceType: initialSelection.serviceType,
    planId: initialSelection.planId,
    songTitle: "",
    options: "",
    vocalKey: "±0（原曲キー）",
    referenceUrl: "",
    referenceFidelity: "1",
    materialsUrl: "",
    paymentMethod: "銀行振込",
    deadline: "",
    message: "",
    activityPurpose: initialSelection.serviceType === "ORIGINAL" ? "YouTubeオリジナル曲" : "歌ってみた投稿",
    genre: "",
    lyricsStatus: "未定",
    vocalGuideStatus: "不要",
  });
  const [cutSeconds, setCutSeconds] = useState<Record<string, number>>({});
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const [errorMessage, setErrorMessage] = useState("");

  const draft = useFormDraft("order", { formData, selectedOptions, cutSeconds, idempotencyKey: submissionId }, !!(formData.clientName || formData.clientEmail || formData.message || selectedOptions.length), status !== "success");
  function restoreDraft() {
    const saved = draft.restore();
    if (!saved) return;
    const selection = resolveOrderSelection(initialPlans, saved.formData.planId, saved.formData.serviceType);
    setFormData({ ...saved.formData, serviceType: selection.serviceType, planId: selection.planId });
    setSelectedOptions(saved.selectedOptions.filter(id => initialOptions.some(option => option.id === id && [selection.serviceType, "COMMON"].includes(option.category))));
    setCutSeconds(saved.cutSeconds);
    submissionKey.current = saved.idempotencyKey; setSubmissionId(saved.idempotencyKey);
    setTermsAccepted(false);
  }
  const filteredPlans = initialPlans.filter(p => p.category === formData.serviceType);
  const selectedPlanObj = initialPlans.find(p => p.id === formData.planId);
  const isLyricsIncluded = selectedPlanObj?.name.includes("フルパッケージ");
  const isLyricsProvided = selectedPlanObj?.name.includes("作詞持ち込み");
  const humanGuideOption = initialOptions.find(option => option.category === "ORIGINAL" && isHumanVocalGuide(option));
  function selectVocalGuide(vocalGuideStatus: VocalGuide) {
    setFormData(prev => ({ ...prev, vocalGuideStatus }));
    setSelectedOptions(prev => {
      const others = prev.filter(id => !initialOptions.some(option => option.id === id && isHumanVocalGuide(option)));
      return vocalGuideStatus === "人間による仮歌" && humanGuideOption ? [...others, humanGuideOption.id] : others;
    });
  }

  function selectService(serviceType: OrderService) {
    setFormData(prev => ({ ...prev, serviceType, planId: initialPlans.find(plan => plan.category === serviceType)?.id ?? "", activityPurpose: serviceType === "ORIGINAL" ? "YouTubeオリジナル曲" : "歌ってみた投稿", vocalGuideStatus: "不要" }));
    setSelectedOptions([]);
  }

  const optionQuantities = Object.fromEntries(initialOptions.filter(option => selectedOptions.includes(option.id) && option.name.includes("カットアップ")).map(option => [option.id, Math.ceil((cutSeconds[option.id] || 10) / 10)]));
  const estimate = calculateOrderPrice(selectedPlanObj ?? { price: null }, initialOptions.filter(o => selectedOptions.includes(o.id)), optionQuantities);

  // 見積りのプラン名＋オプション名の結合
  const planName = selectedPlanObj?.name || "";
  const optNames = selectedOptions.map(id => initialOptions.find(o => o.id === id)?.name).filter(Boolean).join(" + ");
  const detailText = optNames ? `${planName} + ${optNames}` : planName;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "submitting" || retrySeconds > 0) return;
    if (!submissionKey.current) submissionKey.current = crypto.randomUUID();
    setSubmissionId(submissionKey.current);
    setStatus("submitting");
    setErrorMessage("");

    // 作詞状態をバックエンドに送る際に調整する
    let finalLyricsStatus = formData.lyricsStatus;
    if (formData.serviceType === "ORIGINAL") {
      if (isLyricsIncluded) finalLyricsStatus = "作詞含む（フルパッケージ）";
      if (isLyricsProvided) finalLyricsStatus = "歌詞あり（持ち込み）";
    }

    const submissionData = {
      ...formData,
      idempotencyKey: submissionKey.current,
      termsAccepted, termsVersion: TERMS_VERSION,
      planId: formData.planId,
      optionIds: selectedOptions,
      optionQuantities,
      lyricsStatus: finalLyricsStatus
    };

    try {
      await submitForm("/api/orders", submissionData);
      setStatus("success");
    } catch (cause) {
      setErrorMessage(cause instanceof Error ? cause.message : "通信エラーが発生しました。入力内容は保持されています。");
      if (cause instanceof FormSubmissionError) { setRetryUntil(cause.retryUntil); setConflict(cause.code === "IDEMPOTENCY_CONFLICT"); }
      setStatus("error");
    }
  };

  useEffect(() => { if (errorMessage) errorRef.current?.focus(); }, [errorMessage]);

  useEffect(() => {
    if (status === "success") {
      successHeading.current?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [status]);

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg px-4 py-20">
        <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-slate-100 text-center max-w-lg w-full">
          <div className="w-20 h-20 bg-orange-500/10 text-orange-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <h1 ref={successHeading} tabIndex={-1} className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6 text-balance">ご依頼ありがとうございます。</h1>
          <div className="text-slate-600 mb-10 leading-relaxed text-sm sm:text-base text-left bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <p className="mb-4 font-bold text-slate-800 text-center">送信が完了いたしました。</p>
            <p className="text-center">内容を確認のうえ、入力いただいたご連絡先へ通常24時間以内にご返信いたします。</p>
          </div>
          <Button asChild className="w-full sm:w-auto rounded-full px-10 h-14 bg-white border-2 border-orange-500 text-orange-700 font-bold hover:bg-orange-50 hover:text-orange-700 hover:border-orange-600 shadow-sm hover:shadow-md transition-all active:scale-95">
            <Link href="/">トップページに戻る</Link>
          </Button>
        </div>
      </div>
    );
  }

  const inputStyle = "w-full min-h-12 p-3 text-base scroll-mt-40 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all";
  const requiredMark = <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 border border-red-200 align-middle">必須</span>;
  const optionalMark = <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200 align-middle">任意</span>;

  const isMix = formData.serviceType !== "ORIGINAL";
  const isOriginal = formData.serviceType === "ORIGINAL";

  const getOptionDescription = (name: string) => {
    if (name.includes("ボーカルディレクション")) return "オンライン通話でレコーディングのアドバイスや、歌唱表現のサポートを行います。";
    if (name.includes("生楽器演奏追加")) return "ギター・ベース・ピアノ等\n※内容に応じてお見積り";
    return null;
  };


  return (
    <>
    <div className="min-h-screen bg-brand-bg py-10 md:py-20 font-sans">
      <div className="container mx-auto px-4 max-w-3xl relative">
        <div className="text-center mb-6 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">ご依頼フォーム</h1>

          {/* 受付バッジ */}
          {siteSetting && (
            <div className={`mb-4 md:mb-8 inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-white shadow-sm border font-bold text-xs sm:text-sm tracking-wide transition-all mx-auto ${
              siteSetting.orderStatus === "AVAILABLE"
                ? "border-emerald-200 text-emerald-600"
                : siteSetting.orderStatus === "BUSY"
                ? "border-amber-200 text-amber-800"
                : "border-red-200 text-red-600"
            }`}>
              {siteSetting.orderStatus === "AVAILABLE" ? (
                <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-emerald-500"></span>
                </span>
              ) : siteSetting.orderStatus === "BUSY" ? (
                <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-amber-500"></span>
                </span>
              ) : (
                <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                  <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-red-500"></span>
                </span>
              )}
              {siteSetting.orderStatus === "UNAVAILABLE" ? "お知らせ：" : "受付状況："} {siteSetting.announcement || (siteSetting.orderStatus === "AVAILABLE" ? "受付中" : siteSetting.orderStatus === "BUSY" ? "混雑中（納期要相談）" : "現在満枠のため受付を停止しております")}
            </div>
          )}

          <p className="text-slate-600 leading-relaxed max-w-2xl mx-auto">
            ミックス・マスタリング、オリジナル楽曲制作のご依頼はこちらからお願いします。<br/>
            <Link href={`/order?intent=CONSULTATION&service=${formData.serviceType}`} className="inline-flex flex-wrap justify-center gap-x-1 font-bold text-orange-800 underline"><span>プラン未定の方はこちら：</span><span>無料相談・お見積もり</span></Link>
          </p>

          <Link href="/business#contact-form" className="mt-3 inline-flex min-h-11 items-center text-sm text-slate-600 underline underline-offset-4">法人・企業・団体のお問い合わせはこちら</Link>
        </div>

        {/* ご依頼前の確認事項 */}
        <details className="bg-white border border-orange-100 rounded-2xl p-4 mb-4">
          <summary className="cursor-pointer font-bold text-base text-slate-900">
            ご依頼前の準備を確認する
          </summary>
          <ul className="mt-4 space-y-3 text-sm text-slate-600 font-medium relative z-10">
            <li className="flex items-start gap-2"><span className="text-orange-700 mt-0.5">✓</span> {formData.serviceType === "MIX" ? "ボーカルデータは頭出し済みですか？" : "制作の用途や楽曲のイメージをお知らせください。"}</li>
            <li className="flex items-start gap-2"><span className="text-orange-700 mt-0.5">✓</span> {formData.serviceType === "MIX" ? "オケ音源はご用意できていますか？" : "参考曲や歌詞などの資料は、準備できた段階で共有できます。"}</li>
            <li className="flex items-start gap-2"><span className="text-orange-700 mt-0.5">✓</span> 納期の希望はございますか？</li>
            <li className="flex items-start gap-2"><span className="text-orange-700 mt-0.5">✓</span> ご不明な点はお気軽にご相談ください。</li>
          </ul>
        </details>

        {initialSelection.selectionNotice && <p role="status" className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900">{initialSelection.selectionNotice}</p>}
        {errorMessage && <div ref={errorRef} tabIndex={-1} role="alert" className="mb-4 rounded-xl bg-red-50 p-4 text-red-800 focus-visible:outline-2">{errorMessage}{retrySeconds > 0 && <p>再送まであと{retrySeconds}秒</p>}{conflict && <button type="button" onClick={newSubmission} className="block mt-3 rounded-lg border border-red-800 p-3 font-bold">入力内容を引き継いで新しい依頼を作成</button>}</div>}
        <DraftNotice available={draft.available} onRestore={restoreDraft} onClear={draft.clear} />
      <form onInvalidCapture={validation.onInvalidCapture} onChangeCapture={validation.onChangeCapture} onSubmit={handleSubmit} className="space-y-6 md:space-y-8 pb-12 [&_input]:scroll-mt-24 [&_select]:scroll-mt-24 [&_textarea]:scroll-mt-24">

          {/* 01 ご希望のサービス */}
          <section className="bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-5 md:mb-8 flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-700 flex items-center justify-center text-sm font-black tracking-tighter">01</span>
              ご希望のサービス
            </h2>
            <fieldset className="grid md:grid-cols-2 gap-4"><legend className="sr-only">ご希望のサービス</legend>
              <label htmlFor="orderformclient-field-1" className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${formData.serviceType === 'MIX' ? 'border-orange-500 bg-orange-500/5 text-slate-900' : 'border-slate-100 hover:border-orange-500/30 text-slate-600'}`}>
                <input {...validation.field("orderformclient-field-1")} id="orderformclient-field-1" type="radio" name="service" className="w-5 h-5 text-orange-700 focus:ring-orange-500" checked={formData.serviceType === 'MIX'} onChange={() => selectService('MIX')} />{validation.message("orderformclient-field-1")}
                <span className="font-bold">ミックス／マスタリング</span>
              </label>
              <label htmlFor="orderformclient-field-2" className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${formData.serviceType === 'ORIGINAL' ? 'border-orange-500 bg-orange-500/5 text-slate-900' : 'border-slate-100 hover:border-orange-500/30 text-slate-600'}`}>
                <input {...validation.field("orderformclient-field-2")} id="orderformclient-field-2" type="radio" name="service" className="w-5 h-5 text-orange-700 focus:ring-orange-500" checked={formData.serviceType === 'ORIGINAL'} onChange={() => selectService('ORIGINAL')} />{validation.message("orderformclient-field-2")}
                <span className="font-bold">オリジナル楽曲制作</span>
              </label>
              {initialPlans.some(plan => plan.category === "GUIDE") && <label htmlFor="orderformclient-field-3" className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-slate-200 p-5"><input {...validation.field("orderformclient-field-3")} id="orderformclient-field-3" type="radio" name="service" checked={formData.serviceType === "GUIDE"} onChange={() => selectService("GUIDE")} className="size-5" />{validation.message("orderformclient-field-3")}<span className="font-bold">ボーカルガイド作成（単独）</span></label>}
            </fieldset>
            {filteredPlans.length > 0 && (
              <fieldset className="space-y-3 bg-slate-50 p-3 md:p-6 rounded-2xl border border-slate-100 mt-6">
                <legend className="block text-sm font-bold text-brand-text">プランを選択してください {requiredMark}</legend>
                <div className="md:hidden">
                  <label htmlFor="order-plan-select" className="sr-only">ご希望のプラン</label>
                  <select {...validation.field("order-plan-select")} id="order-plan-select" required value={formData.planId} onChange={e => setFormData({ ...formData, planId: e.target.value })} className={inputStyle}>
                    <option value="" disabled>プランを選択してください</option>
                    {filteredPlans.map(plan => <option key={plan.id} value={plan.id}>{plan.name} — {formatYen(plan.price)}</option>)}
                  </select>
                  {validation.message("order-plan-select")}
                  <Link href="/pricing" target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-11 items-center text-sm text-slate-600 underline underline-offset-4">料金・制作範囲を比較する（別タブ）</Link>
                </div>
                <div className="hidden md:grid md:grid-cols-2 gap-4">
                  {filteredPlans.map(plan => (
                    <label htmlFor={"orderformclient-field-4-" + plan.id} key={plan.id} className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex justify-between items-center ${formData.planId === plan.id ? 'border-orange-500 bg-white shadow-sm' : 'border-slate-200 bg-white hover:border-orange-500/50 text-slate-600'}`}>
                      <div className="flex items-center gap-3">
                        <input {...validation.field("orderformclient-field-4-" + plan.id)} id={"orderformclient-field-4-" + plan.id} type="radio" name="plan" checked={formData.planId === plan.id} onChange={() => setFormData({...formData, planId: plan.id})} className="w-5 h-5 text-orange-700 focus:ring-orange-500" />{validation.message("orderformclient-field-4-" + plan.id)}
                        <span className={`font-bold text-sm sm:text-base ${formData.planId === plan.id ? 'text-slate-900' : ''}`}>{plan.name}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
          </section>

          {/* 02 オプション */}
          {initialOptions && initialOptions.filter(opt => opt.category === formData.serviceType || opt.category === "COMMON").length > 0 && (
            <section className="bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-5 md:mb-8 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-700 flex items-center justify-center text-sm font-black tracking-tighter">02</span>
                オプションの追加（任意）
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {initialOptions.filter(opt => (opt.category === formData.serviceType || opt.category === "COMMON") && !isHumanVocalGuide(opt)).map(opt => {
                  const desc = getOptionDescription(opt.name);
                  return (
                    <div key={opt.id}>
                    <label htmlFor={"orderformclient-field-5-" + opt.id} className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col gap-1 ${selectedOptions.includes(opt.id) ? 'border-orange-500 bg-orange-500/5' : 'border-slate-200 bg-slate-50 hover:border-orange-500/30 text-slate-600'}`}>
                      <div className="flex items-start gap-3 w-full">
                        <input {...validation.field("orderformclient-field-5-" + opt.id)} id={"orderformclient-field-5-" + opt.id}
                          type="checkbox"
                          checked={selectedOptions.includes(opt.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedOptions([...selectedOptions, opt.id]);
                            } else {
                              setSelectedOptions(selectedOptions.filter(id => id !== opt.id));
                            }
                          }}
                          className="w-5 h-5 text-orange-700 focus:ring-orange-500 rounded border-slate-300 shrink-0 mt-0.5"
                        />{validation.message("orderformclient-field-5-" + opt.id)}
                        <div className="flex flex-col">
                          <span className={`font-bold text-sm sm:text-base leading-snug ${selectedOptions.includes(opt.id) ? 'text-slate-900' : ''}`}>{opt.name}</span>
                          {desc && <span className="text-xs text-slate-500 mt-1 whitespace-pre-wrap">{desc}</span>}
                        </div>
                      </div>
                      <div className="pl-8 pt-1">
                        <span className="font-bold text-orange-700 text-sm">{opt.priceText}</span>
                      </div>
                    </label>
                    {selectedOptions.includes(opt.id) && opt.name.includes("カットアップ") && <div className="mt-3 space-y-2"><label htmlFor={`cut-${opt.id}`} className="block text-sm font-bold">カットアップする長さ（秒）</label><input {...validation.field(`cut-${opt.id}`)} id={`cut-${opt.id}`} type="number" required min={1} max={3600} step={1} value={cutSeconds[opt.id] ?? 10} onChange={e => setCutSeconds({ ...cutSeconds, [opt.id]: Number(e.target.value) })} className={inputStyle} />{validation.message(`cut-${opt.id}`)}<p className="text-sm text-slate-600">10秒ごとに1単位（端数切り上げ）：{optionQuantities[opt.id]}単位</p></div>}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* 03 基本情報 */}
          <section className="bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-5 md:mb-8 flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-700 flex items-center justify-center text-sm font-black tracking-tighter">03</span>
              基本情報
            </h2>
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="orderformclient-field-6" className="block text-sm font-bold text-brand-text">活動名 / お名前 {requiredMark}</label>
                  <input {...validation.field("orderformclient-field-6")} id="orderformclient-field-6" autoComplete="name" maxLength={120} required type="text" className={inputStyle} placeholder="山田 太郎" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} />{validation.message("orderformclient-field-6")}
                </div>
                <div className="space-y-2">
                  <label htmlFor="orderformclient-field-7" className="block text-sm font-bold text-brand-text">X（旧Twitter）ID {formData.contactMethod === "X (DM)" ? requiredMark : optionalMark}</label>
                  <input {...validation.field("orderformclient-field-7")} id="orderformclient-field-7" required={formData.contactMethod === "X (DM)"} maxLength={16} type="text" className={inputStyle} placeholder="例：@sien_mc09" value={formData.twitterId} onChange={e => setFormData({...formData, twitterId: e.target.value})} />{validation.message("orderformclient-field-7")}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="orderformclient-field-8" className="block text-sm font-bold text-brand-text">メールアドレス {requiredMark}</label>
                  <input {...validation.field("orderformclient-field-8")} id="orderformclient-field-8" autoComplete="email" maxLength={254} required type="email" className={inputStyle} placeholder="example@email.com" value={formData.clientEmail} onChange={e => setFormData({...formData, clientEmail: e.target.value})} />{validation.message("orderformclient-field-8")}
                </div>
                <div className="space-y-2">
                  <label htmlFor="orderformclient-field-9" className="block text-sm font-bold text-brand-text">希望する連絡手段 {requiredMark}</label>
                  <select {...validation.field("orderformclient-field-9")} id="orderformclient-field-9" required className={inputStyle} value={formData.contactMethod} onChange={e => setFormData({...formData, contactMethod: e.target.value})}>
                    <option value="X (DM)">X（旧Twitter）のDM</option>
                    <option value="メール">メール</option>
                    <option value="Discord">Discord</option>
                  </select>{validation.message("orderformclient-field-9")}
                </div>
              </div>

              {/* Discord選択時の案内と入力欄 */}
              {formData.contactMethod === "Discord" && (
                <div className="col-span-1 md:col-span-2 mt-4 p-5 bg-indigo-50 border border-indigo-100 rounded-2xl shadow-sm">
                  <div className="space-y-3">
                    <label htmlFor="orderformclient-field-10" className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>
                      お客様の Discord ID {requiredMark}
                    </label>
                    <p className="text-xs text-indigo-700 font-medium leading-relaxed">
                      ※ご依頼の確認後、こちらからフレンド申請をお送りいたします。<br/>
                      <span className="opacity-80">（すでにフレンド登録がお済みの方は「登録済み」とご記入ください）</span>
                    </p>
                    <input {...validation.field("orderformclient-field-10")} id="orderformclient-field-10" required type="text" className="w-full p-4 rounded-xl border border-indigo-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-800" placeholder="例：sien_mc09 （登録済みの場合は「登録済み」）" value={formData.discordId} onChange={e => setFormData({...formData, discordId: e.target.value})} />{validation.message("orderformclient-field-10")}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* 04 楽曲情報 */}
          <section className="bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-5 md:mb-8 flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-700 flex items-center justify-center text-sm font-black tracking-tighter">04</span>
              楽曲情報
            </h2>
            <div className="space-y-6">

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="orderformclient-field-11" className="block text-sm font-bold text-brand-text">曲名（ない場合は「なし」） {requiredMark}</label>
                  <input {...validation.field("orderformclient-field-11")} id="orderformclient-field-11" required type="text" className={inputStyle} placeholder="例: モニタリング / 未定" value={formData.songTitle} onChange={e => setFormData({...formData, songTitle: e.target.value})} />{validation.message("orderformclient-field-11")}
                </div>
                <div className="space-y-2">
                  <label htmlFor="orderformclient-field-12" className="block text-sm font-bold text-brand-text">ご希望の納期 {optionalMark}</label>
                  <input {...validation.field("orderformclient-field-12")} id="orderformclient-field-12" type="text" className={inputStyle} placeholder="例: 10月末まで" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} />{validation.message("orderformclient-field-12")}
                </div>
              </div>

              {/* ORIGINAL特有の項目 */}
              {isOriginal && (
                <>
                <div className="space-y-2 pt-4 border-t border-slate-100">
                  <label htmlFor="orderformclient-field-13" className="block text-sm font-bold text-brand-text">希望ジャンル {requiredMark}</label>
                  <textarea {...validation.field("orderformclient-field-13")} id="orderformclient-field-13"
                    required
                    rows={6}
                    className={`${inputStyle} resize-none`}
                    placeholder={`例：
・ボカロ系ロック
・アイドルポップ
・バラード
・EDM
・和風ロック
`}
                    value={formData.genre}
                    onChange={e => setFormData({...formData, genre: e.target.value})}></textarea>{validation.message("orderformclient-field-13")}
                </div>

                {/* 作詞の有無（作詞が含まれるプランの場合は自動表示切り替え） */}
                {isLyricsProvided && (
                  <div className="p-4 bg-orange-500/5 rounded-xl border border-orange-200">
                    <p className="text-sm font-bold text-orange-800 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      作詞データをご提出ください
                    </p>
                    <p className="text-xs text-orange-700 mt-2">
                      「自由記述」欄に歌詞を直接貼り付けるか、あるいはテキストファイル(.txt)等を素材提出用URLに同封してください。
                    </p>
                  </div>
                )}

                {!isLyricsProvided && !isLyricsIncluded && (
                  <div className="space-y-2">
                    <label htmlFor="orderformclient-field-14" className="block text-sm font-bold text-brand-text">作詞の有無 {requiredMark}</label>
                    <select {...validation.field("orderformclient-field-14")} id="orderformclient-field-14" required className={inputStyle} value={formData.lyricsStatus} onChange={e => setFormData({...formData, lyricsStatus: e.target.value})}>
                      <option value="歌詞あり">歌詞あり（持ち込み）</option>
                      <option value="作詞から依頼したい">作詞から依頼したい</option>
                      <option value="未定">未定</option>
                    </select>{validation.message("orderformclient-field-14")}
                  </div>
                )}

                <fieldset className="space-y-3 pt-4 border-t border-slate-100" aria-describedby="vocal-guide-help">
                  <legend className="block text-sm font-bold text-brand-text">仮歌の有無 {requiredMark}</legend>
                  <p id="vocal-guide-help" className="text-xs text-slate-500 mb-3">仮歌とは、メロディ確認用の歌唱データです。人間による仮歌は下記料金を概算に加算し、正式見積で確定します。</p>
                  <div className="space-y-3">
                    {VOCAL_GUIDES.filter(opt => opt !== "人間による仮歌" || humanGuideOption).map(opt => (
                      <label htmlFor={"orderformclient-field-15-" + opt} key={opt} className={`flex items-start gap-4 cursor-pointer p-4 rounded-xl border-2 transition-all ${formData.vocalGuideStatus === opt ? 'border-orange-500 bg-orange-500/5' : 'border-transparent hover:bg-slate-50'}`}>
                        <input {...validation.field("orderformclient-field-15-" + opt)} id={"orderformclient-field-15-" + opt} type="radio" name="vocalGuide" className="mt-1 w-5 h-5 text-orange-700 focus:ring-orange-500 shrink-0" checked={formData.vocalGuideStatus === opt} onChange={() => selectVocalGuide(opt)} />{validation.message("orderformclient-field-15-" + opt)}
                        <div className={`font-bold ${formData.vocalGuideStatus === opt ? 'text-slate-900' : 'text-brand-text'}`}>{opt}{opt === "人間による仮歌" && `（+${humanGuideOption?.priceText}・税込）`}</div>
                      </label>
                    ))}
                  </div>
                </fieldset>
                </>
              )}

              {/* MIX特有の項目 */}
              {isMix && (
                <div className="space-y-2">
                  <label htmlFor="orderformclient-field-16" className="block text-sm font-bold text-brand-text">
                    歌唱キー {requiredMark}
                    <HelpTooltip text="ご自身の声に合うキーが分からない場合や、原曲と同じまま歌った場合は「±0（原曲キー）」をお選びください。" />
                  </label>
                  <select {...validation.field("orderformclient-field-16")} id="orderformclient-field-16" required className={inputStyle} value={formData.vocalKey} onChange={e => setFormData({...formData, vocalKey: e.target.value})}>
                    <option value="+6">+6</option>
                    <option value="+5">+5</option>
                    <option value="+4">+4</option>
                    <option value="+3">+3</option>
                    <option value="+2">+2</option>
                    <option value="+1">+1</option>
                    <option value="±0（原曲キー）">±0（原曲キー）</option>
                    <option value="-1">-1</option>
                    <option value="-2">-2</option>
                    <option value="-3">-3</option>
                    <option value="-4">-4</option>
                    <option value="-5">-5</option>
                    <option value="-6">-6</option>
                    <option value="その他">その他</option>
                  </select>{validation.message("orderformclient-field-16")}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="orderformclient-field-17" className="block text-sm font-bold text-brand-text">
                  参考曲 (YouTubeなどのURL) {optionalMark}
                  <HelpTooltip text="「この曲みたいにしてほしい！」「こんな曲調にしてほしい！」という憧れの曲や参考イメージがあればURLを貼ってください。なければ空欄で大丈夫です。" />
                </label>
                <input {...validation.field("orderformclient-field-17")} id="orderformclient-field-17" type="url" className={inputStyle} placeholder="https://..." value={formData.referenceUrl} onChange={e => setFormData({...formData, referenceUrl: e.target.value})} />{validation.message("orderformclient-field-17")}
              </div>

              {isMix && (
                <fieldset className="space-y-3 pt-4 border-t border-slate-100">
                  <legend className="block text-sm font-bold text-brand-text">リファレンス音源の再現度の希望 {optionalMark}</legend>
                  <div className="space-y-3">
                    <label htmlFor="orderformclient-field-18" className={`flex items-start gap-4 cursor-pointer p-4 rounded-xl border-2 transition-all ${formData.referenceFidelity === "1" ? 'border-orange-500 bg-orange-500/5' : 'border-transparent hover:bg-slate-50'}`}>
                      <input {...validation.field("orderformclient-field-18")} id="orderformclient-field-18" type="radio" name="fidelity" className="mt-1 w-5 h-5 text-orange-700 focus:ring-orange-500 shrink-0" checked={formData.referenceFidelity === "1"} onChange={() => setFormData({...formData, referenceFidelity: "1"})} />{validation.message("orderformclient-field-18")}
                      <div>
                        <div className={`font-bold ${formData.referenceFidelity === "1" ? 'text-slate-900' : 'text-brand-text'}`}>1. 完全お任せ</div>
                        <div className="text-sm text-slate-500 mt-1">参考音源は見ますが、全体の方向性はお任せください。</div>
                      </div>
                    </label>
                    <label htmlFor="orderformclient-field-19" className={`flex items-start gap-4 cursor-pointer p-4 rounded-xl border-2 transition-all ${formData.referenceFidelity === "2" ? 'border-orange-500 bg-orange-500/5' : 'border-transparent hover:bg-slate-50'}`}>
                      <input {...validation.field("orderformclient-field-19")} id="orderformclient-field-19" type="radio" name="fidelity" className="mt-1 w-5 h-5 text-orange-700 focus:ring-orange-500 shrink-0" checked={formData.referenceFidelity === "2"} onChange={() => setFormData({...formData, referenceFidelity: "2"})} />{validation.message("orderformclient-field-19")}
                      <div>
                        <div className={`font-bold ${formData.referenceFidelity === "2" ? 'text-slate-900' : 'text-brand-text'}`}>2. 参考にしつつ調整</div>
                        <div className="text-sm text-slate-500 mt-1">参考音源の雰囲気を取り入れながら仕上げます。</div>
                      </div>
                    </label>
                    <label htmlFor="orderformclient-field-20" className={`flex items-start gap-4 cursor-pointer p-4 rounded-xl border-2 transition-all ${formData.referenceFidelity === "3" ? 'border-orange-500 bg-orange-500/5' : 'border-transparent hover:bg-slate-50'}`}>
                      <input {...validation.field("orderformclient-field-20")} id="orderformclient-field-20" type="radio" name="fidelity" className="mt-1 w-5 h-5 text-orange-700 focus:ring-orange-500 shrink-0" checked={formData.referenceFidelity === "3"} onChange={() => setFormData({...formData, referenceFidelity: "3"})} />{validation.message("orderformclient-field-20")}
                      <div>
                        <div className={`font-bold ${formData.referenceFidelity === "3" ? 'text-slate-900' : 'text-brand-text'}`}>3. リファレンス重視</div>
                        <div className="text-sm text-slate-500 mt-1">できる限り参考音源に近い方向で制作します。</div>
                      </div>
                    </label>
                  </div>
                </fieldset>
              )}
            </div>
          </section>

          {/* 05 自由記述 */}
          <section className="bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-5 md:mb-8 flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-700 flex items-center justify-center text-sm font-black tracking-tighter">05</span>
              自由記述
            </h2>
            <div className="space-y-2">
              <label htmlFor="orderformclient-field-21" className="block text-sm font-bold text-brand-text">ご要望・ご質問・特記事項など {optionalMark}</label>
              <textarea {...validation.field("orderformclient-field-21")} id="orderformclient-field-21"
                rows={6}
                className={`${inputStyle} resize-none`}
                placeholder={`例：
・本家寄りで仕上げてほしい
・かわいく明るい雰囲気にしたい
・ハモリ生成を希望
・〇〇様のMIXのような音作りを希望`}
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}></textarea>{validation.message("orderformclient-field-21")}
            </div>
          </section>

          {/* 06 素材提出 */}
            <section className="bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-5 md:mb-8 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-700 flex items-center justify-center text-sm font-black tracking-tighter">06</span>
                素材提出
              </h2>
              <div className="space-y-4">
                <label htmlFor="orderformclient-field-22" className="block text-sm font-bold text-brand-text">
                  歌詞・参考資料・音源の共有URL {optionalMark}
                  <HelpTooltip text={formData.serviceType === "MIX" ? "ボーカルデータ（WAV推奨）とカラオケ音源をまとめて共有してください。準備中の場合は後から提出できます。" : "歌詞・参考曲・楽譜など、制作に必要な資料の共有URLを記入してください。準備中の場合は後から提出できます。"} />
                </label>
                <input {...validation.field("orderformclient-field-22")} id="orderformclient-field-22" type="url" className={inputStyle} placeholder="Gigafile便、Google DriveなどのURL" value={formData.materialsUrl} onChange={e => setFormData({...formData, materialsUrl: e.target.value})} />{validation.message("orderformclient-field-22")}
              </div>
            </section>

          {/* 07 お支払い方法 */}
          <section className="bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-5 md:mb-8 flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-700 flex items-center justify-center text-sm font-black tracking-tighter">07</span>
              お支払い方法
            </h2>
            <div className="space-y-2">
              <label htmlFor="orderformclient-field-23" className="block text-sm font-bold text-brand-text">お支払い方法 {requiredMark}</label>
              <select {...validation.field("orderformclient-field-23")} id="orderformclient-field-23" required className={inputStyle} value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value})}>
                <option value="銀行振込">銀行振込</option>
                <option value="クレジットカード">クレジットカード</option>
                <option value="その他">その他</option>
              </select>{validation.message("orderformclient-field-23")}
            </div>
          </section>

          {/* 送信とリアルタイム見積もり */}
          <div id="order-review" className="scroll-mt-24 bg-orange-50 border border-orange-100 p-5 md:p-10 rounded-3xl shadow-2xl flex flex-col items-center gap-6 md:gap-10 mx-auto w-full mt-6 md:mt-16 relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>

            <div className="text-center relative z-10 w-full">
              <p className="text-orange-700 text-sm font-bold mb-2 tracking-widest uppercase">現在のお見積り概算</p>
              <div className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
                ¥{estimate.total.toLocaleString()}
                <span className="text-base font-normal text-slate-500 ml-2">税込</span>
              </div>

              <div className="mt-4 text-sm font-bold text-orange-700 bg-white/50 inline-block px-4 py-2 rounded-full border border-orange-200">
                {detailText}
              </div>

              {estimate.hasConsultation && (
                <p className="text-sm text-brand-amber mt-3 flex items-center justify-center gap-1.5 font-medium">
                  <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  要相談の項目が含まれています。
                </p>
              )}
              <div className="text-xs text-slate-500 mt-4 font-medium">
                ※正式なお見積りは、トラック数・修正内容・オプションによって変動する場合があります。
              </div>

              {formData.serviceType === "MIX" && (
                <div className="mt-6 text-sm text-slate-700 bg-white/60 backdrop-blur-sm p-4 md:p-5 rounded-2xl border border-orange-200/60 shadow-sm text-left leading-relaxed max-w-2xl mx-auto">
                  <div className="font-bold text-orange-700 flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    追加料金に関するお知らせ
                  </div>
                  <p>
                    制作難易度の高い楽曲（Giga様・TeddyLoid様のような複雑なアレンジの楽曲など）や、トラック数が多い場合（目安：10トラック以上）は、音源の内容や作業量を確認したうえで、<span className="font-bold text-orange-700">1,000円〜10,000円の追加料金</span>をご案内させていただく場合がございます。
                  </p>
                </div>
              )}
            </div>

            <div className="w-full flex flex-col items-center relative z-10 border-t border-orange-200/50 pt-8">
              <label htmlFor="orderformclient-field-24" className="flex items-center justify-center gap-3 cursor-pointer mb-6 text-slate-700 hover:text-slate-900 transition-colors group">
                <input {...validation.field("orderformclient-field-24")} id="orderformclient-field-24" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} required type="checkbox" className="w-5 h-5 text-orange-700 rounded border-slate-300 focus:ring-orange-500 focus:ring-offset-white bg-white" />{validation.message("orderformclient-field-24")}
                <span className="font-bold text-sm md:text-base">
                  <a href="/policy/guidelines" target="_blank" rel="noopener noreferrer" className="text-orange-700 hover:text-orange-700 underline underline-offset-4 decoration-orange-500/50 transition-colors mx-1">
                    ご依頼に関する留意事項
                  </a>
                  ・<a href="/policy/privacy" target="_blank" rel="noopener noreferrer" className="text-orange-700 underline">プライバシーポリシー</a>に同意する {requiredMark}
                </span>
              </label>

              <div className="w-full max-w-md flex flex-col items-center gap-3">
                <p className="text-sm font-bold text-slate-600">送信後、原則24時間以内にご返信いたします。</p>
                <Button type="submit" disabled={status === "submitting" || retrySeconds > 0} className="w-full px-6 h-12 md:h-16 text-base md:text-lg font-bold rounded-full shadow-xl shadow-orange-500/20 bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:brightness-95 hover:scale-105 transition-all">
                  {status === "submitting" ? "送信中..." : "ご依頼を送信する"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
    </>
  );
}
