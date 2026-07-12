"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock } from "lucide-react";
import CountdownTimer from "@/components/CountdownTimer";

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
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-cyan-50 shrink-0">
          <h3 className="text-xl font-bold text-slate-900">ご依頼に関する留意事項</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-full w-8 h-8 flex items-center justify-center transition-colors">✕</button>
        </div>
        <div className="p-8 overflow-y-auto text-slate-700 space-y-8 text-sm leading-relaxed">
          <section>
            <h4 className="font-bold text-slate-900 border-l-4 border-cyan-500 pl-3 mb-3 text-base">第1条（ご依頼の成立・お支払い）</h4>
            <ul className="list-disc list-inside space-y-2 text-slate-600 pl-1">
              <li>お見積り金額に合意いただき、ご入金が確認できた時点で正式なご依頼（作業開始）となります。</li>
              <li>お支払い方法は銀行振込または各種決済サービス（要相談）となります。振込手数料はお客様負担となります。</li>
            </ul>
          </section>
          <section>
            <h4 className="font-bold text-slate-900 border-l-4 border-cyan-500 pl-3 mb-3 text-base">第2条（修正対応について）</h4>
            <ul className="list-disc list-inside space-y-2 text-slate-600 pl-1">
              <li>各プランに定められた回数まで「無料修正」を承ります。</li>
              <li>無料修正回数を超過した修正、または「最初のご要望から大きく逸脱する大幅な修正」については、別途追加料金が発生する場合がございます。</li>
            </ul>
          </section>
          <section>
            <h4 className="font-bold text-slate-900 border-l-4 border-cyan-500 pl-3 mb-3 text-base">第3条（キャンセル・返金）</h4>
            <ul className="list-disc list-inside space-y-2 text-slate-600 pl-1">
              <li>作業開始前であれば無償でキャンセル可能です。</li>
              <li>作業開始後のお客様都合によるキャンセルの場合、原則として返金はいたしかねますのでご了承ください。</li>
            </ul>
          </section>
          <section>
            <h4 className="font-bold text-slate-900 border-l-4 border-cyan-500 pl-3 mb-3 text-base">第4条（クレジット表記・実績公開）</h4>
            <ul className="list-disc list-inside space-y-2 text-slate-600 pl-1">
              <li>YouTube等のプラットフォームへ投稿する際に、概要欄に「Mix: Sien」とX(Twitter)へのリンクの記載をお願いいたします。</li>
              <li>ご依頼いただいた作品は、当サイトの実績として紹介させていただく場合がございます。（公開不可の場合は事前にお申し付けください）</li>
            </ul>
          </section>
        </div>
        <div className="p-6 border-t border-slate-100 bg-cyan-50 flex justify-end shrink-0">
          <Button type="button" onClick={onClose} className="px-8 font-bold bg-cyan-600 hover:bg-cyan-700 text-white rounded-full">閉じる</Button>
        </div>
      </div>
    </div>
  );
};

const HelpTooltip = ({ text }: { text: string }) => (
  <span className="relative group/tooltip inline-block ml-2 cursor-help align-middle">
    <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-500 text-[10px] flex items-center justify-center font-bold hover:bg-cyan-500 hover:text-white transition-colors">?</span>
    <span className="absolute bottom-full -left-4 mb-2 w-64 p-3 bg-white border border-slate-200 text-slate-700 text-xs rounded-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50 text-left shadow-xl font-normal leading-relaxed">
      {text}
      <span className="absolute top-full left-6 -translate-x-1/2 border-4 border-transparent border-t-white z-10"></span>
      <span className="absolute top-full left-6 -translate-x-1/2 border-4 border-transparent border-t-slate-200" style={{ marginTop: '1px' }}></span>
    </span>
  </span>
);

