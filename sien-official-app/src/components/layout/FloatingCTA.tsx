"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function FloatingCTA() {
  const pathname = usePathname();

  // フォーム画面や管理画面では非表示にする
  if (pathname === "/order" || pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Link href="/order" className="group flex items-center gap-2 bg-orange-600 text-white px-6 py-4 rounded-full shadow-[0_0_30px_-5px_rgba(59,130,246,0.5)] hover:shadow-[0_0_40px_-5px_rgba(59,130,246,0.7)] hover:bg-orange-500 transition-all hover:scale-105 border-2 border-white/10 backdrop-blur-md">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <span className="font-bold ml-1">無料で相談・お見積り</span>
        <svg className="w-5 h-5 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
      </Link>
    </div>
  );
}
