"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, AlertCircle, Info, FileText } from "lucide-react";

// Note: ページが "use client" を使用しているため、Metadata は `layout.tsx` か別途 wrapper で管理する必要がありますが、Next.js App Router では "use client" のファイルから metadata をエクスポートできません。
// なので、order/layout.tsx を新設してそこで管理するのがベストです。ここでは page.tsx の内容を保ちつつ、この後の処理で order/layout.tsx を作ります。

export default function OrderPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    twitterId: "",
    service: "",
    deadline: "",
    budget: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // 希望納期と予算をメッセージの先頭に結合して送信する
    const combinedMessage = `【希望納期】${formData.deadline || "指定なし"}
【ご予算】${formData.budget || "指定なし"}

${formData.message}`;

    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          twitterId: formData.twitterId,
          service: formData.service || "未選択",
          message: combinedMessage,
        })
      });

      if (res.ok) {
        alert("送信が完了しました！通常24時間以内に返信いたします。");
        // フォームのリセット
        setFormData({ name: "", email: "", twitterId: "", service: "", deadline: "", budget: "", message: "" });
      } else {
        alert("送信に失敗しました。もう一度お試しください。");
      }
    } catch (err) {
      alert("エラーが発生しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInsertTemplate = () => {
    const template = `【ご依頼内容の詳細】
・仕上げたい雰囲気：(例：力強く、エモく、本家寄せ、など)
・ケロケロ加工の有無：(あり / なし / お任せ)
・ハモリ生成の有無：(あり / なし / お任せ)
・その他こだわりたいポイント：
`;
    // 既存のメッセージの先頭か末尾にテンプレートを挿入
    setFormData(prev => ({
      ...prev,
      message: prev.message ? `${prev.message}\n\n${template}` : template
    }));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 200, damping: 20 },
    },
  };

  // 入力フィールドの共通クラス
  const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-800 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors duration-300";
  const labelClass = "block text-gray-900 font-bold mb-2 tracking-wide text-sm";
  const requiredBadge = <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 tracking-wider">必須</span>;
  const optionalBadge = <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500 tracking-wider">任意</span>;

  return (
    <div className="min-h-screen pb-24 bg-gray-50 font-sans selection:bg-amber-500/30">
      <div className="container mx-auto px-6 pt-16 md:pt-24 max-w-3xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="text-center mb-16">
            <span className="tracking-[0.2em] text-xs text-amber-600 uppercase font-bold mb-4 block">Contact</span>
            <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-6 tracking-wide">
              お問い合わせ・お見積り
            </h1>
            <p className="text-sm text-gray-500 tracking-widest leading-loose">
              お見積もりは無料です。原則24時間以内にメールにて返信いたします。
            </p>
          </motion.div>

          {/* Form Container */}
          <motion.form 
            variants={itemVariants} 
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100"
          >
            
            {/* Section 1: 基本情報 */}
            <div className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4 tracking-wide">
                <span className="text-amber-500 mr-2 font-serif">1.</span> 基本情報
              </h2>
              <div className="space-y-6">
                <div>
                  <label className={labelClass}>活動名 / お名前 {requiredBadge}</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required placeholder="活動名を入力" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>メールアドレス {requiredBadge}</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required placeholder="example@email.com" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Twitter ID {requiredBadge}</label>
                  <input type="text" value={formData.twitterId} onChange={(e) => setFormData({...formData, twitterId: e.target.value})} required placeholder="@sien_mc09" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>希望する連絡手段 {requiredBadge}</label>
                  <div className="relative">
                    <select required className={`${inputClass} appearance-none`}>
                      <option value="">選択してください</option>
                      <option value="twitter_dm">Twitter DM</option>
                      <option value="email">メール</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-gray-500">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: ご依頼内容 */}
            <div className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4 tracking-wide">
                <span className="text-amber-500 mr-2 font-serif">2.</span> ご依頼内容
              </h2>
              <div className="space-y-6">
                <div>
                  <label className={labelClass}>プラン {requiredBadge}</label>
                  <div className="relative">
                    <select required value={formData.service} onChange={(e) => setFormData({...formData, service: e.target.value})} className={`${inputClass} appearance-none`}>
                      <option value="">選択してください</option>
                      <option value="std">スタンダードプラン (MIX)</option>
                      <option value="chorus">ワンコーラスプラン (MIX)</option>
                      <option value="short">ショート動画用MIX (MIX)</option>
                      <option value="speed">短納期プラン (MIX)</option>
                      <option value="superspeed">最短納期プラン (MIX)</option>
                      <option value="collab">コラボ・合唱プラン (MIX)</option>
                      <option value="orig_std">完パケプラン (オリジナル)</option>
                      <option value="orig_lyric">作詞持ち込みプラン (オリジナル)</option>
                      <option value="other">その他・ご相談</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-gray-500">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>曲名 {requiredBadge}</label>
                  <input type="text" required placeholder="例: モニタリング / ない場合は「なし」" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>希望納期 {requiredBadge}</label>
                  <input type="text" required value={formData.deadline} onChange={(e) => setFormData({...formData, deadline: e.target.value})} placeholder="例: 〇月〇日、特に急ぎではない、など" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>ご予算 {optionalBadge}</label>
                  <input type="text" value={formData.budget} onChange={(e) => setFormData({...formData, budget: e.target.value})} placeholder="例: 15,000円以内、見積もりを見て相談したい" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>オプション / その他 {optionalBadge}</label>
                  <input type="text" placeholder="ボーカルガイド作成、カットアップ、エンコードなど" className={inputClass} />
                </div>
              </div>
            </div>

            {/* Section 3: 楽曲情報・素材 */}
            <div className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4 tracking-wide">
                <span className="text-amber-500 mr-2 font-serif">3.</span> 楽曲情報・素材
              </h2>
              <div className="space-y-6">
                <div>
                  <label className={labelClass}>歌唱キー {requiredBadge}</label>
                  <div className="relative">
                    <select required className={`${inputClass} appearance-none`}>
                      <option value="">選択してください</option>
                      <option value="0">原キー (±0)</option>
                      <option value="+1">+1</option>
                      <option value="+2">+2</option>
                      <option value="+3">+3</option>
                      <option value="-1">-1</option>
                      <option value="-2">-2</option>
                      <option value="-3">-3</option>
                      <option value="other">その他</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-gray-500">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>参考曲 {optionalBadge}</label>
                  <input type="url" placeholder="YouTubeなどのURL" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>レコーディング済み音源URL {optionalBadge}</label>
                  <input type="url" placeholder="Gigafile便、Google DriveなどのURL" className={inputClass} />
                  <p className="text-xs text-gray-500 mt-2 tracking-widest flex items-center gap-1">
                    <Info size={14} className="text-amber-500" />
                    音源が未提出の場合でもお見積り可能です。
                  </p>
                </div>
              </div>
            </div>

            {/* Section 4: お支払い・その他 */}
            <div className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4 tracking-wide">
                <span className="text-amber-500 mr-2 font-serif">4.</span> お支払い・その他
              </h2>
              <div className="space-y-6">
                <div>
                  <label className={labelClass}>お支払い方法 {requiredBadge}</label>
                  <div className="relative">
                    <select required className={`${inputClass} appearance-none`}>
                      <option value="">選択してください</option>
                      <option value="bank_transfer">銀行振込</option>
                      <option value="credit_card">クレジットカード</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-gray-500">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={labelClass}>ご要望・ご相談内容 {requiredBadge}</label>
                    <button 
                      type="button" 
                      onClick={handleInsertTemplate}
                      className="text-[10px] tracking-widest uppercase font-bold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors"
                    >
                      <FileText size={12} /> テンプレート
                    </button>
                  </div>
                  <textarea required value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} rows={8} placeholder="ご自由にご記入ください。上のボタンを押すとテンプレートが挿入されます。" className={`${inputClass} resize-none`}></textarea>
                </div>
              </div>
            </div>

            {/* Agreement & Submit */}
            <div className="text-center bg-gray-50 p-6 md:p-8 rounded-2xl border border-gray-100">
              <label className="flex items-center justify-center gap-3 cursor-pointer group mb-8">
                <div className="relative flex items-center justify-center w-5 h-5">
                  <input type="checkbox" required className="peer appearance-none w-5 h-5 border border-gray-300 rounded checked:bg-amber-500 checked:border-amber-500 transition-colors cursor-pointer" />
                  <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <span className="text-gray-700 font-bold text-sm select-none tracking-wider">
                  <a href="/terms" target="_blank" className="text-amber-600 hover:text-amber-700 transition-colors underline underline-offset-4">利用規約</a>に同意する
                </span>
              </label>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`w-full md:w-auto min-w-[300px] inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full font-bold text-sm tracking-widest uppercase transition-all ${
                  isSubmitting 
                    ? "bg-gray-300 text-white cursor-not-allowed" 
                    : "bg-gray-900 text-white hover:bg-amber-600 shadow-sm"
                }`}
              >
                {isSubmitting ? (
                  <>送信中...</>
                ) : (
                  <>送信する <Send size={16} /></>
                )}
              </button>
            </div>

          </motion.form>
        </motion.div>
      </div>
    </div>
  );
}
