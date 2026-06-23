"use client";

import { useEffect, useState } from "react";

export function OpeningAnimation() {
  const [show, setShow] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // クライアントサイドでのみ実行
    const hasVisited = sessionStorage.getItem("hasVisited");
    if (hasVisited) {
      setShow(false);
      return;
    }

    sessionStorage.setItem("hasVisited", "true");

    // 1.5秒後にフェードアウト開始
    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 1500);

    // 2.5秒後にDOMから完全削除
    const removeTimer = setTimeout(() => {
      setShow(false);
    }, 2500);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!show) return null;

  // SSR時（マウント前）はアニメーションなしの真っ白な画面で覆う（チラつき防止）
  if (!isMounted) {
    return <div className="fixed inset-0 z-[100] bg-white"></div>;
  }

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-white transition-all duration-1000 ease-in-out ${
        isFadingOut ? "opacity-0 pointer-events-none scale-105" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center">
        {/* ロゴやテキストのアニメーション */}
        <div className="relative overflow-hidden mb-4">
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both ease-out">
            <img src="/logo.png" alt="Sien-Official" className="h-16 w-auto object-contain drop-shadow-xl" />
          </div>
        </div>
        
        {/* 下線の装飾アニメーション */}
        <div className="h-[2px] bg-orange-500 rounded-full animate-out fade-out duration-1000 delay-500" style={{
          animation: "expandLine 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards"
        }}>
        </div>
      </div>

      <style jsx>{`
        @keyframes expandLine {
          0% { width: 0%; opacity: 0; }
          50% { width: 100px; opacity: 1; }
          100% { width: 0%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
