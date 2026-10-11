"use client";

import { useState, useRef } from "react";
import { Play, Pause, Volume2, Mic2, Activity, RefreshCcw, Waves, Disc3 } from "lucide-react";

interface AudioComparisonProps {
  title: string;
  beforeSrc: string;
  afterSrc: string;
}

export default function AudioComparison({ title, beforeSrc, afterSrc }: AudioComparisonProps) {
  const [activePlayer, setActivePlayer] = useState<"before" | "after" | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState({ before: 0, after: 0 });
  const [duration, setDuration] = useState({ before: 0, after: 0 });

  const beforeAudioRef = useRef<HTMLAudioElement | null>(null);
  const afterAudioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = (type: "before" | "after") => {
    const audio = type === "before" ? beforeAudioRef.current : afterAudioRef.current;
    const otherAudio = type === "before" ? afterAudioRef.current : beforeAudioRef.current;

    if (!audio) return;

    if (activePlayer === type) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play();
        setIsPlaying(true);
      }
    } else {
      if (otherAudio) {
        otherAudio.pause();
      }
      audio.play();
      setActivePlayer(type);
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = (type: "before" | "after") => {
    const audio = type === "before" ? beforeAudioRef.current : afterAudioRef.current;
    if (audio) {
      setProgress(prev => ({ ...prev, [type]: (audio.currentTime / audio.duration) * 100 }));
    }
  };

  const handleLoadedMetadata = (type: "before" | "after") => {
    const audio = type === "before" ? beforeAudioRef.current : afterAudioRef.current;
    if (audio) {
      setDuration(prev => ({ ...prev, [type]: audio.duration }));
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>, type: "before" | "after") => {
    const audio = type === "before" ? beforeAudioRef.current : afterAudioRef.current;
    if (audio && duration[type] > 0) {
      const newTime = (Number(e.target.value) / 100) * duration[type];
      audio.currentTime = newTime;
      setProgress(prev => ({ ...prev, [type]: Number(e.target.value) }));
    }
  };

  const improvements = [
    { icon: <Mic2 className="w-4 h-4" />, label: "ピッチ補正" },
    { icon: <RefreshCcw className="w-4 h-4" />, label: "タイミング補正" },
    { icon: <Activity className="w-4 h-4" />, label: "ノイズ除去" },
    { icon: <Waves className="w-4 h-4" />, label: "空間処理" },
    { icon: <Disc3 className="w-4 h-4" />, label: "マスタリング" },
  ];

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-cyan-100 overflow-hidden">
      <div className="bg-cyan-50 p-6 border-b border-cyan-100 flex items-center justify-between">
        <h3 className="font-bold text-slate-900 text-lg md:text-xl flex items-center gap-3">
          <Volume2 className="w-6 h-6 text-cyan-500" />
          {title}
        </h3>
        <span className="bg-cyan-100 text-cyan-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          Sample
        </span>
      </div>

      <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8 md:gap-12">
        {/* Before Player */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-slate-500 uppercase tracking-widest text-sm">Before</span>
            <span className="text-xs text-slate-600">MIX前（未加工）</span>
          </div>
          <div className={`p-4 rounded-2xl border-2 transition-all ${activePlayer === "before" && isPlaying ? "border-slate-300 bg-slate-50" : "border-slate-100 bg-white"}`}>
            <div className="flex items-center gap-4">
              <button
                onClick={() => togglePlay("before")}
                className="w-12 h-12 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-300 transition-colors shrink-0"
              >
                {activePlayer === "before" && isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
              </button>
              <div className="flex-1">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress.before || 0}
                  onChange={(e) => handleSeek(e, "before")}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-500"
                />
              </div>
            </div>
            <audio
              ref={beforeAudioRef}
              src={beforeSrc}
              onTimeUpdate={() => handleTimeUpdate("before")}
              onLoadedMetadata={() => handleLoadedMetadata("before")}
              onEnded={() => setIsPlaying(false)}
            />
          </div>
        </div>

        {/* After Player */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600 uppercase tracking-widest text-sm">After</span>
            <span className="text-xs text-cyan-600 font-bold">Sien MIX完成版</span>
          </div>
          <div className={`p-4 rounded-2xl border-2 transition-all shadow-sm ${activePlayer === "after" && isPlaying ? "border-cyan-400 bg-cyan-50/50" : "border-cyan-200 bg-white"}`}>
            <div className="flex items-center gap-4">
              <button
                onClick={() => togglePlay("after")}
                className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white flex items-center justify-center hover:brightness-95 shadow-md shadow-cyan-500/30 transition-all shrink-0"
              >
                {activePlayer === "after" && isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
              </button>
              <div className="flex-1">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress.after || 0}
                  onChange={(e) => handleSeek(e, "after")}
                  className="w-full h-2 bg-cyan-100 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
            </div>
            <audio
              ref={afterAudioRef}
              src={afterSrc}
              onTimeUpdate={() => handleTimeUpdate("after")}
              onLoadedMetadata={() => handleLoadedMetadata("after")}
              onEnded={() => setIsPlaying(false)}
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-50 p-6 border-t border-slate-100">
        <p className="text-sm font-bold text-slate-700 mb-4 text-center">このMIXで行った主な処理</p>
        <div className="flex flex-wrap justify-center gap-2 md:gap-4">
          {improvements.map((item, i) => (
            <div key={i} className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 text-xs md:text-sm font-medium text-slate-600 shadow-sm">
              <span className="text-cyan-500">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
