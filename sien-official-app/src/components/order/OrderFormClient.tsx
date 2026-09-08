"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  category: string;
  price: number | null;
}

interface Option {
  id: string;
  name: string;
  category: string;
  priceText: string;
}

// PolicyModal was removed in favor of linking directly to /policy/guidelines

const HelpTooltip = ({ text }: { text: string }) => (
  <span className="relative group/tooltip inline-block ml-2 cursor-help align-middle">
    <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-500 text-[10px] flex items-center justify-center font-bold hover:bg-orange-500 hover:text-white transition-colors">?</span>
    <span className="absolute bottom-full -left-4 mb-2 w-64 p-3 bg-white border border-slate-200 text-slate-700 text-xs rounded-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50 text-left shadow-xl font-normal leading-relaxed">
      {text}
      <span className="absolute top-full left-6 -translate-x-1/2 border-4 border-transparent border-t-white z-10"></span>
      <span className="absolute top-full left-6 -translate-x-1/2 border-4 border-transparent border-t-slate-200" style={{ marginTop: '1px' }}></span>
    </span>
  </span>
);

export default function OrderFormClient({ initialPlans, initialOptions = [], siteSetting }: { initialPlans: Plan[], initialOptions?: Option[], siteSetting?: any }) {
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    twitterId: "",
    discordId: "",
    contactMethod: "X (DM)",
    isRepeater: false,
    serviceType: "MIX",
    planId: "",
    songTitle: "",
    options: "",
    vocalKey: "±0（原曲キー）",
    referenceUrl: "",
    referenceFidelity: "1",
    materialsUrl: "",
    paymentMethod: "銀行振込",
    deadline: "",
    message: "",
    activityPurpose: "歌ってみた投稿",
    genre: "",
    lyricsStatus: "未定",
    vocalGuideStatus: "不要",
  });
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const filteredPlans = initialPlans.filter(p => p.category === formData.serviceType);
  const selectedPlanObj = initialPlans.find(p => p.id === formData.planId);
  const isLyricsIncluded = selectedPlanObj?.name.includes("フルパッケージ");
  const isLyricsProvided = selectedPlanObj?.name.includes("作詞持ち込み");

  useEffect(() => {
    if (filteredPlans.length > 0 && !filteredPlans.some(p => p.id === formData.planId)) {
      setFormData(prev => ({ ...prev, planId: filteredPlans[0].id }));
    }
  }, [formData.serviceType, filteredPlans]);

  useEffect(() => {
    // サービスタイプが変わった時の活動用途の初期値リセット
    if (formData.serviceType === "ORIGINAL") {
      setFormData(prev => ({ ...prev, activityPurpose: "YouTubeオリジナル曲" }));
    } else {
      setFormData(prev => ({ ...prev, activityPurpose: "歌ってみた投稿" }));
    }
    // オプション選択をリセットする
    setSelectedOptions([]);
  }, [formData.serviceType]);

  const calculateTotal = () => {
    let basePrice = 0;
    let optionPrice = 0;
    let total = 0;
    let hasConsultation = false;

    if (selectedPlanObj) {
      if (selectedPlanObj.price === null) {
        hasConsultation = true;
      } else {
        basePrice += selectedPlanObj.price;
        total += selectedPlanObj.price;
      }
    }

    // エンコード以外のオプションを先に計算
    selectedOptions.filter(optId => {
      const opt = initialOptions.find(o => o.id === optId);
      return opt && !opt.name.includes("エンコード");
    }).forEach(optId => {
      const opt = initialOptions.find(o => o.id === optId);
      if (opt) {
        if (opt.priceText.includes("要相談")) {
          hasConsultation = true;
        } else {
          const priceMatch = opt.priceText.match(/[0-9,]+/);
          if (priceMatch) {
            const priceStr = priceMatch[0].replace(/,/g, "");
            const val = parseInt(priceStr, 10);
            optionPrice += val;
            total += val;
          }
          if (opt.priceText.includes("〜") || opt.priceText.includes("~")) {
            hasConsultation = true;
          }
        }
      }
    });

    // 最後にエンコードの計算（10,000円未満なら1,000円加算）
    const hasEncode = selectedOptions.some(optId => {
      const opt = initialOptions.find(o => o.id === optId);
      return opt && opt.name.includes("エンコード");
    });

    if (hasEncode) {
      if (total < 10000) {
        optionPrice += 1000;
        total += 1000;
      }
    }

    return { basePrice, optionPrice, total, hasConsultation };
  };

  const estimate = calculateTotal();
  
  // 見積りのプラン名＋オプション名の結合
  const planName = selectedPlanObj?.name || "";
  const optNames = selectedOptions.map(id => initialOptions.find(o => o.id === id)?.name).filter(Boolean).join(" + ");
  const detailText = optNames ? `${planName} + ${optNames}` : planName;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    const optionsText = selectedOptions.map(id => {
      const opt = initialOptions?.find(o => o.id === id);
      return opt ? `${opt.name} (${opt.priceText})` : "";
    }).filter(Boolean).join(", ");

    // 作詞状態をバックエンドに送る際に調整する
    let finalLyricsStatus = formData.lyricsStatus;
    if (formData.serviceType === "ORIGINAL") {
      if (isLyricsIncluded) finalLyricsStatus = "作詞含む（フルパッケージ）";
      if (isLyricsProvided) finalLyricsStatus = "歌詞あり（持ち込み）";
    }

    const selectedPlanObj = initialPlans?.find(p => p.id === formData.planId);

    const submissionData = {
      ...formData,
      planId: selectedPlanObj?.name || formData.planId, // 保存するplanIdをプランの日本語名にする
      options: optionsText,
      lyricsStatus: finalLyricsStatus,
      price: estimate.total,
      basePrice: estimate.basePrice,
      optionPrice: estimate.optionPrice
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData)
      });
      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch (err) {
      setStatus("error");
    }
  };

  useEffect(() => {
    if (status === "success") {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [status]);

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg px-4 py-20">
        <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-slate-100 text-center max-w-lg w-full">
          <div className="w-20 h-20 bg-orange-500/10 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">ご依頼ありがとうございます</h2>
          <div className="text-slate-600 mb-10 leading-relaxed text-sm sm:text-base text-left bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <p className="mb-4 font-bold text-slate-800 text-center">送信が完了いたしました。</p>
            <p className="text-center">内容を確認のうえ、入力いただいたご連絡先へ通常24時間以内にご返信いたします。</p>
          </div>
          <Button asChild className="w-full sm:w-auto rounded-full px-10 h-14 bg-white border-2 border-orange-500 text-orange-600 font-bold hover:bg-orange-50 hover:text-orange-700 hover:border-orange-600 shadow-sm hover:shadow-md transition-all active:scale-95">
            <a href="/">トップページに戻る</a>
          </Button>
        </div>
      </div>
    );
  }

  const inputStyle = "w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all";
  const requiredMark = <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 border border-red-200 align-middle relative -top-0.5">必須</span>;
  const optionalMark = <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200 align-middle relative -top-0.5">任意</span>;

  const isMix = formData.serviceType === "MIX";
  const isOriginal = formData.serviceType === "ORIGINAL";

  const getOptionDescription = (name: string) => {
    if (name.includes("ボーカルディレクション")) return "オンライン通話でレコーディングのアドバイスや、歌唱表現のサポートを行います。";
    if (name.includes("生楽器演奏追加")) return "ギター・ベース・ピアノ等\n※内容に応じてお見積り";
    return null;
  };

  const mixPurposes = ["歌ってみた投稿", "YouTubeオリジナル曲", "ライブ用", "CD収録", "配信OP・ED", "その他"];
  const originalPurposes = ["YouTubeオリジナル曲", "周年記念楽曲", "ライブ用", "配信OP・ED", "CD収録", "その他"];
  const currentPurposes = isMix ? mixPurposes : originalPurposes;

  return (
    <>
    <div className="min-h-screen bg-brand-bg py-20 font-sans">
      <div className="container mx-auto px-4 max-w-3xl relative">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-6">ご依頼フォーム</h1>
          
          {/* 受付バッジ */}
          {siteSetting && (
            <div className={`mb-8 inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-white shadow-sm border font-bold text-xs sm:text-sm tracking-wide transition-all mx-auto ${
              siteSetting.orderStatus === "AVAILABLE" 
                ? "border-emerald-200 text-emerald-600" 
                : siteSetting.orderStatus === "BUSY"
                ? "border-amber-200 text-amber-600"
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
            ※まだ依頼するか決まっていなくても、ご相談・お見積りのみでご利用いただけます。
          </p>

          <div className="mt-8 inline-block bg-white px-6 md:px-8 py-5 rounded-2xl border border-slate-200 shadow-sm text-sm text-center">
            <p className="text-slate-700 font-medium mb-3">法人のお客様、企業・団体様からの案件・業務提携等のご相談はこちら</p>
            <a href="/business#contact-form" className="inline-flex items-center justify-center gap-2 text-orange-600 font-bold hover:text-orange-700 hover:underline bg-orange-50 hover:bg-orange-100 px-6 py-2.5 rounded-full transition-colors">
              法人向け お問い合わせ・ご相談フォームへ
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </a>
          </div>
        </div>

        {/* ご依頼前の確認事項 */}
        <div className="bg-white border-2 border-orange-100 rounded-3xl p-6 md:p-8 mb-12 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2 relative z-10">
            <CheckCircle2 className="w-5 h-5 text-orange-500" />
            ご依頼前にご確認ください
          </h3>
          <ul className="space-y-3 text-slate-600 font-medium relative z-10">
            <li className="flex items-start gap-2"><span className="text-orange-500 mt-0.5">✓</span> ボーカルデータは頭出し済みですか？</li>
            <li className="flex items-start gap-2"><span className="text-orange-500 mt-0.5">✓</span> オケ音源はご用意できていますか？</li>
            <li className="flex items-start gap-2"><span className="text-orange-500 mt-0.5">✓</span> 納期の希望はございますか？</li>
            <li className="flex items-start gap-2"><span className="text-orange-500 mt-0.5">✓</span> ご不明な点はお気軽にご相談ください。</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12 pb-32">
          
          {/* 01 ご希望のサービス */}
          <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center text-sm font-black tracking-tighter">01</span>
              ご希望のサービス
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <label className={`cursor-pointer p-5 rounded-2xl border-2 transition-all flex items-center gap-3 ${formData.serviceType === 'MIX' ? 'border-orange-500 bg-orange-500/5 text-slate-900' : 'border-slate-100 hover:border-orange-500/30 text-slate-600'}`}>
                <input type="radio" name="service" className="w-5 h-5 text-orange-500 focus:ring-orange-500" checked={formData.serviceType === 'MIX'} onChange={() => setFormData({...formData, serviceType: 'MIX'})} />
                <span className="font-bold">ミックス／マスタリング</span>
              </label>
              <label className={`cursor-pointer p-5 rounded-2xl border-2 transition-all flex items-center gap-3 ${formData.serviceType === 'ORIGINAL' ? 'border-orange-500 bg-orange-500/5 text-slate-900' : 'border-slate-100 hover:border-orange-500/30 text-slate-600'}`}>
                <input type="radio" name="service" className="w-5 h-5 text-orange-500 focus:ring-orange-500" checked={formData.serviceType === 'ORIGINAL'} onChange={() => setFormData({...formData, serviceType: 'ORIGINAL'})} />
                <span className="font-bold">オリジナル楽曲制作</span>
              </label>
            </div>
            {filteredPlans.length > 0 && (
              <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100 mt-6">
                <label className="text-sm font-bold text-brand-text">プランを選択してください {requiredMark}</label>
                <div className="grid md:grid-cols-2 gap-4">
                  {filteredPlans.map(plan => (
                    <label key={plan.id} className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex justify-between items-center ${formData.planId === plan.id ? 'border-orange-500 bg-white shadow-sm' : 'border-slate-200 bg-white hover:border-orange-500/50 text-slate-600'}`}>
                      <div className="flex items-center gap-3">
                        <input type="radio" name="plan" checked={formData.planId === plan.id} onChange={() => setFormData({...formData, planId: plan.id})} className="w-5 h-5 text-orange-500 focus:ring-orange-500" />
                        <span className={`font-bold text-sm sm:text-base ${formData.planId === plan.id ? 'text-slate-900' : ''}`}>{plan.name}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* 02 オプション */}
          {initialOptions && initialOptions.filter(opt => opt.category === formData.serviceType || opt.category === "COMMON").length > 0 && (
            <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center text-sm font-black tracking-tighter">02</span>
                オプションの追加（任意）
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {initialOptions.filter(opt => opt.category === formData.serviceType || opt.category === "COMMON").map(opt => {
                  const desc = getOptionDescription(opt.name);
                  return (
                    <label key={opt.id} className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col gap-1 ${selectedOptions.includes(opt.id) ? 'border-orange-500 bg-orange-500/5' : 'border-slate-200 bg-slate-50 hover:border-orange-500/30 text-slate-600'}`}>
                      <div className="flex items-start gap-3 w-full">
                        <input 
                          type="checkbox" 
                          checked={selectedOptions.includes(opt.id)} 
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedOptions([...selectedOptions, opt.id]);
                            } else {
                              setSelectedOptions(selectedOptions.filter(id => id !== opt.id));
                            }
                          }}
                          className="w-5 h-5 text-orange-500 focus:ring-orange-500 rounded border-slate-300 shrink-0 mt-0.5" 
                        />
                        <div className="flex flex-col">
                          <span className={`font-bold text-sm sm:text-base leading-snug ${selectedOptions.includes(opt.id) ? 'text-slate-900' : ''}`}>{opt.name}</span>
                          {desc && <span className="text-xs text-slate-500 mt-1 whitespace-pre-wrap">{desc}</span>}
                        </div>
                      </div>
                      <div className="pl-8 pt-1">
                        <span className="font-bold text-orange-500 text-sm">{opt.priceText}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </section>
          )}

          {/* 03 基本情報 */}
          <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center text-sm font-black tracking-tighter">03</span>
              基本情報
            </h2>
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-brand-text">活動名 / お名前 {requiredMark}</label>
                  <input required type="text" className={inputStyle} placeholder="山田 太郎" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-brand-text">X (Twitter) ID {optionalMark}</label>
                  <input type="text" className={inputStyle} placeholder="例：@sien_mc09" value={formData.twitterId} onChange={e => setFormData({...formData, twitterId: e.target.value})} />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-brand-text">メールアドレス {requiredMark}</label>
                  <input required type="email" className={inputStyle} placeholder="example@email.com" value={formData.clientEmail} onChange={e => setFormData({...formData, clientEmail: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-brand-text">希望する連絡手段 {requiredMark}</label>
                  <select required className={inputStyle} value={formData.contactMethod} onChange={e => setFormData({...formData, contactMethod: e.target.value})}>
                    <option value="X (DM)">X (DM)</option>
                    <option value="メール">メール</option>
                    <option value="Discord">Discord</option>
                  </select>
                </div>
              </div>

              {/* Discord選択時の案内と入力欄 */}
              {formData.contactMethod === "Discord" && (
                <div className="col-span-1 md:col-span-2 mt-4 p-5 bg-indigo-50 border border-indigo-100 rounded-2xl shadow-sm">
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>
                      お客様の Discord ID {requiredMark}
                    </label>
                    <p className="text-xs text-indigo-700 font-medium leading-relaxed">
                      ※ご依頼の確認後、こちらからフレンド申請をお送りいたします。<br/>
                      <span className="opacity-80">（すでにフレンド登録がお済みの方は「登録済み」とご記入ください）</span>
                    </p>
                    <input required type="text" className="w-full p-4 rounded-xl border border-indigo-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-800" placeholder="例：sien_mc09 （登録済みの場合は「登録済み」）" value={formData.discordId} onChange={e => setFormData({...formData, discordId: e.target.value})} />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* 04 楽曲情報 */}
          <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center text-sm font-black tracking-tighter">04</span>
              楽曲情報
            </h2>
            <div className="space-y-6">
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-brand-text">曲名 (ない場合は"なし") {requiredMark}</label>
                  <input required type="text" className={inputStyle} placeholder="例: モニタリング / 未定" value={formData.songTitle} onChange={e => setFormData({...formData, songTitle: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-brand-text">ご希望の納期 {optionalMark}</label>
                  <input type="text" className={inputStyle} placeholder="例: 10月末まで" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} />
                </div>
              </div>

              {/* ORIGINAL特有の項目 */}
              {isOriginal && (
                <>
                <div className="space-y-2 pt-4 border-t border-slate-100">
                  <label className="text-sm font-bold text-brand-text">希望ジャンル {requiredMark}</label>
                  <textarea 
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
                    onChange={e => setFormData({...formData, genre: e.target.value})}></textarea>
                </div>
                
                {/* 作詞の有無（作詞が含まれるプランの場合は自動表示切り替え） */}
                {isLyricsProvided && (
                  <div className="p-4 bg-orange-500/5 rounded-xl border border-orange-200">
                    <label className="text-sm font-bold text-orange-800 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      作詞データをご提出ください
                    </label>
                    <p className="text-xs text-orange-700 mt-2">
                      「自由記述」欄に歌詞を直接貼り付けるか、あるいはテキストファイル(.txt)等を素材提出用URLに同封してください。
                    </p>
                  </div>
                )}
                
                {!isLyricsProvided && !isLyricsIncluded && (
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-brand-text">作詞の有無 {requiredMark}</label>
                    <select required className={inputStyle} value={formData.lyricsStatus} onChange={e => setFormData({...formData, lyricsStatus: e.target.value})}>
                      <option value="歌詞あり">歌詞あり（持ち込み）</option>
                      <option value="作詞から依頼したい">作詞から依頼したい</option>
                      <option value="未定">未定</option>
                    </select>
                  </div>
                )}

                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <label className="text-sm font-bold text-brand-text">仮歌の有無 {requiredMark}</label>
                  <p className="text-xs text-slate-500 mb-3">仮歌とは、メロディ確認用の歌唱データです。</p>
                  <div className="space-y-3">
                    {["ボーカロイド仮歌（無料）", "人間による仮歌（+5,000円〜）", "不要"].map(opt => (
                      <label key={opt} className={`flex items-start gap-4 cursor-pointer p-4 rounded-xl border-2 transition-all ${formData.vocalGuideStatus === opt ? 'border-orange-500 bg-orange-500/5' : 'border-transparent hover:bg-slate-50'}`}>
                        <input type="radio" className="mt-1 w-5 h-5 text-orange-500 focus:ring-orange-500 shrink-0" checked={formData.vocalGuideStatus === opt} onChange={() => setFormData({...formData, vocalGuideStatus: opt})} />
                        <div className={`font-bold ${formData.vocalGuideStatus === opt ? 'text-slate-900' : 'text-brand-text'}`}>{opt}</div>
                      </label>
                    ))}
                  </div>
                </div>
                </>
              )}

              {/* MIX特有の項目 */}
              {isMix && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-brand-text">
                    歌唱キー {requiredMark}
                    <HelpTooltip text="ご自身の声に合うキーが分からない場合や、原曲と同じまま歌った場合は「±0（原曲キー）」をお選びください。" />
                  </label>
                  <select required className={inputStyle} value={formData.vocalKey} onChange={e => setFormData({...formData, vocalKey: e.target.value})}>
                    <option value="+6">+6</option>
                    <option value="+5">+5</option>
                    <option value="+4">+4</option>
                    <option value="+3">+3</option>
                    <option value="+2">+2（原曲より2つ上）</option>
                    <option value="+1">+1</option>
                    <option value="±0（原曲キー）">±0（原曲キー）</option>
                    <option value="-1">-1</option>
                    <option value="-2">-2</option>
                    <option value="-3">-3（原曲より3つ下）</option>
                    <option value="-4">-4</option>
                    <option value="-5">-5</option>
                    <option value="-6">-6</option>
                    <option value="その他">その他</option>
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-bold text-brand-text">
                  参考曲 (YouTubeなどのURL) {optionalMark}
                  <HelpTooltip text="「この曲みたいにしてほしい！」「こんな曲調にしてほしい！」という憧れの曲や参考イメージがあればURLを貼ってください。なければ空欄で大丈夫です。" />
                </label>
                <input type="url" className={inputStyle} placeholder="https://..." value={formData.referenceUrl} onChange={e => setFormData({...formData, referenceUrl: e.target.value})} />
              </div>

              {isMix && (
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <label className="text-sm font-bold text-brand-text">リファレンス音源の再現度の希望 {optionalMark}</label>
                  <div className="space-y-3">
                    <label className={`flex items-start gap-4 cursor-pointer p-4 rounded-xl border-2 transition-all ${formData.referenceFidelity === "1" ? 'border-orange-500 bg-orange-500/5' : 'border-transparent hover:bg-slate-50'}`}>
                      <input type="radio" name="fidelity" className="mt-1 w-5 h-5 text-orange-500 focus:ring-orange-500 shrink-0" checked={formData.referenceFidelity === "1"} onChange={() => setFormData({...formData, referenceFidelity: "1"})} />
                      <div>
                        <div className={`font-bold ${formData.referenceFidelity === "1" ? 'text-slate-900' : 'text-brand-text'}`}>1. 完全お任せ</div>
                        <div className="text-sm text-slate-500 mt-1">参考音源は見ますが、全体の方向性はお任せください。</div>
                      </div>
                    </label>
                    <label className={`flex items-start gap-4 cursor-pointer p-4 rounded-xl border-2 transition-all ${formData.referenceFidelity === "2" ? 'border-orange-500 bg-orange-500/5' : 'border-transparent hover:bg-slate-50'}`}>
                      <input type="radio" name="fidelity" className="mt-1 w-5 h-5 text-orange-500 focus:ring-orange-500 shrink-0" checked={formData.referenceFidelity === "2"} onChange={() => setFormData({...formData, referenceFidelity: "2"})} />
                      <div>
                        <div className={`font-bold ${formData.referenceFidelity === "2" ? 'text-slate-900' : 'text-brand-text'}`}>2. 参考にしつつ調整</div>
                        <div className="text-sm text-slate-500 mt-1">参考音源の雰囲気を取り入れながら仕上げます。</div>
                      </div>
                    </label>
                    <label className={`flex items-start gap-4 cursor-pointer p-4 rounded-xl border-2 transition-all ${formData.referenceFidelity === "3" ? 'border-orange-500 bg-orange-500/5' : 'border-transparent hover:bg-slate-50'}`}>
                      <input type="radio" name="fidelity" className="mt-1 w-5 h-5 text-orange-500 focus:ring-orange-500 shrink-0" checked={formData.referenceFidelity === "3"} onChange={() => setFormData({...formData, referenceFidelity: "3"})} />
                      <div>
                        <div className={`font-bold ${formData.referenceFidelity === "3" ? 'text-slate-900' : 'text-brand-text'}`}>3. リファレンス重視</div>
                        <div className="text-sm text-slate-500 mt-1">できる限り参考音源に近い方向で制作します。</div>
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* 05 自由記述 */}
          <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center text-sm font-black tracking-tighter">05</span>
              自由記述
            </h2>
            <div className="space-y-2">
              <label className="text-sm font-bold text-brand-text">ご要望・ご質問・特記事項など {optionalMark}</label>
              <textarea 
                rows={6} 
                className={`${inputStyle} resize-none`} 
                placeholder={`例：
・本家寄りで仕上げてほしい
・かわいく明るい雰囲気にしたい
・ハモリ生成を希望
・〇〇様のMIXのような音作りを希望`} 
                value={formData.message} 
                onChange={e => setFormData({...formData, message: e.target.value})}></textarea>
            </div>
          </section>

          {/* 06 素材提出 */}
          {isMix && (
            <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center text-sm font-black tracking-tighter">06</span>
                素材提出
              </h2>
              <div className="space-y-4">
                <label className="text-sm font-bold text-brand-text">
                  レコーディング済み音源のアップロードURL {optionalMark}
                  <HelpTooltip text="ボーカルデータ（WAV推奨）とカラオケ音源をGigaFile便などで一つにまとめ、URLを貼り付けてください。まだ録音中の方は空欄のままでOKです！" />
                </label>
                <input type="url" className={inputStyle} placeholder="Gigafile便、Google DriveなどのURL" value={formData.materialsUrl} onChange={e => setFormData({...formData, materialsUrl: e.target.value})} />
                {/* 一旦非表示
                <div className="mt-5 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200/60">
                    <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>頭出し済みの <strong>WAVデータ</strong> を推奨しております。</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm text-orange-800 bg-orange-50 p-4 rounded-xl border border-orange-200/60 shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <p className="leading-relaxed pt-0.5">
                      <strong className="block text-[15px] mb-1">まだ素材がなくてもご依頼可能です！</strong>
                      現在録音中・準備中の場合でも、枠の確保として先にご依頼いただけます。<br />
                      <span className="text-orange-600 text-xs">※その場合はURLを空欄のまま送信してください。</span>
                    </p>
                  </div>
                </div>
                */}
              </div>
            </section>
          )}

          {/* 07 お支払い方法 */}
          <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center text-sm font-black tracking-tighter">{isMix ? "07" : "06"}</span>
              お支払い方法
            </h2>
            <div className="space-y-2">
              <label className="text-sm font-bold text-brand-text">お支払い方法 {requiredMark}</label>
              <select required className={inputStyle} value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value})}>
                <option value="銀行振込">銀行振込</option>
                <option value="クレジットカード">クレジットカード</option>
                <option value="その他">その他</option>
              </select>
            </div>
          </section>

          {/* 送信とリアルタイム見積もり */}
          <div className="bg-orange-50 border border-orange-100 p-6 md:p-10 rounded-3xl shadow-2xl flex flex-col items-center gap-8 md:gap-10 mx-auto w-full mt-12 md:mt-16 relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>
            
            <div className="text-center relative z-10 w-full">
              <p className="text-orange-600 text-sm font-bold mb-2 tracking-widest uppercase">現在のお見積り概算</p>
              <div className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                ¥{estimate.total.toLocaleString()}
                <span className="text-base font-normal text-slate-500 ml-2">税込</span>
              </div>
              
              <div className="mt-4 text-sm font-bold text-orange-600 bg-white/50 inline-block px-4 py-2 rounded-full border border-orange-200">
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

              {isMix && (
                <div className="mt-6 text-sm text-slate-700 bg-white/60 backdrop-blur-sm p-4 md:p-5 rounded-2xl border border-orange-200/60 shadow-sm text-left leading-relaxed max-w-2xl mx-auto">
                  <div className="font-bold text-orange-700 flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    追加料金に関するお知らせ
                  </div>
                  <p>
                    制作難易度の高い楽曲（Giga様・TeddyLoid様のような複雑なアレンジの楽曲など）や、トラック数が多い場合（目安：10トラック以上）は、音源の内容や作業量を確認したうえで、<span className="font-bold text-orange-600">1,000円〜10,000円の追加料金</span>をご案内させていただく場合がございます。
                  </p>
                </div>
              )}
            </div>
            
            <div className="w-full flex flex-col items-center relative z-10 border-t border-orange-200/50 pt-8">
              <label className="flex items-center justify-center gap-3 cursor-pointer mb-6 text-slate-700 hover:text-slate-900 transition-colors group">
                <input required type="checkbox" className="w-5 h-5 text-orange-500 rounded border-slate-300 focus:ring-orange-500 focus:ring-offset-white bg-white" />
                <span className="font-bold text-sm md:text-base">
                  <a href="/policy/guidelines" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-700 underline underline-offset-4 decoration-orange-500/50 transition-colors mx-1">
                    ご依頼に関する留意事項
                  </a>
                  に同意する {requiredMark}
                </span>
              </label>
              
              <div className="w-full max-w-md flex flex-col items-center gap-3">
                <p className="text-sm font-bold text-slate-600">送信後、24時間以内にご返信いたします。</p>
                <Button type="submit" disabled={status === "submitting"} className="w-full px-12 h-16 text-lg font-bold rounded-full shadow-xl shadow-orange-500/20 bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:brightness-110 hover:scale-105 transition-all">
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
