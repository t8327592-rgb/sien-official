"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Check, ChevronRight } from "lucide-react";

type Plan = {
  id: string;
  title: string;
  price: string;
  description: string;
  period?: string | null;
  revisions?: string | null;
  isPopular: boolean;
};

type PricingProps = {
  plans?: Plan[];
};

export default function CreatorPricingSection({ plans }: PricingProps) {
  const safePlans = Array.isArray(plans) ? plans : [];
  // Use dummy if no plans provided
  const displayPlans = safePlans.length > 0 ? safePlans : [
    {
      id: "1",
      title: "Standard MIX",
      price: "5000",
      description: "歌ってみたの基本的なMIXプラン。高品質な仕上がりをお求めの方へ。",
      period: "7〜14日",
      revisions: "2回まで",
      isPopular: false
    },
    {
      id: "2",
      title: "Premium MIX",
      price: "8000",
      description: "より細かなニュアンス調整と、複数トラックのハモリ生成が含まれた上位プラン。",
      period: "優先着手",
      revisions: "5回まで",
      isPopular: true
    }
  ];

  return (
    <section className="py-24 bg-[#0f1013] relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
              Simple <span className="text-[#f59e0b]">Pricing</span>
            </h2>
            <p className="text-gray-400 font-medium max-w-2xl mx-auto">
              わかりやすい明朗会計。オプションによる追加料金を最小限に抑えています。
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {displayPlans.map((plan, idx) => {
            // Generate basic features from plan data
            const features = [
              "ピッチ・タイミング補正",
              "ノイズ除去・整音",
              "エフェクト処理・マスタリング",
              plan.revisions ? `修正 ${plan.revisions}` : "修正対応あり",
              plan.period ? `納期目安: ${plan.period}` : "納期はご相談"
            ];
            
            return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className={`relative bg-[#1e1f22] rounded-3xl p-8 border ${
                plan.isPopular 
                  ? "border-[#f59e0b] shadow-[0_0_30px_rgba(245,158,11,0.15)]" 
                  : "border-[#313338]"
              } flex flex-col h-full`}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#f59e0b] text-white text-xs font-bold tracking-widest px-4 py-1.5 rounded-full shadow-lg uppercase">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.title}</h3>
                <p className="text-gray-400 text-sm h-10">{plan.description}</p>
              </div>

              <div className="mb-8">
                <span className="text-5xl font-black text-white tracking-tighter">¥{plan.price}</span>
              </div>

              <div className="space-y-4 mb-10 flex-1">
                {features.map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#f59e0b]/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={12} className="text-[#f59e0b]" strokeWidth={3} />
                    </div>
                    <span className="text-gray-300 text-sm font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              <Link 
                href="/order"
                className={`w-full py-4 rounded-xl font-bold text-center transition-all flex items-center justify-center gap-2 ${
                  plan.isPopular 
                    ? "bg-[#f59e0b] text-white hover:bg-orange-500 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]" 
                    : "bg-[#313338] text-white hover:bg-[#313338]/80"
                }`}
              >
                このプランで依頼する
                <ChevronRight size={18} />
              </Link>
            </motion.div>
          );
        })}
        </div>

      </div>
    </section>
  );
}
