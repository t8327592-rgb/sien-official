import React from "react";
import Link from "next/link";
import { ArrowRight, Check, Mic2 } from "lucide-react";

export function CallToAction({ title, buttonText, href = "/order?intent=CONSULTATION" }: { title?: string, buttonText?: string, href?: string }) {
  return (
    <div className="my-16 rounded-[2rem] bg-white border-2 border-orange-100 p-1 md:p-1.5 shadow-[0_8px_30px_-10px_rgba(249,115,22,0.15)] relative overflow-hidden group">
      {/* 背景の装飾 */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-colors duration-500"></div>
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-colors duration-500"></div>

      <div className="bg-gradient-to-br from-white to-orange-50/30 rounded-[1.8rem] px-6 py-10 md:px-12 md:py-12 relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-bold mb-5 border border-orange-200">
            <Mic2 className="w-4 h-4" />
            歌ってみたMIX依頼
          </div>
          <h2 className="text-2xl md:text-[28px] font-extrabold text-slate-900 mb-6 leading-tight">
            {title || "歌ってみたMIXでお困りですか？"}
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center md:justify-start">
            <div className="flex items-center gap-2 text-slate-700 font-bold">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-700"><Check className="w-4 h-4" /></span>
              初心者大歓迎
            </div>
            <div className="flex items-center gap-2 text-slate-700 font-bold">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-700"><Check className="w-4 h-4" /></span>
              修正対応あり
            </div>
            <div className="flex items-center gap-2 text-slate-700 font-bold">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-700"><Check className="w-4 h-4" /></span>
              高品質な仕上がり
            </div>
          </div>
        </div>

        <div className="w-full md:w-auto flex-shrink-0">
          <Link
            href={href}
            className="flex items-center justify-center gap-2 w-full md:w-auto max-w-full px-5 sm:px-10 py-5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-base sm:text-xl shadow-[0_10px_25px_-5px_rgba(249,115,22,0.4)] hover:scale-105 transition-all duration-300 group/btn border-none"
          >
            {buttonText || "無料で相談してみる"}
            <ArrowRight className="w-6 h-6 shrink-0 group-hover/btn:translate-x-1.5 transition-transform" />
          </Link>
          <p className="text-slate-500 text-xs text-center mt-3 font-medium">
            ※まずはご相談だけでもOKです
          </p>
        </div>
      </div>
    </div>
  );
}
