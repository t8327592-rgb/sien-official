"use client";

import { useEffect, useRef } from "react";

export function HeroVideoPlayer({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const resume = () => {
      if (visible && !document.hidden && !motion.matches) {
        if (!video.getAttribute("src")) video.src = src;
        void video.play().catch(() => {
          // Autoplay may be blocked or interrupted by pause; retain the poster/current frame.
        });
      } else {
        video.pause();
      }
    };
    const observer = new IntersectionObserver(entries => {
      visible = (entries[0]?.intersectionRatio ?? 0) >= 0.1;
      resume();
    }, { threshold: 0.1 });

    observer.observe(video);
    document.addEventListener("visibilitychange", resume);
    motion.addEventListener("change", resume);

    return () => {
      observer.disconnect();
      video.pause();
      document.removeEventListener("visibilitychange", resume);
      motion.removeEventListener("change", resume);
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      preload="none"
      poster="/hero-poster.webp"
      muted
      loop
      playsInline
      aria-hidden="true"
      className="absolute inset-0 z-0 h-full w-full object-cover object-[50%_25%] sm:object-center"
    />
  );
}
