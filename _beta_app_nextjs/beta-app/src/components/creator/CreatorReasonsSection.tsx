"use client";

import { motion } from "framer-motion";
import { Zap, Headphones, ShieldCheck, Sparkles } from "lucide-react";

export default function CreatorReasonsSection() {
  const reasons = [
    {
      title: "圧倒的な実績と経験値",
      desc: "累計800件以上の歌ってみたMIXを担当。初心者からプロVチューバーまで、どんな音源でも最高のアウトプットに仕上げるノウハウがあります。",
      icon: <Headphones className="text-brand" size={28} />,
      color: "bg-orange-500/10 border-orange-500/20"
    },
    {
      title: "最速レスポンス＆納品",
      desc: "「今すぐ投稿したい」に応えるため、最短即日納品オプションをご用意。通常依頼でも7〜14日と業界トップクラスのスピードでお届けします。",
      icon: <Zap className="text-yellow-400" size={28} />,
      color: "bg-yellow-400/10 border-yellow-400/20"
    },
    {
      title: "納得いくまで修正対応",
      desc: "「ここのハモリをもう少し大きく」「エコーを減らしたい」など、細かいニュアンスの調整も最大5回まで無料で対応。妥協させません。",
      icon: <ShieldCheck className="text-green-400" size={28} />,
      color: "bg-green-400/10 border-green-400/20"
    },
    {
      title: "歌い手の個性を殺さないMIX",
      desc: "ただピッチを合わせるだけではなく、ブレスの生々しさや感情の乗ったニュアンスを大切に、「作品としての魅力」を引き出します。",
      icon: <Sparkles className="text-purple-400" size={28} />,
      color: "bg-purple-400/10 border-purple-400/20"
    }
  ];

  return (
    <section className="py-24 bg-[#0f1013]">
      <div className="container mx-auto px-6 max-w-7xl">
        
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
              Why <span className="text-[#f59e0b]">Choose Us</span>
            </h2>
            <p className="text-gray-400 font-medium max-w-2xl text-lg">
              「また次もお願いしたい」と言われる理由。
            </p>
          </motion.div>
        </div>

        {/* Discord/Modern Tech Card Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {reasons.map((reason, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="bg-[#1e1f22] p-8 rounded-[2rem] border border-[#313338] hover:border-[#313338]/80 hover:bg-[#313338]/50 transition-all duration-300 group relative overflow-hidden"
            >
              {/* Subtle background glow effect on hover */}
              <div className="absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2rem] bg-gradient-to-r from-[#f59e0b]/10 to-transparent pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row gap-6 relative z-10">
                <div className={`w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center border ${reason.color} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-lg`}>
                  {reason.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#f59e0b] transition-colors">
                    {reason.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed font-medium">
                    {reason.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
