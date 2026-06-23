"use client";

import { motion } from "framer-motion";
import { UserCircle, CheckCircle2 } from "lucide-react";
import Image from "next/image";

export default function ProfileSection() {
  const profileFeatures = [
    "MIX歴 5年以上",
    "担当実績 800件突破",
    "得意ジャンル：歌ってみた / ボカロ / K-POP",
    "最短24時間以内の即日納品可能",
    "細かいピッチ補正・ハモリ生成が得意"
  ];

  return (
    <section id="about" className="py-24 relative overflow-hidden bg-background">
      <div className="container mx-auto px-6 max-w-5xl">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-[3rem] p-8 md:p-14 shadow-2xl shadow-gray-200/50 border-4 border-gray-100 relative overflow-hidden"
        >
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-100 rounded-full mix-blend-multiply blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="flex flex-col md:flex-row gap-10 items-center md:items-center relative z-10">
            
            {/* Profile Icon */}
            <div className="w-48 h-48 md:w-64 md:h-64 shrink-0 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-full blur-xl opacity-30 transform -rotate-12"></div>
              <div className="w-full h-full bg-gray-100 rounded-full overflow-hidden relative border-4 border-white shadow-xl flex items-center justify-center">
                <Image 
                  src="/profile-icon2.png" 
                  alt="しえん (sien)" 
                  fill 
                  className="object-cover"
                />
              </div>
            </div>

            {/* Profile Details */}
            <div className="flex-1 text-center md:text-left w-full">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-600 font-black text-xs mb-4">
                MIX ENGINEER / CREATOR
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-gray-800 mb-6 tracking-tight">しえん</h2>
              
              <div className="bg-orange-50/50 border-2 border-orange-100 rounded-2xl p-6 text-left mb-8 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b-2 border-orange-200 pb-2">
                  <UserCircle className="text-orange-500" size={20} />
                  プロフィール
                </h3>
                <ul className="space-y-3">
                  {profileFeatures.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-700 font-bold">
                      <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={18} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <a href="https://twitter.com/sien_mc09" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-4 rounded-full bg-[#1DA1F2] text-white hover:bg-[#1a8cd8] transition-colors shadow-lg shadow-[#1DA1F2]/20 font-black text-sm">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                  Twitterをフォロー
                </a>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}
