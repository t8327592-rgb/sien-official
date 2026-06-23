"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import OfficialPricingSection from "@/components/official/PricingSection";
import OfficialFlowSection from "@/components/official/FlowSection";
import OfficialFAQSection from "@/components/official/FAQSection";

type Plan = {
  id: string;
  title: string;
  price: string;
  description: string;
  period: string | null;
  revisions: string | null;
  isPopular: boolean;
};

export default function OfficialPricingPageClient({ plans }: { plans: Plan[] }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header / Nav */}
      <div className="container mx-auto px-6 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-amber-600 transition-colors uppercase tracking-widest font-bold">
          <ArrowLeft size={16} />
          Back to Top
        </Link>
      </div>

      <div className="pt-12 pb-32">
        <div className="container mx-auto px-6 max-w-4xl text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="tracking-[0.2em] text-xs text-amber-600 uppercase font-bold mb-4 block">Pricing & Workflow</span>
            <h1 className="text-4xl md:text-5xl font-serif text-gray-900 tracking-wide mb-6">料金と制作の流れ</h1>
            <p className="text-gray-500 text-sm tracking-widest leading-loose">
              すべてのプランに、ボーカルの魅力を引き出すプロフェッショナルな<br className="hidden md:block" />
              ピッチ補正・タイミング補正・マスタリングが含まれています。
            </p>
          </motion.div>
        </div>

        {/* 料金セクション（公式コンポーネントを流用しつつ、全件表示に対応するためラッパー不要だがそのまま使う） */}
        <div className="-mt-16">
          <OfficialPricingSection plans={plans} showLink={false} />
        </div>

        <div className="border-t border-gray-100">
          <OfficialFlowSection />
        </div>

        <div className="border-t border-gray-100">
          <OfficialFAQSection />
        </div>

        {/* CTA */}
        <div className="container mx-auto px-6 max-w-4xl text-center mt-16 pt-16 border-t border-gray-100">
          <h2 className="text-2xl font-serif text-gray-900 mb-8">
            ご不明な点はございませんか？
          </h2>
          <Link 
            href="/order" 
            className="inline-flex items-center justify-center gap-4 px-12 py-5 bg-black text-white text-sm tracking-widest hover:bg-amber-600 transition-colors duration-500 group"
          >
            お見積り・お問い合わせ
            <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform duration-500" />
          </Link>
        </div>

      </div>
    </div>
  );
}
