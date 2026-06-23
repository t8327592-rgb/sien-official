"use client";

import { motion } from "framer-motion";
import { MessageCircle, ArrowRight, ShieldCheck, Clock, Zap } from "lucide-react";
import Link from "next/link";

export default function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden bg-background">
      {/* Decorative gradient blur for final push */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[400px] bg-gradient-to-r from-amber-300 to-orange-300 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          {/* Final Trust Push */}
          <div className="flex flex-wrap justify-center gap-3 md:gap-6 mb-8">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg font-bold text-sm border border-orange-100">
              <ShieldCheck size={16} /> MIX実績800件以上
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg font-bold text-sm border border-amber-100">
              <Zap size={16} /> 最短即日納品
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg font-bold text-sm border border-blue-100">
              <Clock size={16} /> お客様満足度98%
            </div>
          </div>

          <h2 className="text-4xl md:text-5xl font-black text-gray-800 mb-4 leading-[1.2]">
            まずは気軽に<br className="md:hidden" />ご相談ください！
          </h2>
          <p className="text-gray-600 font-bold text-lg md:text-xl mb-10">
            納期・料金の相談だけでもOK！<br />
            あなたの音源を最高のかたちに仕上げます。
          </p>

          <Link 
            href="/order" 
            className="inline-flex items-center justify-center gap-3 w-full sm:w-auto px-12 py-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xl md:text-2xl shadow-xl shadow-amber-300/50 hover:shadow-amber-400/60 transition-all hover:-translate-y-1 group border-2 border-white mb-4"
          >
            <MessageCircle size={32} className="animate-pulse" />
            24時間以内に返信！無料相談
            <ArrowRight size={32} className="group-hover:translate-x-2 transition-transform" />
          </Link>
          
          <p className="text-sm font-bold text-gray-400 flex items-center justify-center gap-1">
            <Clock size={14} /> 原則24時間以内にお返事いたします
          </p>
        </motion.div>
      </div>
    </section>
  );
}
