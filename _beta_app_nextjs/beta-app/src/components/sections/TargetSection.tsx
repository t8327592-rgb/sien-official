"use client";

import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function TargetSection() {
  const targets = [
    "初めて歌ってみたを投稿する",
    "MIX依頼が初めてで不安",
    "K-POP系のバキッとした音にしたい",
    "ピッチ補正を自然に仕上げてほしい",
    "スマホ録音の音源でも相談したい",
    "オケとボーカルが馴染まない"
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-white/50">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-600 font-black text-sm mb-4">
            <AlertCircle size={18} />
            FOR YOU
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-gray-800 mb-6">こんな人におすすめ</h2>
          <p className="text-gray-600 font-bold text-lg">
            当てはまる方は、ぜひ一度ご相談ください！
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-orange-100/30 border-2 border-orange-50 relative"
        >
          {/* Decorative clip art */}
          <div className="absolute -top-6 -right-6 text-6xl opacity-20 transform rotate-12">🤔</div>
          <div className="absolute -bottom-4 -left-4 text-6xl opacity-20 transform -rotate-12">💡</div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
            {targets.map((target, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.4 }}
                className="flex items-start gap-4"
              >
                <div className="shrink-0 mt-1 text-orange-500">
                  <CheckCircle2 size={24} className="fill-orange-100" />
                </div>
                <p className="text-gray-800 font-black text-lg md:text-xl leading-snug">
                  {target}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
