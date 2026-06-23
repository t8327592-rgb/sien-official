"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, Music2, Clock, CheckCircle2 } from "lucide-react";

type Plan = {
  id: string;
  title: string;
  price: string;
  description: string;
  period: string | null;
  revisions: string | null;
  isPopular: boolean;
};

type PricingProps = {
  plans: Plan[];
  limit?: number;
  showLink?: boolean;
};

export default function OfficialPricingSection({ plans = [], limit, showLink = true }: PricingProps) {
  // DBから取得できない場合のフォールバックデータ
  const fallbackPlans = [
    {
      id: "1",
      title: "ショート動画",
      price: "3,000",
      description: "1分以内の歌ってみた動画（TikTok/Shorts向け）",
      period: "3〜5日",
      revisions: "2回まで",
      isPopular: false
    },
    {
      id: "2",
      title: "ワンコーラス",
      price: "5,000",
      description: "1番のみ（約1分半）の歌ってみた動画向け",
      period: "4〜7日",
      revisions: "2回まで",
      isPopular: false
    },
    {
      id: "3",
      title: "スタンダード",
      price: "8,000",
      description: "フルコーラス。ピッチ補正からマスタリングまですべて含む標準プラン。",
      period: "7〜14日",
      revisions: "無制限",
      isPopular: true
    }
  ];

  let displayPlans = plans.length > 0 ? plans : fallbackPlans;
  
  if (limit) {
    // limit が指定されている場合（トップページ用など）はフィルタと制限をかける
    displayPlans = displayPlans.filter(p => p.isPopular || p.title.includes("ショート")).slice(0, limit);
  }

  return (
    <section id="pricing" className="py-32 bg-gray-50">
      <div className="container mx-auto px-6 max-w-5xl">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="tracking-[0.2em] text-xs text-amber-600 uppercase font-bold mb-4 block">Pricing</span>
          <h2 className="text-3xl md:text-4xl font-serif text-gray-900 tracking-wide mb-6">料金プラン</h2>
          <p className="text-gray-500 text-sm tracking-widest leading-loose">
            分かりやすく、追加料金の不安がない料金体系です。<br className="hidden md:block" />
            全てのプランにプロフェッショナルなピッチ補正とマスタリングが含まれています。
          </p>
        </motion.div>

        <div className={`grid grid-cols-1 md:grid-cols-${limit ? 2 : 3} gap-8 mb-16 max-w-4xl mx-auto ${!limit && 'max-w-6xl'}`}>
          {displayPlans.map((plan, idx) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.1, duration: 0.8 }}
            >
              <div 
                className={`relative group bg-white rounded-[2rem] p-8 md:p-10 transition-all duration-300 border-4 hover:-translate-y-3 hover:rotate-1 hover:shadow-2xl ${
                  plan.isPopular 
                    ? "border-amber-400 shadow-xl shadow-amber-100/50" 
                    : "border-gray-50 hover:border-amber-200"
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-1.5 rounded-full text-xs font-black tracking-widest shadow-lg shadow-amber-500/30 flex items-center gap-1.5 transform group-hover:scale-110 transition-transform">
                    <Sparkles size={14} />
                    MOST POPULAR
                  </div>
                )}
                
                <div className="mb-8">
                  <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-transform">
                    <Music2 size={24} />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-3">{plan.title}</h3>
                  <p className="text-gray-500 font-medium text-sm leading-relaxed">{plan.description}</p>
                </div>
                
                <div className="mb-8 flex items-baseline gap-1">
                  <span className="text-4xl font-black tracking-tighter text-gray-900 group-hover:text-amber-600 transition-colors">
                    ¥{parseInt(plan.price).toLocaleString()}
                  </span>
                  <span className="text-gray-400 font-bold text-sm">/ 曲</span>
                </div>

                <div className="space-y-4 mb-10 text-sm text-gray-600">
                  {plan.period && (
                    <div className="flex items-center gap-3">
                      <Clock size={18} className="text-amber-400" />
                      <span className="font-bold">{plan.period}</span>
                    </div>
                  )}
                  {plan.revisions && (
                    <div className="flex items-center gap-3">
                      <CheckCircle2 size={18} className="text-amber-400" />
                      <span className="font-bold">{plan.revisions}</span>
                    </div>
                  )}
                </div>

                <Link
                  href="/pricing"
                  className={`block w-full text-center py-4 rounded-2xl font-bold transition-all ${
                    plan.isPopular 
                      ? "bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 hover:scale-[1.02]" 
                      : "bg-gray-100 text-gray-600 hover:bg-amber-100 hover:text-amber-600 hover:scale-[1.02]"
                  }`}
                >
                  このプランで依頼する
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {showLink && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center"
          >
            <Link 
              href="/pricing" 
              className="inline-flex items-center gap-2 text-sm tracking-widest uppercase font-bold text-gray-900 hover:text-amber-600 transition-colors group"
            >
              すべてのプラン・制作の流れを見る
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        )}

      </div>
    </section>
  );
}
