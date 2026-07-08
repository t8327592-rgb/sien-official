"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  targetDate: string; // ISO format string e.g. "2026-07-17T23:59:59+09:00"
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const target = new Date(targetDate).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = target - now;

      if (distance < 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
        isExpired: false
      });
    };

    updateTimer(); // Initial call
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!mounted) return null; // Hydration error prevention

  if (timeLeft.isExpired) {
    return (
      <div className="bg-slate-100 text-slate-500 font-bold py-3 px-6 rounded-full inline-flex items-center gap-2">
        <Clock className="w-4 h-4" />
        キャンペーンは終了しました
      </div>
    );
  }

  return (
    <div className="inline-flex flex-col items-center">
      <div className="text-sm font-bold text-cyan-800 mb-2 flex items-center gap-1.5">
        <Clock className="w-4 h-4 text-cyan-600 animate-pulse" />
        受付終了まで あと
      </div>
      <div className="flex items-center gap-2 md:gap-3 bg-white/80 backdrop-blur border border-cyan-100 shadow-lg px-4 md:px-6 py-3 rounded-2xl">
        <div className="flex flex-col items-center">
          <span className="text-2xl md:text-3xl font-black text-cyan-900 font-mono w-10 md:w-12 text-center">{timeLeft.days}</span>
          <span className="text-[10px] font-bold text-cyan-600">日</span>
        </div>
        <span className="text-xl md:text-2xl font-bold text-cyan-300 pb-4">:</span>
        <div className="flex flex-col items-center">
          <span className="text-2xl md:text-3xl font-black text-cyan-900 font-mono w-10 md:w-12 text-center">{timeLeft.hours.toString().padStart(2, '0')}</span>
          <span className="text-[10px] font-bold text-cyan-600">時間</span>
        </div>
        <span className="text-xl md:text-2xl font-bold text-cyan-300 pb-4">:</span>
        <div className="flex flex-col items-center">
          <span className="text-2xl md:text-3xl font-black text-cyan-900 font-mono w-10 md:w-12 text-center">{timeLeft.minutes.toString().padStart(2, '0')}</span>
          <span className="text-[10px] font-bold text-cyan-600">分</span>
        </div>
        <span className="text-xl md:text-2xl font-bold text-cyan-300 pb-4">:</span>
        <div className="flex flex-col items-center">
          <span className="text-2xl md:text-3xl font-black text-cyan-900 font-mono w-10 md:w-12 text-center">{timeLeft.seconds.toString().padStart(2, '0')}</span>
          <span className="text-[10px] font-bold text-cyan-600">秒</span>
        </div>
      </div>
    </div>
  );
}
