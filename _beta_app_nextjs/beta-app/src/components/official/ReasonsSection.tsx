"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock, Headphones, MessageSquare, Star } from "lucide-react";

export default function OfficialReasonsSection() {
  const reasons = [
    {
      title: "実績800件以上",
      desc: "初めての依頼からプロの案件まで、確かな技術と経験であなたの歌声の魅力を引き出します。",
      icon: <Headphones className="text-amber-500" size={24} />,
    },
    {
      title: "最短即日納品",
      desc: "「すぐに投稿したい！」というご要望にも対応可能。通常納期も7〜14日とスピーディです。",
      icon: <Clock className="text-amber-500" size={24} />,
    },
    {
      title: "修正最大5回無料",
      desc: "細かいニュアンスの調整も妥協しません。ご納得いただけるまで何度でも寄り添います。",
      icon: <CheckCircle2 className="text-amber-500" size={24} />,
    },
  ];

  const testimonials = [
    {
      name: "歌い手 A様",
      text: "初めての依頼で不安でしたが、とても優しく丁寧に教えていただき安心しました！音源のクオリティも最高で、自分の声じゃないみたいです！次も絶対依頼します！",
      platform: "Twitter DMより",
      rating: 5,
    },
    {
      name: "VTuber B様",
      text: "スマホ録音だったのでノイズが心配でしたが、綺麗に消していただき感動しました。オケとの馴染み具合も完璧です。迅速な対応ありがとうございました！",
      platform: "ココナラ評価より",
      rating: 5,
    },
    {
      name: "配信者 C様",
      text: "細かいピッチの修正や、エコーの強さなど、何度も要望を出してしまいましたが、全て快く対応してくださいました。お値段以上のクオリティです！",
      platform: "Skeb評価より",
      rating: 5,
    },
  ];

  return (
    <section className="py-32 bg-gray-50 border-y border-gray-100">
      <div className="container mx-auto px-6 max-w-6xl">
        
        {/* Section Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="tracking-[0.2em] text-xs text-amber-600 uppercase font-bold mb-4 block">
              Why Choose Us
            </span>
            <h2 className="text-3xl md:text-5xl font-serif text-gray-900 tracking-wide mb-6">
              選ばれる理由
            </h2>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-2xl mx-auto tracking-wide">
              「有名だから」ではなく、「依頼して良かった」と言っていただけるクオリティと対応力を。
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {reasons.map((reason, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: idx * 0.1 }}
              className="bg-white p-8 md:p-10 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 hover:rotate-1 hover:border-amber-200 transition-all duration-300 group"
            >
              <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-100 shadow-inner flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-12 transition-transform">
                {reason.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{reason.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {reason.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
