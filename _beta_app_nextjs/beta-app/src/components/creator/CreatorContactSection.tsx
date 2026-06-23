"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";

export default function CreatorContactSection() {
  return (
    <section className="py-32 bg-[#0f1013] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#f59e0b]/10 rounded-full mix-blend-screen filter blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#f59e0b]/10 text-[#f59e0b] mb-8 ring-1 ring-[#f59e0b]/20 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
            <MessageCircle size={32} />
          </div>
          
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter">
            Let&apos;s Create <br className="md:hidden"/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f59e0b] to-yellow-400 glow-text">Together</span>
          </h2>
          
          <p className="text-gray-400 text-base md:text-lg leading-relaxed font-medium mb-12 max-w-2xl mx-auto">
            ご依頼やお見積りのご相談は、専用フォームからお送りください。<br className="hidden md:block" />
            ちょっとした質問や急ぎの相談は、X (Twitter) のDMでも受け付けています。
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link 
              href="/order" 
              className="w-full sm:w-auto px-10 py-5 bg-[#f59e0b] text-white font-black tracking-widest rounded-full hover:bg-orange-500 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center justify-center gap-3 group"
            >
              依頼・見積もりフォームへ
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <a 
              href="https://twitter.com/sien_mc09" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-10 py-5 bg-[#1DA1F2]/10 border border-[#1DA1F2]/30 text-[#1DA1F2] font-bold tracking-widest rounded-full hover:bg-[#1DA1F2]/20 transition-all duration-300 flex items-center justify-center gap-3 group"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="group-hover:scale-110 transition-transform">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
              </svg>
              DMで相談する
            </a>
          </div>
          
        </motion.div>
      </div>
    </section>
  );
}
