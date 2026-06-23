"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function CreatorFAQSection() {
  const faqs = [
    {
      q: "スマホ録音でも依頼できますか？",
      a: "はい、可能です！ノイズ除去やタイミング補正を丁寧に行いますので、スマホ録音でも十分なクオリティに仕上げることができます。ただし、録音環境（部屋の反響など）にはご注意ください。"
    },
    {
      q: "ピッチ補正（ケロケロ加工）は料金内で対応してもらえますか？",
      a: "はい、通常のピッチ補正も、ケロケロ加工（Auto-Tune風）も追加料金なしで対応可能です。ご依頼時にお好みのテイストをお伝えください。"
    },
    {
      q: "ハモリパートを自分で歌うのが難しいのですが…",
      a: "メインボーカルのみお送りいただければ、こちらで自然なハモリ（上・下など）を生成することが可能です。Premiumプランなら無制限で対応いたします。"
    },
    {
      q: "納品後の修正は可能ですか？",
      a: "もちろんです。Standardプランは2回まで、Premiumプランは5回まで無料で修正対応いたします。「もう少しボーカルを大きく」など、遠慮なくお申し付けください。"
    }
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 bg-[#1e1f22]">
      <div className="container mx-auto px-6 max-w-4xl">
        
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
              F<span className="text-[#f59e0b]">A</span>Q
            </h2>
            <p className="text-gray-400 font-medium text-lg">
              よくあるご質問
            </p>
          </motion.div>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`border rounded-2xl overflow-hidden transition-colors duration-300 ${
                  isOpen ? "bg-[#2b2d31] border-[#f59e0b]/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]" : "bg-[#2b2d31]/50 border-[#313338] hover:border-gray-500"
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className={`font-bold text-lg transition-colors ${isOpen ? "text-white" : "text-gray-300"}`}>
                    <span className="text-[#f59e0b] mr-3 font-black">Q.</span>
                    {faq.q}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${isOpen ? "bg-[#f59e0b]/20 text-[#f59e0b] rotate-180" : "bg-[#313338] text-gray-400"}`}>
                    <ChevronDown size={18} />
                  </div>
                </button>
                
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="p-6 pt-0 border-t border-[#313338]/50 text-gray-400 leading-relaxed font-medium">
                        <span className="text-gray-500 mr-3 font-bold">A.</span>
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
