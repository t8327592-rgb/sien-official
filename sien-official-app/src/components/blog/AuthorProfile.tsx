import React from "react";
import Link from "next/link";
import { ExternalLink, PenTool } from "lucide-react";

export function AuthorProfile() {
  return (
    <div className="mt-16 mb-8 pt-8 border-t border-slate-200">
      <div className="flex items-center gap-2 mb-6">
        <PenTool className="w-5 h-5 text-orange-500" />
        <h2 className="text-xl font-bold text-slate-800 m-0">この記事を書いた人</h2>
      </div>
      
      <div className="bg-slate-50 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center md:items-start border border-slate-200 shadow-sm">
        <div className="flex-shrink-0">
          <div className="w-24 h-24 rounded-full bg-orange-100 overflow-hidden border-4 border-white shadow-md">
            <img 
              src="/profile.jpg" 
              alt="Sien" 
              className="w-full h-full object-cover" 
            />
          </div>
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-3">
            <h3 className="text-2xl font-black text-slate-900 m-0">Sien</h3>
            <span className="inline-block px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold rounded-full">
              Mix Engineer / Sound Creator
            </span>
          </div>
          
          <p className="text-slate-600 text-[15px] leading-relaxed mb-6 font-medium">
            音楽制作歴15年。歌ってみたMIXからオリジナル楽曲のパラデータMIX、ボーカルピッチ補正まで幅広く対応するミックスエンジニア。
            これまで数百件を超えるご依頼に携わり、多くの方の「歌ってみたデビュー」をサポートしてきました。
            初めての方でも安心してご依頼いただけるよう、丁寧なコミュニケーションと柔軟な修正対応を心がけています。
          </p>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <Link 
              href="https://x.com/sien_mix" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-100 hover:bg-[#000000] hover:text-white text-slate-700 text-xs font-bold transition-all duration-300"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              Twitter
            </Link>
            <Link 
              href="https://youtube.com/@Sien_Mix" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-100 hover:bg-[#FF0000] hover:text-white text-slate-700 text-xs font-bold transition-all duration-300"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 00-2.122 2.136C0 8.07 0 12 0 12s0 3.93.501 5.814a3.016 3.016 0 002.122 2.136c1.871.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.016 3.016 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              YouTube
            </Link>
            <Link 
              href="/portfolio" 
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-100 hover:bg-orange-500 hover:text-white text-slate-700 text-xs font-bold transition-all duration-300"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              制作実績を見る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
