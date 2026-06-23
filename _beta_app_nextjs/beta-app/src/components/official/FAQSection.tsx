"use client";

import { motion } from "framer-motion";

export default function OfficialFAQSection() {
  const faqs = [
    {
      q: "MIX依頼が初めてでも大丈夫ですか？",
      a: "もちろん可能です。必要なデータの準備方法から納品まで、専門用語をなるべく使わずに丁寧にご案内いたしますので、安心してご相談ください。"
    },
    {
      q: "スマホ録音の音源でも依頼できますか？",
      a: "可能です。スマホ録音特有のノイズ除去や音質補正を徹底的に行い、スタジオ録音に近いクオリティまで引き上げます。"
    },
    {
      q: "修正は何回まで可能ですか？",
      a: "ご納得いただける作品にするため、基本プラン内で最大5回まで無料で対応しております。細かいニュアンスの調整も遠慮なくお申し付けください。"
    },
    {
      q: "納期はどれくらいですか？",
      a: "通常は音源お預かり後、7日〜14日程度で納品いたします。お急ぎの場合は、最短即日納品が可能な「スピードプラン」もご用意しております。"
    },
    {
      q: "お支払い方法について教えてください。",
      a: "クレジットカード決済、または銀行振込に対応しております。"
    }
  ];

  return (
    <section id="faq" className="py-32 bg-gray-50">
      <div className="container mx-auto px-6 max-w-4xl">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-24"
        >
          <span className="tracking-[0.2em] text-xs text-amber-600 uppercase font-bold mb-4 block">F.A.Q</span>
          <h2 className="text-3xl md:text-4xl font-serif text-gray-900 tracking-wide">よくあるご質問</h2>
        </motion.div>

        <div className="space-y-8">
          {faqs.map((faq, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.1, duration: 0.8 }}
              className="border-b border-gray-200 pb-8"
            >
              <h3 className="flex items-start gap-4 font-bold text-gray-900 text-base md:text-lg mb-4 tracking-wide">
                <span className="text-amber-500 font-serif text-xl leading-none">Q.</span>
                <span className="mt-0.5">{faq.q}</span>
              </h3>
              <div className="flex items-start gap-4 text-gray-500">
                <span className="text-gray-300 font-serif text-xl leading-none">A.</span>
                <span className="mt-0.5 text-sm leading-loose tracking-wide">{faq.a}</span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
