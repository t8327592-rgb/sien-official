"use client";

import { motion } from "framer-motion";
import { MessageCircle, Headphones, CheckCircle2, ArrowRight, Route } from "lucide-react";
import Link from "next/link";

export default function FlowSection() {
  const steps = [
    {
      num: "01",
      title: "ご相談・お見積り",
      desc: "まずはフォーム等から「こんな感じにしたい」とお気軽にご相談ください。",
      icon: <MessageCircle size={28} />
    },
    {
      num: "02",
      title: "制作開始",
      desc: "音源データを受領次第、丁寧にMIX作業をスタートします。",
      icon: <Headphones size={28} />
    },
    {
      num: "03",
      title: "修正・納品",
      desc: "音源をご確認いただき、気になる点を修正後、完成品をお渡しします。",
      icon: <CheckCircle2 size={28} />
    }
  ];

  return (
    <section id="flow" className="py-24 relative bg-gray-50/50 border-y border-gray-100">
      <div className="container mx-auto px-6 max-w-5xl">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-600 font-black text-sm mb-4">
            <Route size={18} />
            FLOW
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-gray-800 mb-6">制作の流れ</h2>
          <p className="text-gray-600 font-bold text-lg max-w-2xl mx-auto">
            初めての方でも迷わないように、シンプルで分かりやすい手順で進めます。
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative mb-12">
          {/* Desktop Arrow Connectors */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0"></div>

          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="bg-white rounded-[2rem] p-8 border-2 border-orange-100/50 shadow-xl shadow-gray-200/40 relative z-10 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center font-black text-2xl mb-6 shadow-sm border-4 border-white">
                {step.icon}
              </div>
              <div className="text-orange-400 font-black text-sm mb-2">STEP {step.num}</div>
              <h3 className="text-xl font-black text-gray-800 mb-4">{step.title}</h3>
              <p className="text-gray-600 font-medium text-sm leading-relaxed">
                {step.desc}
              </p>
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
            より詳しい料金表・お支払いについて <ArrowRight size={20} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
