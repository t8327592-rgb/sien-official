"use client";

import { motion } from "framer-motion";

export default function OfficialServicesSection() {
  const services = [
    {
      num: "01",
      title: "Vocal Mixing",
      jpTitle: "ボーカルMIX",
      desc: "ノイズ処理からEQ、コンプレッサー、空間系のエフェクト処理まで、オケとボーカルが最も美しく融合するバランスを追求します。"
    },
    {
      num: "02",
      title: "Pitch & Timing",
      jpTitle: "ピッチ・タイミング補正",
      desc: "機械的な不自然さを出さず、歌い手のニュアンスを保ったまま正確な音程とリズムへ補正します。"
    },
    {
      num: "03",
      title: "Harmony Generation",
      jpTitle: "ハモリ生成",
      desc: "メインボーカルのトラックのみでも、楽曲に合わせた自然なハモリパートを生成し、コーラスの厚みを出します。"
    },
    {
      num: "04",
      title: "Mastering",
      jpTitle: "マスタリング",
      desc: "YouTubeや各種配信プラットフォームの仕様に合わせ、適切な音圧と最終的な質感の調整を行います。"
    }
  ];

  return (
    <section id="services" className="py-32 bg-gray-50">
      <div className="container mx-auto px-6 max-w-6xl">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-24"
        >
          <span className="tracking-[0.2em] text-xs text-amber-600 uppercase font-bold mb-4 block">Services</span>
          <h2 className="text-3xl md:text-4xl font-serif text-gray-900 tracking-wide">サービス内容</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
          {services.map((service, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.1, duration: 0.8 }}
              className="bg-white rounded-3xl p-8 md:p-10 border-4 border-gray-50 shadow-sm hover:shadow-xl hover:-translate-y-3 hover:rotate-1 hover:border-amber-200 transition-all duration-300 group"
            >
              <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-transform shadow-inner border border-amber-100 font-serif text-2xl font-bold">
                {service.num}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 tracking-wide">{service.title}</h3>
              <p className="text-xs text-amber-600 font-bold mb-3 tracking-widest">{service.jpTitle}</p>
              <p className="text-gray-600 text-sm leading-relaxed">
                {service.desc}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
