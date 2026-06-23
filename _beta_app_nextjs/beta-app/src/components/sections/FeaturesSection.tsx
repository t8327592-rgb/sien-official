"use client";

import { motion } from "framer-motion";
import { Mic2, Activity, Layers, Clock, HeartHandshake, Sparkles } from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      title: "高品質なピッチ補正",
      description: "不自然なケロケロ感を出さず、原曲のニュアンスやあなたの個性を活かした自然で正確なピッチ補正を行います。",
      icon: <Activity size={28} className="text-orange-500" />
    },
    {
      title: "自然なタイミング補正",
      description: "リズムのズレを修正しつつ、グルーヴ感や人間らしさを損なわない絶妙なタイミング補正にこだわっています。",
      icon: <Clock size={28} className="text-amber-500" />
    },
    {
      title: "ハモリ生成対応",
      description: "「メインボーカルしか録音できない…」という方でも安心。こちらで自然なハモリパートを生成し、楽曲に厚みを持たせます。",
      icon: <Layers size={28} className="text-blue-500" />
    },
    {
      title: "迅速な修正対応",
      description: "「もう少しエコーを減らしたい」「ここだけ直したい」といったご要望にも、基本プラン内で最大5回まで迅速・柔軟に対応します。",
      icon: <Mic2 size={28} className="text-green-500" />
    },
    {
      title: "初心者歓迎（サポート充実）",
      description: "MIX依頼が初めての方も大歓迎！データの書き出し方から納品まで、専門用語を使わずに丁寧にご案内いたします。",
      icon: <HeartHandshake size={28} className="text-red-500" />
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-gray-50/50">
      <div className="container mx-auto px-6 max-w-6xl">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-600 font-black text-sm mb-4">
            <Sparkles size={18} />
            REASON
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-gray-800 mb-6">選ばれる5つの理由</h2>
          <p className="text-gray-600 font-bold text-lg max-w-2xl mx-auto">
            あなたの歌声を「作品」へと昇華させるための、<br className="md:hidden" />こだわりとサポート体制。
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="bg-white rounded-3xl p-8 border-2 border-gray-100 shadow-xl shadow-gray-200/50 hover:border-orange-200 hover:-translate-y-1 transition-all"
            >
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-6 border border-gray-100 shadow-inner">
                {f.icon}
              </div>
              <h3 className="text-xl font-black text-gray-800 mb-4">{f.title}</h3>
              <p className="text-gray-600 font-medium leading-relaxed">
                {f.description}
              </p>
            </motion.div>
          ))}
          
          {/* 最後の1枠（6枠目）をCTAスペースにする */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-8 shadow-xl shadow-amber-300/40 flex flex-col items-center justify-center text-center group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
            <h3 className="text-2xl font-black text-white mb-4 relative z-10">まずは無料相談から</h3>
            <p className="text-orange-50 font-medium mb-6 relative z-10">
              どんな小さな疑問でも<br/>お気軽にお問い合わせください。
            </p>
            <a href="/order" className="px-6 py-3 bg-white text-orange-500 rounded-full font-black text-sm hover:scale-105 transition-transform shadow-lg relative z-10">
              お見積り・ご相談
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
