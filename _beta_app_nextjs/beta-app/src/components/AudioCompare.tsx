"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Volume2 } from "lucide-react";
import WaveSurfer from "wavesurfer.js";

interface AudioCompareProps {
  title: string;
  genre?: string;
  description?: string;
  beforeSrc: string;
  afterSrc: string;
}

export default function AudioCompare({ title, genre, description, beforeSrc, afterSrc }: AudioCompareProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBefore, setIsBefore] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const containerBeforeRef = useRef<HTMLDivElement>(null);
  const containerAfterRef = useRef<HTMLDivElement>(null);
  
  const wsBeforeRef = useRef<WaveSurfer | null>(null);
  const wsAfterRef = useRef<WaveSurfer | null>(null);

  // 時間フォーマット関数
  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!containerBeforeRef.current || !containerAfterRef.current) return;

    // 初期化
    const wsBefore = WaveSurfer.create({
      container: containerBeforeRef.current,
      waveColor: "#fed7aa", // orange-200
      progressColor: "#f97316", // orange-500
      cursorColor: "#ea580c",
      barWidth: 3,
      barRadius: 3,
      barGap: 2,
      height: 80,
      url: beforeSrc,
      normalize: true,
    });

    const wsAfter = WaveSurfer.create({
      container: containerAfterRef.current,
      waveColor: "#fbcfe8", // pink-200
      progressColor: "#ec4899", // pink-500
      cursorColor: "#db2777",
      barWidth: 3,
      barRadius: 3,
      barGap: 2,
      height: 80,
      url: afterSrc,
      normalize: true,
    });

    wsBeforeRef.current = wsBefore;
    wsAfterRef.current = wsAfter;

    let readyCount = 0;
    const checkReady = () => {
      readyCount++;
      if (readyCount === 2) {
        setIsReady(true);
        setDuration(wsBefore.getDuration());
        // 初期ボリューム設定
        wsBefore.setVolume(1);
        wsAfter.setVolume(0);
      }
    };

    wsBefore.on("ready", checkReady);
    wsAfter.on("ready", checkReady);

    // 時間更新の同期 (Beforeをマスターとする)
    wsBefore.on("audioprocess", (time) => setCurrentTime(time));

    // シークの同期
    // ユーザーがBeforeをクリックした時
    wsBefore.on("interaction", () => {
      const time = wsBefore.getCurrentTime();
      wsAfter.seekTo(time / wsBefore.getDuration());
      setCurrentTime(time);
    });
    // ユーザーがAfterをクリックした時
    wsAfter.on("interaction", () => {
      const time = wsAfter.getCurrentTime();
      wsBefore.seekTo(time / wsAfter.getDuration());
      setCurrentTime(time);
    });

    // 再生終了時
    const handleFinish = () => {
      setIsPlaying(false);
      // 頭出し（ループ準備）はせず、そのまま停止する
    };
    wsBefore.on("finish", handleFinish);
    wsAfter.on("finish", handleFinish);

    return () => {
      wsBefore.destroy();
      wsAfter.destroy();
    };
  }, [beforeSrc, afterSrc]);

  // Before/After 切り替え時のボリューム操作
  useEffect(() => {
    if (!wsBeforeRef.current || !wsAfterRef.current) return;
    
    if (isBefore) {
      wsBeforeRef.current.setVolume(1);
      wsAfterRef.current.setVolume(0);
    } else {
      wsBeforeRef.current.setVolume(0);
      wsAfterRef.current.setVolume(1);
    }
  }, [isBefore]);

  // 再生/一時停止
  const togglePlay = () => {
    if (!wsBeforeRef.current || !wsAfterRef.current || !isReady) return;

    if (isPlaying) {
      wsBeforeRef.current.pause();
      wsAfterRef.current.pause();
    } else {
      wsBeforeRef.current.play();
      wsAfterRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-6 md:p-8 border-2 border-gray-100 shadow-xl shadow-gray-200/50 max-w-2xl mx-auto w-full">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-black text-gray-800 text-xl flex items-center gap-2 mb-2">
            <Volume2 className="text-orange-500" size={24} />
            {title}
          </h3>
          {genre && <p className="text-sm font-bold text-pink-500 mb-1">ジャンル: {genre}</p>}
          {description && <p className="text-sm text-gray-600 font-medium leading-relaxed">{description}</p>}
        </div>
        
        {/* Toggle Switch */}
        <div className="flex bg-gray-100 p-1.5 rounded-full relative w-full max-w-[200px] shrink-0">
          <div 
            className={`absolute inset-y-1.5 w-[calc(50%-6px)] bg-white rounded-full shadow-md transition-all duration-300 ease-out ${isBefore ? 'left-1.5' : 'left-[calc(50%+4px)]'}`}
          ></div>
          <button 
            className={`flex-1 py-2 text-sm font-black z-10 transition-colors ${isBefore ? 'text-orange-500' : 'text-gray-500'}`}
            onClick={() => setIsBefore(true)}
          >
            Before
          </button>
          <button 
            className={`flex-1 py-2 text-sm font-black z-10 transition-colors ${!isBefore ? 'text-pink-500' : 'text-gray-500'}`}
            onClick={() => setIsBefore(false)}
          >
            After
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Play Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={togglePlay}
          disabled={!isReady}
          className={`w-16 h-16 shrink-0 rounded-full flex items-center justify-center text-white shadow-lg transition-colors ${
            !isReady ? 'bg-gray-300 cursor-not-allowed shadow-none' : 'bg-gradient-to-br from-orange-400 to-pink-500 shadow-orange-200 hover:shadow-pink-200'
          }`}
        >
          {isPlaying ? <Pause size={28} className="fill-white" /> : <Play size={28} className="fill-white ml-1" />}
        </motion.button>

        <div className="flex-grow w-full relative">
          
          {/* Waveforms - Stacked */}
          <div className="relative w-full h-[80px] bg-gray-50 rounded-2xl overflow-hidden border-2 border-gray-100">
            {/* Before Waveform */}
            <div 
              ref={containerBeforeRef} 
              className="absolute top-0 left-0 w-full h-full transition-opacity duration-300"
              style={{ opacity: isBefore ? 1 : 0, pointerEvents: isBefore ? 'auto' : 'none' }}
            />
            {/* After Waveform */}
            <div 
              ref={containerAfterRef} 
              className="absolute top-0 left-0 w-full h-full transition-opacity duration-300"
              style={{ opacity: !isBefore ? 1 : 0, pointerEvents: !isBefore ? 'auto' : 'none' }}
            />

            {!isReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                <span className="text-sm font-bold text-gray-400 flex items-center gap-2">
                  <span className="animate-pulse w-2 h-2 rounded-full bg-orange-400"></span>
                  Loading Audio...
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-between text-xs font-black text-gray-400 mt-3 px-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

        </div>
      </div>
    </div>
  );
}