export default function SummerSaleOrderFormClient({ initialOptions = [] }: { initialOptions?: Option[] }) {
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    twitterId: "",
    contactMethod: "X (DM)",
    serviceType: "MIX",
    planId: "サマーセール特別スタンダードプラン",
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
  const [isExpired, setIsExpired] = useState(false);
  
  useEffect(() => {
    // 期限切れチェック
    const checkExpiration = () => {
      const targetDate = new Date("2026-07-17T23:59:59+09:00").getTime();
      const now = new Date().getTime();
      if (now > targetDate) {
        setIsExpired(true);
      }
    };
    checkExpiration();
    const interval = setInterval(checkExpiration, 1000);
    return () => clearInterval(interval);
  }, []);

  const BASE_PRICE = 10000;
  const DISCOUNT_PRICE = 2000;

  const calculateTotal = () => {
    let optionPrice = 0;
    let subtotal = BASE_PRICE;
    let hasConsultation = false;

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
            subtotal += val;
          }
          if (opt.priceText.includes("〜") || opt.priceText.includes("~")) {
            hasConsultation = true;
          }
        }
      }
    });

    const hasEncode = selectedOptions.some(optId => {
      const opt = initialOptions.find(o => o.id === optId);
      return opt && opt.name.includes("エンコード");
    });

    if (hasEncode) {
      if ((subtotal - DISCOUNT_PRICE) < 10000) {
        optionPrice += 1000;
        subtotal += 1000;
      }
    }

    const total = subtotal - DISCOUNT_PRICE;

    return { 
      basePrice: BASE_PRICE - DISCOUNT_PRICE, // ベース料金は割引適用後の価格とする
      optionPrice, 
      subtotal, 
      total, 
      discount: DISCOUNT_PRICE, 
      hasConsultation 
    };
  };

  const estimate = calculateTotal();
  
  const planName = "スタンダードプラン(サマーセール)";
  const optNames = selectedOptions.map(id => initialOptions.find(o => o.id === id)?.name).filter(Boolean).join(" + ");
  const detailText = optNames ? `${planName} + ${optNames}` : planName;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    const optionsText = selectedOptions.map(id => {
      const opt = initialOptions?.find(o => o.id === id);
      return opt ? `${opt.name} (${opt.priceText})` : "";
    }).filter(Boolean).join(", ");

    const finalOptionsText = optionsText 
      ? `${optionsText}, 【サマーセール割引適用：-2,000円】`
      : `【サマーセール割引適用：-2,000円】`;

    const submissionData = {
      ...formData,
      planId: "サマーセール特別スタンダードプラン",
      options: finalOptionsText,
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

  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cyan-50 px-4 py-20">
        <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-cyan-100 text-center max-w-lg w-full">
          <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">サマーMIXセールは<br/>終了いたしました</h2>
          <div className="text-slate-600 mb-10 leading-relaxed text-sm sm:text-base bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <p className="mb-2">たくさんのご依頼、誠にありがとうございました！</p>
            <p className="text-xs text-slate-500">通常のMIX依頼につきましては、引き続き通常プランよりお申し込みいただけます。</p>
          </div>
          <Button asChild className="w-full rounded-full px-10 h-14 bg-gradient-to-r from-slate-700 to-slate-900 text-white font-bold hover:brightness-110 shadow-lg">
            <a href="/mix">通常プランのご依頼はこちら</a>
          </Button>
          <div className="mt-4">
            <a href="/" className="text-sm font-bold text-cyan-600 hover:text-cyan-700 underline underline-offset-4">トップページに戻る</a>
          </div>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cyan-50 px-4 py-20">
        <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-cyan-100 text-center max-w-lg w-full">
          <div className="w-20 h-20 bg-cyan-500/10 text-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">お申し込み<br/>ありがとうございます</h2>
          <div className="text-slate-600 mb-10 leading-relaxed text-sm sm:text-base text-left bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <p className="mb-4 font-bold text-slate-800 text-center">送信が完了いたしました。</p>
            <p className="text-center">内容を確認のうえ、入力いただいたご連絡先へ通常24時間以内にご返信いたします。</p>
            <p className="text-center text-red-500 font-bold mt-4 text-xs">音源提出とお支払いは 7/20 23:59 までにお願いいたします。</p>
          </div>
          <Button asChild className="w-full rounded-full px-10 h-14 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold hover:brightness-110 shadow-lg">
            <a href="/">トップページに戻る</a>
          </Button>
        </div>
      </div>
    );
  }

  const inputStyle = "w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all";
  const requiredMark = <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 border border-red-200 align-middle relative -top-0.5">必須</span>;
  const optionalMark = <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200 align-middle relative -top-0.5">任意</span>;

  return (
    <>
    <div className="min-h-screen bg-slate-50 py-20 font-sans selection:bg-cyan-200">
      <div className="container mx-auto px-4 max-w-3xl relative">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-100 text-cyan-800 font-bold text-sm mb-6">
            サマーセール専用 ご依頼フォーム
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">サマーMIXセール</h1>
        </div>

        {/* タイマー */}
        <div className="flex justify-center mb-12">
          <CountdownTimer targetDate="2026-07-17T23:59:59+09:00" />
        </div>

        {/* ご依頼前の確認事項 */}
        <div className="bg-white border-2 border-cyan-100 rounded-3xl p-6 md:p-8 mb-12 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-50 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2 relative z-10">
            <CheckCircle2 className="w-5 h-5 text-cyan-500" />
            ご依頼前にご確認ください
          </h3>
          <ul className="space-y-3 text-slate-600 font-medium relative z-10">
            <li className="flex items-start gap-2"><span className="text-cyan-500 mt-0.5">✓</span> ボーカルデータは頭出し済みですか？</li>
            <li className="flex items-start gap-2"><span className="text-cyan-500 mt-0.5">✓</span> オケ音源はご用意できていますか？</li>
            <li className="flex items-start gap-2"><span className="text-cyan-500 mt-0.5">✓</span> 本セールはソロ（1名）でのご依頼限定となります。（コラボは対象外です）</li>
            <li className="flex items-start gap-2"><span className="text-cyan-500 mt-0.5">✓</span> ご不明な点はお気軽にご相談ください。</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12 pb-32">
          
          {/* 01 固定プラン */}
          <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-cyan-100 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-cyan-400 to-blue-500"></div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center text-sm font-black">01</span>
              キャンペーン対象プラン
            </h2>
            <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-6">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-cyan-800 font-bold text-lg">スタンダードプラン (フルコーラスMIX)</div>
                  <div className="text-cyan-600 text-sm mt-1">ピッチ・タイミング補正 / ハモり生成込み</div>
                </div>
                <div className="text-right">
                  <div className="text-cyan-800 text-sm font-bold">基本料金: ¥10,000</div>
                  <div className="text-cyan-600 font-bold mt-1">ここから <span className="text-red-500 font-black text-xl">-¥2,000</span></div>
                </div>
              </div>
            </div>
          </section>

          {/* 02 オプション */}
          {initialOptions && initialOptions.filter(opt => opt.category === "MIX" || opt.category === "COMMON").length > 0 && (
            <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-200 group-hover:bg-cyan-400 transition-colors"></div>
              <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center text-sm font-black">02</span>
                オプションの追加（任意）
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {initialOptions.filter(opt => opt.category === "MIX" || opt.category === "COMMON").map(opt => (
                  <label key={opt.id} className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col gap-1 ${selectedOptions.includes(opt.id) ? 'border-cyan-500 bg-cyan-50/50' : 'border-slate-100 bg-slate-50 hover:border-cyan-200 text-slate-600'}`}>
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
                        className="w-5 h-5 text-cyan-500 focus:ring-cyan-500 rounded border-slate-300 mt-0.5" 
                      />
                      <div className="flex flex-col">
                        <span className={`font-bold text-sm sm:text-base leading-snug ${selectedOptions.includes(opt.id) ? 'text-slate-900' : ''}`}>{opt.name}</span>
                      </div>
                    </div>
                    <div className="pl-8 pt-1">
                      <span className="font-bold text-cyan-600 text-sm">{opt.priceText}</span>
                    </div>
                  </label>
                ))}
              </div>
            </section>
          )}

          {/* 03 基本情報 */}
          <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-200 group-hover:bg-cyan-400 transition-colors"></div>
            <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center text-sm font-black">03</span>
              基本情報
            </h2>
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">活動名 / お名前 {requiredMark}</label>
                  <input required type="text" className={inputStyle} placeholder="山田 太郎" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">X (Twitter) ID {optionalMark}</label>
                  <input type="text" className={inputStyle} placeholder="例：@sien_mc09" value={formData.twitterId} onChange={e => setFormData({...formData, twitterId: e.target.value})} />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">メールアドレス {requiredMark}</label>
                  <input required type="email" className={inputStyle} placeholder="example@email.com" value={formData.clientEmail} onChange={e => setFormData({...formData, clientEmail: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">希望する連絡手段 {requiredMark}</label>
                  <select required className={inputStyle} value={formData.contactMethod} onChange={e => setFormData({...formData, contactMethod: e.target.value})}>
                    <option value="X (DM)">X (DM)</option>
                    <option value="メール">メール</option>
                    <option value="Discord">Discord</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* 04 楽曲情報 */}
          <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-200 group-hover:bg-cyan-400 transition-colors"></div>
            <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center text-sm font-black">04</span>
              楽曲情報
            </h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">曲名 (ない場合は"なし") {requiredMark}</label>
                <input required type="text" className={inputStyle} placeholder="例: モニタリング / 未定" value={formData.songTitle} onChange={e => setFormData({...formData, songTitle: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
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
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  参考曲URL {optionalMark}
                  <HelpTooltip text="「この曲みたいにしてほしい！」「こんな曲調にしてほしい！」という憧れの曲や参考イメージがあればURLを貼ってください。なければ空欄で大丈夫です。" />
                </label>
                <input type="url" className={inputStyle} placeholder="https://..." value={formData.referenceUrl} onChange={e => setFormData({...formData, referenceUrl: e.target.value})} />
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100">
                <label className="text-sm font-bold text-slate-700">リファレンス音源の再現度の希望 {optionalMark}</label>
                <div className="space-y-3">
                  <label className={`flex items-start gap-4 cursor-pointer p-4 rounded-xl border-2 transition-all ${formData.referenceFidelity === "1" ? 'border-cyan-500 bg-cyan-50/50' : 'border-transparent hover:bg-slate-50'}`}>
                    <input type="radio" name="fidelity" className="mt-1 w-5 h-5 text-cyan-500 focus:ring-cyan-500 shrink-0" checked={formData.referenceFidelity === "1"} onChange={() => setFormData({...formData, referenceFidelity: "1"})} />
                    <div>
                      <div className={`font-bold ${formData.referenceFidelity === "1" ? 'text-slate-900' : 'text-slate-700'}`}>1. 完全お任せ</div>
                      <div className="text-sm text-slate-500 mt-1">参考音源は見ますが、全体の方向性はお任せください。</div>
                    </div>
                  </label>
                  <label className={`flex items-start gap-4 cursor-pointer p-4 rounded-xl border-2 transition-all ${formData.referenceFidelity === "2" ? 'border-cyan-500 bg-cyan-50/50' : 'border-transparent hover:bg-slate-50'}`}>
                    <input type="radio" name="fidelity" className="mt-1 w-5 h-5 text-cyan-500 focus:ring-cyan-500 shrink-0" checked={formData.referenceFidelity === "2"} onChange={() => setFormData({...formData, referenceFidelity: "2"})} />
                    <div>
                      <div className={`font-bold ${formData.referenceFidelity === "2" ? 'text-slate-900' : 'text-slate-700'}`}>2. 参考にしつつ調整</div>
                      <div className="text-sm text-slate-500 mt-1">参考音源の雰囲気を取り入れながら仕上げます。</div>
                    </div>
                  </label>
                  <label className={`flex items-start gap-4 cursor-pointer p-4 rounded-xl border-2 transition-all ${formData.referenceFidelity === "3" ? 'border-cyan-500 bg-cyan-50/50' : 'border-transparent hover:bg-slate-50'}`}>
                    <input type="radio" name="fidelity" className="mt-1 w-5 h-5 text-cyan-500 focus:ring-cyan-500 shrink-0" checked={formData.referenceFidelity === "3"} onChange={() => setFormData({...formData, referenceFidelity: "3"})} />
                    <div>
                      <div className={`font-bold ${formData.referenceFidelity === "3" ? 'text-slate-900' : 'text-slate-700'}`}>3. リファレンス重視</div>
                      <div className="text-sm text-slate-500 mt-1">できる限り参考音源に近い方向で制作します。</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* 05 自由記述・素材 */}
          <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-200 group-hover:bg-cyan-400 transition-colors"></div>
            <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center text-sm font-black">05</span>
              自由記述・素材
            </h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">ご要望・特記事項など {optionalMark}</label>
                <textarea rows={4} className={`${inputStyle} resize-none`} placeholder="MIXへのご要望など" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}></textarea>
              </div>
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <label className="text-sm font-bold text-slate-700">
                  音源素材アップロードURL {optionalMark} <span className="text-xs text-slate-500 font-normal ml-2">（7/20提出〆切）</span>
                  <HelpTooltip text="ボーカルデータ（WAV推奨）とカラオケ音源をGigaFile便などで一つにまとめ、URLを貼り付けてください。まだ録音中の方は空欄のままでOKです！" />
                </label>
                <input type="url" className={inputStyle} placeholder="Gigafile便、Google DriveなどのURL" value={formData.materialsUrl} onChange={e => setFormData({...formData, materialsUrl: e.target.value})} />
                <p className="text-xs text-slate-500 mt-2">※まだ準備中の場合は空欄で送信し、後日7/20までにDM等でお送りください。</p>
              </div>
            </div>
          </section>

          {/* 06 お支払い方法 */}
          <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-200 group-hover:bg-cyan-400 transition-colors"></div>
            <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center text-sm font-black">06</span>
              お支払い方法
            </h2>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">お支払い方法 {requiredMark}</label>
              <select required className={inputStyle} value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value})}>
                <option value="銀行振込">銀行振込</option>
                <option value="クレジットカード">クレジットカード</option>
                <option value="その他">その他</option>
              </select>
            </div>
          </section>

          {/* 送信とリアルタイム見積もり */}
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-100 p-6 md:p-10 rounded-3xl shadow-xl flex flex-col items-center gap-8 md:gap-10 mx-auto w-full relative overflow-hidden">
            <div className="text-center relative z-10 w-full">
              <p className="text-cyan-700 text-sm font-bold mb-4 tracking-widest uppercase">現在のお見積り概算</p>
              <div className="w-full max-w-xs mx-auto mb-6 space-y-2 border-b border-cyan-200/50 pb-4 text-sm sm:text-base">
                <div className="flex justify-between text-cyan-800 font-medium">
                  <span>小計（基本料金＋オプション）</span>
                  <span>¥{estimate.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-red-500 font-bold">
                  <span>サマーセール特別割引</span>
                  <span>-¥{estimate.discount.toLocaleString()}</span>
                </div>
              </div>

              <div className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                ¥{estimate.total.toLocaleString()}
                <span className="text-base font-normal text-slate-500 ml-2">税込</span>
              </div>
              
              <div className="mt-4 text-sm font-bold text-cyan-700 bg-white inline-block px-4 py-2 rounded-full border border-cyan-200">
                {detailText}
              </div>

              {estimate.hasConsultation && (
                <p className="text-sm text-cyan-700 mt-3 flex items-center justify-center gap-1.5 font-medium">
                  要相談の項目が含まれています。
                </p>
              )}
              <div className="text-xs text-slate-500 mt-4 font-medium">
                ※正式なお見積りは、トラック数・修正内容・オプションによって変動する場合があります。
              </div>
            </div>
            
            <div className="w-full flex flex-col items-center relative z-10 border-t border-cyan-200/50 pt-8">
              <label className="flex items-center justify-center gap-3 cursor-pointer mb-6 text-slate-700 hover:text-slate-900 transition-colors group">
                <input required type="checkbox" className="w-5 h-5 text-cyan-500 rounded border-slate-300 focus:ring-cyan-500 focus:ring-offset-white bg-white" />
                <span className="font-bold text-sm md:text-base">
                  <button type="button" onClick={() => setIsPolicyModalOpen(true)} className="text-cyan-600 hover:text-cyan-700 underline underline-offset-4 decoration-cyan-500/50 transition-colors mx-1">
                    ご依頼に関する留意事項
                  </button>
                  に同意する {requiredMark}
                </span>
              </label>

              <div className="w-full max-w-md flex flex-col items-center gap-3">
                <p className="text-sm font-bold text-slate-600">送信後、24時間以内にご返信いたします。</p>
                <Button type="submit" disabled={status === "submitting"} className="w-full px-12 h-16 text-lg font-bold rounded-full shadow-xl shadow-cyan-500/30 bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:brightness-110 hover:scale-105 transition-all border-none">
                  {status === "submitting" ? "送信中..." : "セール価格で申し込む"}
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
