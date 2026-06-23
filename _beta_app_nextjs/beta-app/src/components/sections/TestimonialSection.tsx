"use client";

import { motion } from "framer-motion";
import { Star, MessageSquareHeart, BadgeCheck } from "lucide-react";

export default function TestimonialSection() {
  const testimonials = [
    {
      name: "匿名希望 様",
      handle: "@client_A",
      type: "歌ってみたMIX依頼",
      text: "初めての依頼で不安でしたが、DMでのやり取りがとても丁寧で安心してお願いできました！細かい修正にも快く応じてくださり、理想以上の仕上がりになりました😭✨\n\nまた絶対お願いします！",
      date: "2026年4月"
    },
    {
      name: "A.Y 様",
      handle: "@vocal_B",
      type: "K-POP系ボーカルMIX",
      text: "バキバキでかっこいい音にしたかったのですが、オケに埋もれないアタック感とクリアな高音を出していただいて大満足です🎧\n\n返信も納品も早くて本当に助かりました！最強です！",
      date: "2026年5月"
    },
    {
      name: "匿名 様",
      handle: "@original_C",
      type: "オリジナル曲MIX",
      text: "スマホ録音だったため音質が心配でしたが、ノイズ処理やピッチ補正をとても自然に仕上げていただき、本当にプロの音になりました…！\n\nしえんさんに頼んで良かったです！",
      date: "2026年6月"
    }
  ];

  return (
    <section className="py-24 relative bg-gray-50/50 border-y border-gray-100">
      <div className="container mx-auto px-6 max-w-6xl">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-600 font-black text-sm mb-4">
            <MessageSquareHeart size={18} />
            VOICE
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-gray-800 mb-6">お客様の声</h2>
          <p className="text-gray-600 font-bold text-lg max-w-2xl mx-auto">
            「頼んでよかった！」<br className="md:hidden" />ご依頼いただいた方々のリアルな声をご紹介します。
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="bg-white rounded-3xl p-6 md:p-8 border-2 border-gray-100 shadow-xl shadow-gray-200/50 relative flex flex-col"
            >
              {/* X Post Header (Avatar, Name, Handle) */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-gray-400 font-bold text-xl">{t.name.charAt(0)}</span>
                </div>
                <div>
                  <div className="flex items-center gap-1 font-black text-gray-800">
                    {t.name} <BadgeCheck size={16} className="text-blue-500" />
                  </div>
                  <div className="text-sm font-bold text-gray-400">{t.handle}</div>
                </div>
                <div className="ml-auto text-gray-300">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                </div>
              </div>

              {/* Star Rating */}
              <div className="flex gap-1 mb-4 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} fill="currentColor" />
                ))}
              </div>

              {/* Tweet Text */}
              <p className="text-gray-700 font-medium leading-relaxed mb-6 text-sm md:text-base whitespace-pre-line">
                {t.text}
              </p>

              {/* Footer / Tags */}
              <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-md">#{t.type}</span>
                <span className="text-xs font-medium text-gray-400">{t.date}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
