"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { PlayCircle, ArrowRight, Mic2 } from "lucide-react";

export default function CreatorHeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  return (
    <section className="relative min-h-[90vh] flex flex-col justify-center overflow-hidden bg-[#0f1013] pt-24 pb-16">
      {/* Abstract Background Elements (Neon Glows) */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#f59e0b]/10 rounded-full mix-blend-screen filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full mix-blend-screen filter blur-[100px] pointer-events-none" />
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-5 pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10 flex flex-col items-center">
        <motion.div
          className="max-w-5xl mx-auto w-full text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Status Badge */}
          <motion.div variants={itemVariants} className="mb-8 flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2b2d31] border border-[#313338] shadow-lg">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f59e0b] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#f59e0b]"></span>
              </span>
              <span className="text-xs font-bold text-gray-300 tracking-wider">
                ACCEPTING NEW MIX REQUESTS
              </span>
            </div>
          </motion.div>

          {/* Main Title */}
          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 leading-[1.1]"
          >
            Vocal Mix & <br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f59e0b] to-orange-400 glow-text">
              Mastering
            </span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-gray-400 text-base md:text-xl font-medium max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            歌い手・VTuber特化のプロフェッショナルMIX。
            あなたの個性を殺さず、作品として最高の一曲に仕上げます。
          </motion.p>

          {/* Key Stats Grid */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-16"
          >
            <div className="bg-[#1e1f22]/50 border border-[#313338] rounded-2xl p-4 backdrop-blur-sm">
              <div className="text-2xl font-black text-white mb-1">800<span className="text-[#f59e0b] text-lg">+</span></div>
              <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Works</div>
            </div>
            <div className="bg-[#1e1f22]/50 border border-[#313338] rounded-2xl p-4 backdrop-blur-sm">
              <div className="text-2xl font-black text-white mb-1">10M<span className="text-[#f59e0b] text-lg">+</span></div>
              <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Views</div>
            </div>
            <div className="bg-[#1e1f22]/50 border border-[#313338] rounded-2xl p-4 backdrop-blur-sm">
              <div className="text-2xl font-black text-white mb-1">24<span className="text-[#f59e0b] text-lg">H</span></div>
              <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Fast Delivery</div>
            </div>
            <div className="bg-[#1e1f22]/50 border border-[#313338] rounded-2xl p-4 backdrop-blur-sm">
              <div className="text-2xl font-black text-white mb-1">5<span className="text-[#f59e0b] text-lg">x</span></div>
              <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Free Revisions</div>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link 
              href="/order" 
              className="w-full sm:w-auto px-8 py-4 bg-[#f59e0b] text-white font-black tracking-widest rounded-full hover:bg-orange-500 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center justify-center gap-2 group"
            >
              依頼する・料金を見る
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="#works" 
              className="w-full sm:w-auto px-8 py-4 bg-[#2b2d31] text-white font-bold tracking-widest rounded-full hover:bg-[#313338] transition-colors duration-300 flex items-center justify-center gap-3"
            >
              <PlayCircle size={18} className="text-[#f59e0b]" />
              制作実績を聴く
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
