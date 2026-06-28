import React from "react";
import Link from "next/link";
import { ArrowRight, Check, Headphones, Mic2 } from "lucide-react";

export function CallToAction({ title, buttonText, href = "/order" }: { title?: string, buttonText?: string, href?: string }) {
  return (
    <div className="my-14 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-1 md:p-1.5 shadow-xl relative overflow-hidden group">
      {/* 背景の装飾 */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl group-hover:bg-orange-500/30 transition-colors duration-500"></div>
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-500/30 transition-colors duration-500"></div>
      
      <div className="bg-slate-900 rounded-[1.35rem] px-6 py-10 md:px-12 md:py-12 relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-orange-400 text-xs font-bold mb-4 border border-slate-700">
            <Mic2 className="w-3.5 h-3.5" />
            歌ってみたMIX依頼
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-6 leading-tight">
            {title || "歌ってみたMIXでお困りですか？"}
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center md:justify-start">
            <div className="flex items-center gap-2 text-slate-300 font-medium">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-500/20 text-orange-400"><Check className="w-3.5 h-3.5" /></span>
              初心者大歓迎
            </div>
            <div className="flex items-center gap-2 text-slate-300 font-medium">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-500/20 text-orange-400"><Check className="w-3.5 h-3.5" /></span>
              修正対応あり
            </div>
            <div className="flex items-center gap-2 text-slate-300 font-medium">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-500/20 text-orange-400"><Check className="w-3.5 h-3.5" /></span>
              高品質な仕上がり
            </div>
          </div>
        </div>
        
        <div className="w-full md:w-auto flex-shrink-0">
          <Link 
            href={href}
            className="flex items-center justify-center gap-2 w-full md:w-auto px-10 py-5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xl shadow-[0_10px_25px_-5px_rgba(249,115,22,0.4)] hover:scale-105 transition-all duration-300 group/btn border-none"
          >
            {buttonText || "無料で相談してみる"}
            <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-1.5 transition-transform" />
          </Link>
          <p className="text-slate-500 text-xs text-center mt-3 font-medium">
            ※まずはご相談だけでもOKです
          </p>
        </div>
      </div>
    </div>
  );
}
