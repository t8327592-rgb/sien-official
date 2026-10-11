"use client";

import { useCallback, useSyncExternalStore } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  targetDate: string; // ISO format string e.g. "2026-07-17T23:59:59+09:00"
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const subscribe = useCallback((notify: () => void) => {
    const timer = setInterval(notify, 1000);
    return () => clearInterval(timer);
  }, []);
  const snapshot = useCallback(() => Math.max(0, Math.ceil((new Date(targetDate).getTime() - Date.now()) / 1000)), [targetDate]);
  const seconds = useSyncExternalStore(subscribe, snapshot, () => -1);
  if (seconds < 0) return null;
  const timeLeft = { days: Math.floor(seconds / 86400), hours: Math.floor(seconds % 86400 / 3600), minutes: Math.floor(seconds % 3600 / 60), seconds: seconds % 60, isExpired: seconds === 0 };

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
