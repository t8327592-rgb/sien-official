"use client";

import { useEffect, useRef, useState } from "react";

export function HeroVideoPlayer({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      // 残り時間が0.8秒を切ったらフェードアウト（ホワイトアウト）開始
      if (video.duration && video.duration - video.currentTime < 0.8) {
        setIsFadingOut(true);
      } else {
        setIsFadingOut(false);
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, []);

  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 z-0 w-full h-full object-cover object-[50%_25%] sm:object-center"
      >
        <source src={src} />
      </video>
      
      {/* オーバーレイは外部（親コンポーネント）で制御するため、ここでのベースフィルターは削除 */}

      {/* ループ時の自然なホワイトアウト用フェードレイヤー */}
      <div 
        className={`absolute inset-0 z-0 bg-white transition-opacity duration-700 ease-in-out ${
          isFadingOut ? "opacity-100" : "opacity-0"
        }`} 
      />
    </>
  );
}
