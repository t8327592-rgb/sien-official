'use client';

import { useState, useEffect } from 'react';

const VIDEOS = [
  '/Video Project 1.mp4',
  '/Video Project 2.mp4',
  '/Video Project 3.mp4',
];

export default function HeroVideo() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  useEffect(() => {
    // 10秒ごとに切り替え
    const interval = setInterval(() => {
      setCurrentVideoIndex((prev) => (prev + 1) % VIDEOS.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleVideoCanPlay = () => {
    setIsVideoLoaded(true);
  };

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#FAFAFA] z-0">
      {/* Loading Spinner */}
      {!isVideoLoaded && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="w-10 h-10 border-4 border-[#0071E3]/10 border-t-[#0071E3] rounded-full animate-spin"></div>
        </div>
      )}

      {/* Background Videos with Crossfade */}
      {VIDEOS.map((src, index) => (
        <video
          key={src}
          src={src}
          autoPlay
          muted
          loop
          playsInline
          onCanPlay={handleVideoCanPlay}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-2000 ease-in-out ${
            index === currentVideoIndex ? 'opacity-30 z-10' : 'opacity-0 z-0'
          }`}
        />
      ))}
      
      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 z-20 bg-gradient-to-b from-[#FAFAFA]/50 via-[#FAFAFA]/20 to-[#FAFAFA] pointer-events-none"></div>
    </div>
  );
}
