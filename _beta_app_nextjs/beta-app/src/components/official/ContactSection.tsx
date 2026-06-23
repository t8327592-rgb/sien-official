"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function OfficialContactSection() {
  return (
    <section className="py-32 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10 text-center max-w-3xl">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <span className="tracking-[0.2em] text-xs text-amber-600 uppercase font-bold mb-6 block">Contact</span>
          <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mb-8 tracking-wide">
            お問い合わせ
          </h2>
          <p className="text-gray-500 text-sm md:text-base leading-loose tracking-widest mb-12">
            制作のご依頼、お見積り、その他ご不明な点がございましたら、<br className="hidden md:block" />
            以下のフォームまたはTwitter DMよりお気軽にご連絡ください。<br />
            通常24時間以内にお返事いたします。
          </p>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
            
            {/* 1. Pricing Link */}
            <Link 
              href="/pricing" 
              className="flex flex-col items-center justify-center p-8 bg-white rounded-[2rem] border-2 border-gray-100 hover:border-amber-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-xl font-bold text-gray-400">¥</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">料金を確認する</h3>
              <p className="text-xs text-gray-500 text-center mb-4">明朗会計のプラン一覧</p>
              <ArrowRight size={16} className="text-gray-300 group-hover:text-amber-500 group-hover:translate-x-2 transition-all" />
            </Link>

            {/* 2. Order Form */}
            <Link 
              href="/order" 
              className="flex flex-col items-center justify-center p-8 bg-amber-500 text-white rounded-[2rem] shadow-lg shadow-amber-500/20 hover:bg-amber-600 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group relative overflow-hidden"
            >
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <h3 className="font-bold text-white mb-2">ご依頼・お見積り</h3>
              <p className="text-xs text-amber-100 text-center mb-4">専用フォームから相談</p>
              <ArrowRight size={16} className="text-white group-hover:translate-x-2 transition-transform" />
            </Link>

            {/* 3. Twitter DM */}
            <a 
              href="https://twitter.com/sien_mc09" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-8 bg-[#1DA1F2] text-white rounded-[2rem] shadow-lg shadow-[#1DA1F2]/20 hover:bg-[#1a8cd8] hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
                </svg>
              </div>
              <h3 className="font-bold text-white mb-2">Twitter DM</h3>
              <p className="text-xs text-blue-100 text-center mb-4">軽い質問やご相談に</p>
              <ArrowRight size={16} className="text-white group-hover:translate-x-2 transition-transform" />
            </a>

          </div>
        </motion.div>
      </div>
    </section>
  );
}
