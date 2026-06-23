"use client";

import { motion } from "framer-motion";

export default function OfficialFlowSection() {
  const flows = [
    {
      num: "01",
      title: "お問い合わせ・お見積り",
      desc: "ContactフォームやTwitter DMより、音源のURLやご希望の納期・プランを添えてご連絡ください。内容を確認し、お見積りとスケジュールをご案内します。"
    },
    {
      num: "02",
      title: "データ入稿・お支払い",
      desc: "お見積りにご納得いただけましたら、ボーカルデータとオケ音源をご提出いただきます。指定の口座または決済リンクよりお支払いをお願いいたします。"
    },
    {
      num: "03",
      title: "MIX・マスタリング作業",
      desc: "ノイズ除去、ピッチ・タイミング補正から始まり、エフェクト処理、マスタリングまで、一つ一つの工程を丁寧に行います。"
    },
    {
      num: "04",
      title: "初稿提出・ご確認",
      desc: "完成した音源（初稿）をお渡しします。ご試聴いただき、エコーの強さやバランスなど、気になる点がございましたらお申し付けください。"
    },
    {
      num: "05",
      title: "修正・完全納品",
      desc: "修正のご要望を反映し、最終確認が取れましたら、YouTube等にそのまま投稿できる形式（WAV/MP3）にて完全納品となります。"
    }
  ];

  return (
    <section id="flow" className="py-32 bg-white">
      <div className="container mx-auto px-6 max-w-4xl">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-24"
        >
          <span className="tracking-[0.2em] text-xs text-amber-600 uppercase font-bold mb-4 block">Workflow</span>
          <h2 className="text-3xl md:text-4xl font-serif text-gray-900 tracking-wide">制作の流れ</h2>
        </motion.div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="hidden md:block absolute left-[15%] top-0 bottom-0 w-px bg-gray-200"></div>

          <div className="space-y-16">
            {flows.map((flow, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: idx * 0.1, duration: 0.8 }}
                className="flex flex-col md:flex-row relative"
              >
                <div className="md:w-[30%] flex md:justify-center mb-4 md:mb-0 relative z-10">
                  <div className="bg-white px-2">
                    <span className="text-3xl font-serif text-amber-600 font-bold">{flow.num}</span>
                  </div>
                </div>
                <div className="md:w-[70%] md:pl-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 tracking-wide">{flow.title}</h3>
                  <p className="text-gray-500 text-sm leading-loose tracking-wide">
                    {flow.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
