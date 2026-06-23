"use client";

import { motion } from "framer-motion";
import { HelpCircle, ChevronRight, MessageCircleQuestion } from "lucide-react";
import Link from "next/link";

export default function FAQSection() {
  const faqs = [
    {
      q: "MIX依頼が初めてでも大丈夫ですか？",
      a: "もちろん大歓迎です！音源の準備方法からご提出まで、分かりやすくサポートいたします。「何を伝えればいいか分からない」という方でも、丁寧にヒアリングしながら理想の音を作っていきますのでご安心ください。"
    },
    {
      q: "スマホ録音の音源でも依頼できますか？",
      a: "はい、可能です！スマホ録音特有のノイズ除去や音質補正を徹底的に行い、オケに馴染むプロクオリティの音源へと引き上げます。録音環境に不安がある方もまずはお気軽にご相談ください。"
    },
    {
      q: "修正は何回まで可能ですか？",
      a: "ご納得いただける作品にするため、基本プラン内で【最大5回】まで無料で対応しております！細かいニュアンスの調整なども遠慮なくお申し付けください。"
    },
    {
      q: "納期はどれくらいですか？",
      a: "通常は音源お預かり後【7日〜14日】で納品いたします。「急ぎで投稿したい！」という方向けに、最短即日納品が可能な『スピードプラン』もご用意しております。"
    },
    {
      q: "見積もりだけの相談でも大丈夫ですか？",
      a: "はい、お見積りやご相談だけでも大歓迎です！「自分の音源だといくらになる？」「こんな加工はできる？」など、気になることがあれば24時間いつでもお気軽にご連絡ください。"
    }
  ];

  return (
    <section id="faq" className="py-24 relative overflow-hidden bg-background">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-600 font-black text-sm mb-4">
            <HelpCircle size={18} />
            FAQ
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-gray-800 mb-6">よくあるご質問</h2>
          <p className="text-gray-600 font-bold text-lg max-w-2xl mx-auto">
            ご依頼前の不安はこちらで解消できます。
          </p>
        </motion.div>

        <div className="space-y-4 mb-12">
          {faqs.map((faq, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="bg-white rounded-3xl p-6 md:p-8 border-2 border-gray-100 shadow-md"
            >
              <h3 className="flex items-start gap-3 font-black text-gray-800 text-lg md:text-xl mb-4">
                <span className="text-orange-500 text-2xl leading-none">Q.</span>
                <span className="mt-1">{faq.q}</span>
              </h3>
              <div className="flex items-start gap-3 text-gray-600 font-bold bg-gray-50 rounded-2xl p-5 border border-gray-100/50">
                <span className="text-amber-500 font-black text-2xl leading-none">A.</span>
                <span className="mt-1 leading-relaxed">{faq.a}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link href="/pricing" className="inline-flex items-center gap-2 text-orange-500 font-black hover:text-orange-600 transition-colors bg-orange-50 px-6 py-3 rounded-full">
            <MessageCircleQuestion size={20} />
            より詳しい情報を見る <ChevronRight size={20} />
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
