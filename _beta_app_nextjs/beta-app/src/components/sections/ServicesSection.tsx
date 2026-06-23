"use client";

import { motion } from "framer-motion";
import { Mic2, Music, Sparkles, Check } from "lucide-react";

export default function ServicesSection() {
  const services = [
    {
      title: "ボーカルMIX / マスタリング",
      icon: <Mic2 size={32} className="text-amber-500" />,
      color: "bg-amber-100 border-amber-200",
      features: [
        "ピッチ（音程）補正",
        "タイミング（リズム）補正",
        "ハモリ生成（オプション）",
        "ノイズ除去",
        "エフェクト処理・マスタリング"
      ],
      desc: "スマホ録音からスタジオ録音まで、音源の状態に合わせて最適な処理を行います。"
    },
    {
      title: "オリジナル楽曲制作",
      icon: <Music size={32} className="text-orange-500" />,
      color: "bg-orange-100 border-orange-200",
      features: [
        "作詞・作曲",
        "編曲（アレンジ）",
        "Inst（カラオケ）音源制作",
        "パラデータ書き出し",
        "ボーカルパラMIX"
      ],
      desc: "「こんな曲が作りたい！」というフワッとしたイメージからでも形にします。"
    }
  ];

  return (
    <section className="py-24 relative bg-gray-50/50">
      <div className="container mx-auto px-6 max-w-5xl">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-600 font-black text-sm mb-4">
            <Sparkles size={18} />
            SERVICES
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-gray-800 mb-6">サービス内容</h2>
          <p className="text-gray-600 font-bold text-lg max-w-2xl mx-auto">
            ご依頼内容に合わせて、必要な作業をすべてカバーします。
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="bg-white rounded-[2rem] p-8 md:p-10 shadow-xl shadow-gray-200/50 border-2 border-gray-100"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-16 h-16 rounded-2xl ${service.color} border-2 flex items-center justify-center transform -rotate-3`}>
                  {service.icon}
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-gray-800 leading-tight">
                  {service.title.split(' / ').map((t, i) => (
                    <span key={i} className="block">{t}</span>
                  ))}
                </h3>
              </div>
              
              <p className="text-gray-600 font-bold mb-8">
                {service.desc}
              </p>

              <div className="space-y-3 bg-gray-50 rounded-2xl p-6 border-2 border-gray-100/50 mb-6">
                <h4 className="text-sm font-black text-gray-400 mb-2 tracking-widest">含まれる内容</h4>
                {service.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-white shrink-0">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <span className="font-bold text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-auto">
                <a 
                  href={idx === 0 ? "/mix" : "/mix?tab=original"} 
                  className="block w-full text-center py-4 rounded-xl font-bold bg-white border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white transition-all shadow-sm"
                >
                  料金・詳細を見る
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
