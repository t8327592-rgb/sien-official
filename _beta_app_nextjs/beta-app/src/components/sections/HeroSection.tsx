"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, MessageCircle, Play } from "lucide-react";
import { useEffect, useState } from "react";

// 背景画像のパス
const images = [
  "/1.jpg",
  "/2.jpg",
  "/3.png",
];

export default function HeroSection({ 
  availability, 
  deliveryInfo 
}: { 
  availability?: string | null, 
  deliveryInfo?: string | null 
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // 5秒おきに次の画像に切り替える（クロスフェード）
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isMounted]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 200, damping: 20 },
    },
  };

  return (
    <section className="relative min-h-[90vh] md:min-h-screen flex flex-col justify-center overflow-hidden pb-12 pt-20">
      {/* Background Image Slideshow (Crossfade) */}
      <div className="absolute inset-0 w-full h-full overflow-hidden -z-20 bg-black">
        {isMounted && images.map((src, index) => (
          <img
            key={src}
            src={src}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-1000 ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>

      {/* Dark Overlay Filter */}
      <div className="absolute inset-0 bg-black/60 -z-10 backdrop-blur-[2px]"></div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          className="max-w-5xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Main Copy */}
          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-7xl font-black tracking-tight text-white mb-6 leading-[1.2]"
          >
            あなたの歌声を、<br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">
              “作品”として成立する音へ。
            </span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed font-black"
          >
            歌ってみた / ボカロ / K-POP系に特化した<br className="hidden md:block"/>
            プロフェッショナルなボーカルMIX・マスタリング
          </motion.p>

          {/* 予約状況・納期表示 */}
          {(availability || deliveryInfo) && (
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-6 mb-8">
              {availability && (
                <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 shadow-sm">
                  <span className="text-sm font-bold text-gray-300">現在の受付状況</span>
                  <span className={`font-black text-lg ${availability.includes('○') ? 'text-green-400' : availability.includes('△') ? 'text-orange-400' : 'text-red-400'}`}>
                    {availability}
                  </span>
                </div>
              )}
              {deliveryInfo && (
                <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 shadow-sm">
                  <span className="text-sm font-bold text-gray-300">現在の納期目安</span>
                  <span className="font-black text-lg text-white">{deliveryInfo}</span>
                </div>
              )}
            </motion.div>
          )}

          {/* Trust Badges */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-6 mb-12">
            <span className="font-black text-white bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 shadow-sm flex items-center gap-2 text-lg">
              <span className="text-orange-400">✔</span> 実績800件以上
            </span>
            <span className="font-black text-white bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 shadow-sm flex items-center gap-2 text-lg">
              <span className="text-orange-400">✔</span> 最短即日納品
            </span>
            <span className="font-black text-white bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 shadow-sm flex items-center gap-2 text-lg">
              <span className="text-orange-400">✔</span> 修正柔軟対応
            </span>
          </motion.div>

          {/* CTAs */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link 
              href="/order" 
              className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xl shadow-xl shadow-amber-500/30 flex items-center justify-center gap-3 group hover:-translate-y-1 hover:shadow-amber-500/50 transition-all border-2 border-white/20"
            >
              <MessageCircle size={24} className="animate-pulse" />
              無料相談はこちら
              <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="#works" 
              className="w-full sm:w-auto px-10 py-5 rounded-full bg-white/10 backdrop-blur-md text-white font-black text-xl shadow-lg flex items-center justify-center gap-3 border-2 border-white/20 hover:-translate-y-1 hover:bg-white/20 transition-all group"
            >
              <Play size={24} className="text-orange-400" />
              制作実績を見る
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
