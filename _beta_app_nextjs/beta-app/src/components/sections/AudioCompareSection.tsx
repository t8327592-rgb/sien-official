"use client";

import { motion } from "framer-motion";
import { Headphones } from "lucide-react";
import AudioCompare from "@/components/AudioCompare";
import Link from "next/link";

export default function AudioCompareSection() {
  return (
    <section className="py-24 relative overflow-hidden bg-white">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-block px-4 py-1.5 rounded-full bg-orange-100 text-orange-600 font-bold text-xs tracking-widest uppercase mb-4">
            Quality
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-gray-800 mb-6 flex items-center justify-center gap-3">
            <Headphones className="text-orange-500" size={36} />
            音質の変化を体感
          </h2>
          <p className="text-gray-600 font-bold text-lg max-w-2xl mx-auto leading-relaxed">
            ピッチやタイミングの自然な補正と、オケに馴染むボーカル処理。<br />
            まずは実際のサウンドでご確認ください。
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <AudioCompare 
            title="モニタリング（DECO*27）"
            genre="ロック / ポップス"
            beforeSrc="/assets/sample1_before.mp3"
            afterSrc="/assets/sample1_after.mp3"
          />
          
          <div className="mt-12 text-center">
            <Link 
              href="/pricing" 
              className="px-6 py-3 bg-white text-orange-500 rounded-full font-black text-sm hover:scale-105 transition-transform shadow-lg border border-orange-100"
            >
              他のサンプル・料金を見る
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
