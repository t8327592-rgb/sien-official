"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export function OpeningAnimation() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    try {
      if (sessionStorage.getItem("hasVisited")) return;
      sessionStorage.setItem("hasVisited", "true");
    } catch { return; }
    const start = setTimeout(() => setShow(true), 0);
    const finish = setTimeout(() => setShow(false), 1200);
    return () => { clearTimeout(start); clearTimeout(finish); };
  }, []);
  if (!show) return null;
  return (
    <div aria-hidden="true" className="pointer-events-none fixed bottom-4 left-4 z-40 rounded-xl bg-white/90 p-3 shadow-sm motion-safe:animate-in motion-safe:fade-in">
      <Image src="/logo.png" alt="" width={120} height={38} className="h-auto w-24" />
    </div>
  );
}
