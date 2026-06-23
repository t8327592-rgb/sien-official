"use client";

import { motion } from "framer-motion";
import { Settings2, Cpu } from "lucide-react";

export default function EquipmentSection() {
  const tools = [
    { name: "iZotope RX", category: "ノイズ処理" },
    { name: "Melodyne", category: "ピッチ/タイミング補正" },
    { name: "Waves", category: "総合エフェクト" },
    { name: "UAD", category: "アナログモデリング" },
    { name: "Ozone", category: "マスタリング" },
    { name: "AutoTune", category: "ケロケロボイス等" }
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-background">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-600 font-black text-sm mb-4">
            <Settings2 size={18} />
            EQUIPMENT
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-gray-800 mb-6">使用機材 / プラグイン</h2>
          <p className="text-gray-600 font-bold text-lg max-w-2xl mx-auto leading-relaxed">
            iZotope RX / Melodyne / Waves 等を使用し、<br />
            ノイズ処理から細かなピッチ補正まで丁寧に対応します。
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/50 border-2 border-gray-100"
        >
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {tools.map((tool, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05, duration: 0.4 }}
                className="bg-gray-50 rounded-2xl p-4 flex flex-col justify-center items-center text-center border border-gray-100"
              >
                <Cpu size={24} className="text-gray-400 mb-2" />
                <span className="font-black text-gray-800">{tool.name}</span>
                <span className="text-xs font-bold text-gray-500 mt-1">{tool.category}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
