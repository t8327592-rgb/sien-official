import fs from 'fs';

const code = `"use client";

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

const PolicyModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-brand-bg shrink-0">
          <h3 className="text-xl font-bold text-slate-900">ご依頼に関する留意事項</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-full w-8 h-8 flex items-center justify-center transition-colors">✕</button>
        </div>
        <div className="p-8 overflow-y-auto text-brand-text space-y-8 text-sm leading-relaxed">
          <section>
            <h4 className="font-bold text-slate-900 border-l-4 border-orange-500 pl-3 mb-3 text-base">第1条（ご依頼の成立・お支払い）</h4>
            <ul className="list-disc list-inside space-y-2 text-slate-600 pl-1">
              <li>お見積り金額に合意いただき、ご入金が確認できた時点で正式なご依頼（作業開始）となります。</li>
              <li>お支払い方法は銀行振込または各種決済サービス（要相談）となります。振込手数料はお客様負担となります。</li>
            </ul>
          </section>
          <section>
            <h4 className="font-bold text-slate-900 border-l-4 border-orange-500 pl-3 mb-3 text-base">第2条（修正対応について）</h4>
            <ul className="list-disc list-inside space-y-2 text-slate-600 pl-1">
              <li>各プランに定められた回数まで「無料修正」を承ります。</li>
              <li>無料修正回数を超過した修正、または「最初のご要望から大きく逸脱する大幅な修正」については、別途追加料金が発生する場合がございます。</li>
            </ul>
          </section>
          <section>
            <h4 className="font-bold text-slate-900 border-l-4 border-orange-500 pl-3 mb-3 text-base">第3条（キャンセル・返金）</h4>
            <ul className="list-disc list-inside space-y-2 text-slate-600 pl-1">
              <li>作業開始前であれば無償でキャンセル可能です。</li>
              <li>作業開始後のお客様都合によるキャンセルの場合、原則として返金はいたしかねますのでご了承ください。</li>
            </ul>
          </section>
          <section>
            <h4 className="font-bold text-slate-900 border-l-4 border-orange-500 pl-3 mb-3 text-base">第4条（クレジット表記・実績公開）</h4>
            <ul className="list-disc list-inside space-y-2 text-slate-600 pl-1">
              <li>YouTube等のプラットフォームへ投稿する際に、概要欄に「Mix: Sien」とX(Twitter)へのリンクの記載をお願いいたします。</li>
              <li>ご依頼いただいた作品は、当サイトの実績として紹介させていただく場合がございます。（公開不可の場合は事前にお申し付けください）</li>
            </ul>
          </section>
        </div>
        <div className="p-6 border-t border-slate-100 bg-brand-bg flex justify-end shrink-0">
          <Button type="button" onClick={onClose} className="px-8 font-bold bg-orange-50 border border-orange-100 hover:bg-orange-50 text-white rounded-full">閉じる</Button>
        </div>
      </div>
    </div>
  );
};

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

export default function OrderFormClient({ initialPlans, initialOptions = [] }: { initialPlans: Plan[], initialOptions?: Option[] }) {
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    twitterId: "",
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
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);

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
    let total = 0;
    let hasConsultation = false;

    if (selectedPlanObj) {
      if (selectedPlanObj.price === null) {
        hasConsultation = true;
      } else {
        total += selectedPlanObj.price;
      }
    }

    selectedOptions.forEach(optId => {
      const opt = initialOptions.find(o => o.id === optId);
      if (opt) {
        if (opt.priceText.includes("要相談")) {
          hasConsultation = true;
        } else {
          const priceStr = opt.priceText.replace(/[^0-9]/g, "");
          if (priceStr) {
            total += parseInt(priceStr, 10);
          }
        }
      }
    });

    return { total, hasConsultation };
  };

  const estimate = calculateTotal();
  
  // 見積りのプラン名＋オプション名の結合
  const planName = selectedPlanObj?.name || "";
  const optNames = selectedOptions.map(id => initialOptions.find(o => o.id === id)?.name).filter(Boolean).join(" + ");
  const detailText = optNames ? \`\${planName} + \${optNames}\` : planName;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    const optionsText = selectedOptions.map(id => {
      const opt = initialOptions?.find(o => o.id === id);
      return opt ? \`\${opt.name} (\${opt.priceText})\` : "";
    }).filter(Boolean).join(", ");

    // 作詞状態をバックエンドに送る際に調整する
    let finalLyricsStatus = formData.lyricsStatus;
    if (formData.serviceType === "ORIGINAL") {
      if (isLyricsIncluded) finalLyricsStatus = "作詞含む（フルパッケージ）";
      if (isLyricsProvided) finalLyricsStatus = "歌詞あり（持ち込み）";
    }

    const submissionData = {
      ...formData,
      options: optionsText,
      lyricsStatus: finalLyricsStatus
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

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg">
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-100 text-center max-w-lg">
          <div className="w-20 h-20 bg-orange-500/10 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">ご依頼ありがとうございます</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">送信が完了しました。<br/>内容を確認次第、入力いただいた連絡先へご連絡いたします。</p>
          <Button asChild className="rounded-full px-10 h-12 bg-orange-50 border border-orange-100 text-white font-bold"><a href="/">トップページに戻る</a></Button>
        </div>
      </div>
    );
  }

  const inputStyle = "w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all";
  const requiredMark = <span className="text-brand-amber ml-1 font-bold">*</span>;

  const isMix = formData.serviceType === "MIX";
  const isOriginal = formData.serviceType === "ORIGINAL";

  const getOptionDescription = (name: string) => {
    if (name.includes("ボーカルディレクション")) return "オンライン通話でレコーディングのアドバイスや、歌唱表現のサポートを行います。";
    if (name.includes("生楽器演奏追加")) return "ギター・ベース・ピアノ等\\n※内容に応じてお見積り";
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
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">ご依頼フォーム</h1>
          <p className="text-slate-600 leading-relaxed max-w-2xl mx-auto">
            ミックス・マスタリング、オリジナル楽曲制作のご依頼はこちらからお願いします。<br/>
            ※まだ依頼するか決まっていなくても、ご相談・お見積りのみでご利用いただけます。
          </p>
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
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center text-sm font-black tracking-tighter">01</span>
              ご希望のサービス
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <label className={\`cursor-pointer p-5 rounded-2xl border-2 transition-all flex items-center gap-3 \${formData.serviceType === 'MIX' ? 'border-orange-500 bg-orange-500/5 text-slate-900' : 'border-slate-100 hover:border-orange-500/30 text-slate-600'}\`}>
                <input type="radio" name="service" className="w-5 h-5 text-orange-500 focus:ring-orange-500" checked={formData.serviceType === 'MIX'} onChange={() => setFormData({...formData, serviceType: 'MIX'})} />
                <span className="font-bold">ミックス／マスタリング</span>
              </label>
              <label className={\`cursor-pointer p-5 rounded-2xl border-2 transition-all flex items-center gap-3 \${formData.serviceType === 'ORIGINAL' ? 'border-orange-500 bg-orange-500/5 text-slate-900' : 'border-slate-100 hover:border-orange-500/30 text-slate-600'}\`}>
                <input type="radio" name="service" className="w-5 h-5 text-orange-500 focus:ring-orange-500" checked={formData.serviceType === 'ORIGINAL'} onChange={() => setFormData({...formData, serviceType: 'ORIGINAL'})} />
                <span className="font-bold">オリジナル楽曲制作</span>
              </label>
            </div>
            {filteredPlans.length > 0 && (
              <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100 mt-6">
                <label className="text-sm font-bold text-brand-text">プランを選択してください {requiredMark}</label>
                <div className="grid md:grid-cols-2 gap-4">
                  {filteredPlans.map(plan => (
                    <label key={plan.id} className={\`cursor-pointer p-4 rounded-xl border-2 transition-all flex justify-between items-center \${formData.planId === plan.id ? 'border-orange-500 bg-white shadow-sm' : 'border-slate-200 bg-white hover:border-orange-500/50 text-slate-600'}\`}>
                      <div className="flex items-center gap-3">
                        <input type="radio" name="plan" checked={formData.planId === plan.id} onChange={() => setFormData({...formData, planId: plan.id})} className="w-5 h-5 text-orange-500 focus:ring-orange-500" />
                        <span className={\`font-bold text-sm sm:text-base \${formData.planId === plan.id ? 'text-slate-900' : ''}\`}>{plan.name}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* 02 オプション */}
          {initialOptions && initialOptions.filter(opt => opt.category === formData.serviceType || opt.category === "COMMON").length > 0 && (
            <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center text-sm font-black tracking-tighter">02</span>
                オプションの追加（任意）
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {initialOptions.filter(opt => opt.category === formData.serviceType || opt.category === "COMMON").map(opt => {
                  const desc = getOptionDescription(opt.name);
                  return (
                    <label key={opt.id} className={\`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col gap-1 \${selectedOptions.includes(opt.id) ? 'border-orange-500 bg-orange-500/5' : 'border-slate-200 bg-slate-50 hover:border-orange-500/30 text-slate-600'}\`}>
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
                          <span className={\`font-bold text-sm sm:text-base leading-snug \${selectedOptions.includes(opt.id) ? 'text-slate-900' : ''}\`}>{opt.name}</span>
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
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
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
                  <label className="text-sm font-bold text-brand-text">Twitter ID <span className="text-xs text-slate-500 font-normal ml-1">（任意）</span></label>
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

              <div className="space-y-4 pt-6 border-t border-slate-100">
                <label className="text-sm font-bold text-brand-text">活動用途 {requiredMark}</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {currentPurposes.map(purpose => (
                    <label key={purpose} className={\`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-center justify-center text-center \${formData.activityPurpose === purpose ? 'border-orange-500 bg-orange-500/5 text-slate-900 font-bold' : 'border-slate-100 hover:border-orange-500/30 text-slate-600'}\`}>
                      <input type="radio" className="hidden" checked={formData.activityPurpose === purpose} onChange={() => setFormData({...formData, activityPurpose: purpose})} />
                      <span className="text-sm">{purpose}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>
          </section>

          {/* 04 楽曲情報 */}
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
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
                  <label className="text-sm font-bold text-brand-text">ご希望の納期</label>
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
                    className={\`\${inputStyle} resize-none\`} 
                    placeholder={\`例：
・ボカロ系ロック
・アイドルポップ
・バラード
・EDM
・和風ロック
\`} 
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
                      <label key={opt} className={\`flex items-start gap-4 cursor-pointer p-4 rounded-xl border-2 transition-all \${formData.vocalGuideStatus === opt ? 'border-orange-500 bg-orange-500/5' : 'border-transparent hover:bg-slate-50'}\`}>
                        <input type="radio" className="mt-1 w-5 h-5 text-orange-500 focus:ring-orange-500 shrink-0" checked={formData.vocalGuideStatus === opt} onChange={() => setFormData({...formData, vocalGuideStatus: opt})} />
                        <div className={\`font-bold \${formData.vocalGuideStatus === opt ? 'text-slate-900' : 'text-brand-text'}\`}>{opt}</div>
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
                  参考曲 (YouTubeなどのURL)
                  <HelpTooltip text="「この曲みたいにしてほしい！」「こんな曲調にしてほしい！」という憧れの曲や参考イメージがあればURLを貼ってください。なければ空欄で大丈夫です。" />
                </label>
                <input type="url" className={inputStyle} placeholder="https://..." value={formData.referenceUrl} onChange={e => setFormData({...formData, referenceUrl: e.target.value})} />
              </div>

              {isMix && (
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <label className="text-sm font-bold text-brand-text">リファレンス音源の再現度の希望</label>
                  <div className="space-y-3">
                    <label className={\`flex items-start gap-4 cursor-pointer p-4 rounded-xl border-2 transition-all \${formData.referenceFidelity === "1" ? 'border-orange-500 bg-orange-500/5' : 'border-transparent hover:bg-slate-50'}\`}>
                      <input type="radio" name="fidelity" className="mt-1 w-5 h-5 text-orange-500 focus:ring-orange-500 shrink-0" checked={formData.referenceFidelity === "1"} onChange={() => setFormData({...formData, referenceFidelity: "1"})} />
                      <div>
                        <div className={\`font-bold \${formData.referenceFidelity === "1" ? 'text-slate-900' : 'text-brand-text'}\`}>1. 完全お任せ</div>
                        <div className="text-sm text-slate-500 mt-1">参考音源は見ますが、全体の方向性はお任せください。</div>
                      </div>
                    </label>
                    <label className={\`flex items-start gap-4 cursor-pointer p-4 rounded-xl border-2 transition-all \${formData.referenceFidelity === "2" ? 'border-orange-500 bg-orange-500/5' : 'border-transparent hover:bg-slate-50'}\`}>
                      <input type="radio" name="fidelity" className="mt-1 w-5 h-5 text-orange-500 focus:ring-orange-500 shrink-0" checked={formData.referenceFidelity === "2"} onChange={() => setFormData({...formData, referenceFidelity: "2"})} />
                      <div>
                        <div className={\`font-bold \${formData.referenceFidelity === "2" ? 'text-slate-900' : 'text-brand-text'}\`}>2. 参考にしつつ調整</div>
                        <div className="text-sm text-slate-500 mt-1">参考音源の雰囲気を取り入れながら仕上げます。</div>
                      </div>
                    </label>
                    <label className={\`flex items-start gap-4 cursor-pointer p-4 rounded-xl border-2 transition-all \${formData.referenceFidelity === "3" ? 'border-orange-500 bg-orange-500/5' : 'border-transparent hover:bg-slate-50'}\`}>
                      <input type="radio" name="fidelity" className="mt-1 w-5 h-5 text-orange-500 focus:ring-orange-500 shrink-0" checked={formData.referenceFidelity === "3"} onChange={() => setFormData({...formData, referenceFidelity: "3"})} />
                      <div>
                        <div className={\`font-bold \${formData.referenceFidelity === "3" ? 'text-slate-900' : 'text-brand-text'}\`}>3. リファレンス重視</div>
                        <div className="text-sm text-slate-500 mt-1">できる限り参考音源に近い方向で制作します。</div>
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* 05 自由記述 */}
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center text-sm font-black tracking-tighter">05</span>
              自由記述
            </h2>
            <div className="space-y-2">
              <label className="text-sm font-bold text-brand-text">ご要望・ご質問・特記事項など</label>
              <textarea 
                rows={6} 
                className={\`\${inputStyle} resize-none\`} 
                placeholder={\`例：
・本家寄りで仕上げてほしい
・かわいく明るい雰囲気にしたい
・ハモリ生成を希望
・〇〇様のMIXのような音作りを希望\`} 
                value={formData.message} 
                onChange={e => setFormData({...formData, message: e.target.value})}></textarea>
            </div>
          </section>

          {/* 06 素材提出 */}
          {isMix && (
            <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center text-sm font-black tracking-tighter">06</span>
                素材提出
              </h2>
              <div className="space-y-4">
                <label className="text-sm font-bold text-brand-text">
                  レコーディング済み音源のアップロードURL
                  <HelpTooltip text="ボーカルデータ（WAV推奨）とカラオケ音源をGigaFile便などで一つにまとめ、URLを貼り付けてください。まだ録音中の方は空欄のままでOKです！" />
                </label>
                <input type="url" className={inputStyle} placeholder="Gigafile便、Google DriveなどのURL" value={formData.materialsUrl} onChange={e => setFormData({...formData, materialsUrl: e.target.value})} />
                <div className="flex items-start gap-3 mt-4 p-4 bg-brand-amber/10 rounded-xl border border-brand-amber/20">
                  <svg className="w-5 h-5 text-brand-amber shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <div className="text-sm font-bold text-brand-amber leading-relaxed space-y-1">
                    <p>※頭出し済みのWAVデータ推奨</p>
                    <p className="text-base mt-2 underline decoration-brand-amber/50 underline-offset-4">※まだ素材がない場合でもご依頼可能です</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 07 お支払い方法 */}
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
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
          <div className="bg-orange-50 border border-orange-100 p-8 md:p-10 rounded-3xl shadow-2xl flex flex-col items-center gap-10 mx-auto w-full mt-16 relative overflow-hidden">
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
            </div>
            
            <div className="w-full flex flex-col items-center relative z-10 border-t border-orange-200/50 pt-8">
              <label className="flex items-center justify-center gap-3 cursor-pointer mb-6 text-slate-700 hover:text-slate-900 transition-colors group">
                <input required type="checkbox" className="w-5 h-5 text-orange-500 rounded border-slate-300 focus:ring-orange-500 focus:ring-offset-white bg-white" />
                <span className="font-bold text-sm md:text-base">
                  <button type="button" onClick={() => setIsPolicyModalOpen(true)} className="text-orange-600 hover:text-orange-700 underline underline-offset-4 decoration-orange-500/50 transition-colors mx-1">
                    ご依頼に関する留意事項
                  </button>
                  に同意する <span className="text-brand-amber ml-0.5">*</span>
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
    <PolicyModal isOpen={isPolicyModalOpen} onClose={() => setIsPolicyModalOpen(false)} />
    </>
  );
}
`;

fs.writeFileSync('src/components/order/OrderFormClient.tsx', code);
console.log('OrderFormClient.tsx rewritten successfully with detailed v3 structure.');
