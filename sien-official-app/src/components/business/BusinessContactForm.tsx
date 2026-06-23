"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, CheckCircle2, Loader2, Building2 } from "lucide-react";

export function BusinessContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/business-contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("送信に失敗しました");
      }

      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      setError("エラーが発生しました。時間をおいて再度お試しいただくか、直接メールにてご連絡ください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-white rounded-[2rem] p-8 md:p-12 border border-slate-100 shadow-xl text-center max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-4">お問い合わせを受け付けました</h3>
        <p className="text-slate-600 leading-relaxed mb-8">
          お問い合わせいただき誠にありがとうございます。<br />
          内容を確認の上、担当者より1〜2営業日以内にご連絡いたします。
        </p>
        <div className="bg-slate-50 p-6 rounded-2xl text-left border border-slate-100 mb-8">
          <p className="text-sm text-slate-500 mb-1">送信されたメールアドレス</p>
          <p className="font-medium text-slate-900">{formData.email}</p>
        </div>
        <Button onClick={() => window.location.reload()} variant="outline" className="rounded-full px-8">
          新しくお問い合わせをする
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2rem] p-6 md:p-10 border border-slate-100 shadow-xl max-w-3xl mx-auto relative overflow-hidden">
      {/* 装飾 */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none opacity-60"></div>
      
      <div className="relative z-10 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <Building2 className="w-6 h-6 text-orange-500" />
            お問い合わせフォーム
          </h2>
          <p className="text-slate-500 text-sm mt-2">必須項目（*）は必ずご入力ください。</p>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-start gap-3">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
        
        {/* お客様情報 */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="w-1 h-5 bg-orange-500 rounded-full"></span>
            お客様情報
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                貴社名 <span className="text-orange-500 text-[10px] bg-orange-50 px-2 py-0.5 rounded-sm">必須</span>
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="例：株式会社Sien-Official"
                required
                className="w-full h-12 px-4 rounded-xl border bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                ご担当者名 <span className="text-orange-500 text-[10px] bg-orange-50 px-2 py-0.5 rounded-sm">必須</span>
              </label>
              <input
                type="text"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                placeholder="例：山田 太郎"
                required
                className="w-full h-12 px-4 rounded-xl border bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors outline-none"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              メールアドレス <span className="text-orange-500 text-[10px] bg-orange-50 px-2 py-0.5 rounded-sm">必須</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="例：info@example.com"
              required
              className="w-full h-12 px-4 rounded-xl border bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors outline-none"
            />
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
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              ご用件 <span className="text-orange-500 text-[10px] bg-orange-50 px-2 py-0.5 rounded-sm">必須</span>
            </label>
            <select
              name="inquiryType"
              value={formData.inquiryType}
              onChange={handleChange}
              required
              className="w-full h-12 px-4 rounded-xl border bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors outline-none appearance-none"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
            >
              <option value="" disabled>選択してください</option>
              <option value="歌ってみたMIX・マスタリング">歌ってみたMIX・マスタリング</option>
              <option value="オリジナル楽曲制作（ゲーム・アプリ等）">オリジナル楽曲制作（ゲーム・アプリ等）</option>
              <option value="企業PR・CM用楽曲制作">企業PR・CM用楽曲制作</option>
              <option value="その他音源制作・ディレクション">その他音源制作・ディレクション</option>
              <option value="お見積りのご依頼">お見積りのご依頼</option>
              <option value="その他のお問い合わせ">その他のお問い合わせ</option>
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                ご予算感 <span className="text-slate-400 text-[10px] bg-slate-100 px-2 py-0.5 rounded-sm">任意</span>
              </label>
              <input
                type="text"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                placeholder="例：50万円程度、要相談など"
                className="w-full h-12 px-4 rounded-xl border bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                希望納期 <span className="text-slate-400 text-[10px] bg-slate-100 px-2 py-0.5 rounded-sm">任意</span>
              </label>
              <input
                type="text"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                placeholder="例：2026年12月末、未定など"
                className="w-full h-12 px-4 rounded-xl border bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              お問い合わせ内容 <span className="text-orange-500 text-[10px] bg-orange-50 px-2 py-0.5 rounded-sm">必須</span>
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="プロジェクトの概要、ご検討中のサービス、ご質問などをご自由にご記入ください。"
              required
              className="w-full min-h-[200px] p-4 rounded-xl border bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors resize-y text-base outline-none"
            />
          </div>
        </div>

        <div className="pt-8 flex justify-center">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full md:w-auto min-w-[300px] h-14 rounded-full bg-orange-600 hover:bg-orange-500 text-white font-bold text-lg shadow-lg shadow-orange-500/20 hover:scale-[1.02] transition-all"
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
  );
}
