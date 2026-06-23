"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowDown, PlayCircle } from "lucide-react";

export default function OfficialHeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden bg-black text-white pt-20">
      {/* Background Image with Dark Overlay */}
      <div className="absolute inset-0 w-full h-full overflow-hidden -z-20">
        <div className="absolute inset-0 bg-black/60 z-10"></div>
        <img
          src="/1.jpg"
          alt="Studio Background"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
      </div>

      <div className="container mx-auto px-6 relative z-10 flex flex-col items-center">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-400 text-xs md:text-sm font-bold tracking-widest uppercase">
              歌ってみた専門 MIX & MASTERING
            </span>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-8 leading-tight"
          >
            あなたの声を、<br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">作品</span>へ。
          </motion.h1>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-gray-300 text-sm md:text-base font-bold tracking-widest mb-12"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              累計800作品以上担当
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              総再生数1000万回突破
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              最短即日納品対応
            </div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6"
          >
            <Link 
              href="/pricing" 
              className="px-8 py-4 bg-amber-500 text-white font-bold tracking-widest rounded-full hover:bg-amber-600 hover:scale-105 transition-all duration-300 w-full sm:w-auto shadow-lg shadow-amber-500/25"
            >
              依頼する・料金を見る
            </Link>
            <Link 
              href="#works" 
              className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold tracking-widest rounded-full hover:bg-white hover:text-gray-900 transition-colors duration-300 w-full sm:w-auto flex items-center justify-center gap-3"
            >
              <PlayCircle size={18} />
              制作実績を見る
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Down Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-400"
      >
        <span className="text-[10px] tracking-[0.2em] uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <ArrowDown size={16} />
        </motion.div>
      </motion.div>
    </section>
  );
}
