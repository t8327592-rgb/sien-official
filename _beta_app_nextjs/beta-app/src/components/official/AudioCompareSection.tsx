"use client";

import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

export default function OfficialAudioCompareSection() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMixed, setIsMixed] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 音源ファイルのパス
  const beforeAudioSrc = "/audio/before.mp3";
  const afterAudioSrc = "/audio/after.mp3";

  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    
    // 現在の再生位置を保存して音源を切り替え
    const currentTime = audio.currentTime;
    const wasPlaying = !audio.paused;
    
    audio.src = isMixed ? afterAudioSrc : beforeAudioSrc;
    audio.currentTime = currentTime;
    
    if (wasPlaying) {
      audio.play().catch(e => console.error("Playback failed:", e));
    }
  }, [isMixed]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.error("Playback failed:", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration;
      setProgress((current / total) * 100);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  const resetAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.pause();
      setIsPlaying(false);
      setProgress(0);
    }
  };

  return (
    <section className="py-32 bg-gray-900 text-white relative overflow-hidden">
      {/* Decorative BG */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white to-transparent"></div>
      </div>

      <div className="container mx-auto px-6 max-w-4xl relative z-10">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="tracking-[0.2em] text-xs text-amber-500 uppercase font-bold mb-4 block">Sound Quality</span>
          <h2 className="text-3xl md:text-4xl font-serif tracking-wide mb-6">サウンドの変化</h2>
          <p className="text-gray-400 text-sm tracking-widest leading-loose max-w-2xl mx-auto">
            未加工の録音データが、プロフェッショナルなMIX技術によってどのように変化するかをご体感ください。
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-black/50 border border-white/10 p-8 md:p-12 backdrop-blur-sm"
        >
          <audio 
            ref={audioRef}
            src={beforeAudioSrc}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            preload="metadata"
          />

          <div className="flex flex-col items-center">
            {/* Toggle Switch */}
            <div className="flex bg-gray-800/50 p-1 border border-white/5 rounded-full mb-12">
              <button
                onClick={() => setIsMixed(false)}
                className={`px-8 py-3 rounded-full text-sm font-bold tracking-widest transition-all duration-300 ${
                  !isMixed ? "bg-white text-black shadow-lg" : "text-gray-400 hover:text-white"
                }`}
              >
                MIX前 (Original)
              </button>
              <button
                onClick={() => setIsMixed(true)}
                className={`px-8 py-3 rounded-full text-sm font-bold tracking-widest transition-all duration-300 ${
                  isMixed ? "bg-amber-600 text-white shadow-[0_0_20px_rgba(217,119,6,0.4)]" : "text-gray-400 hover:text-white"
                }`}
              >
                MIX後 (Mastered)
              </button>
            </div>

            {/* Player Controls */}
            <div className="w-full max-w-md flex flex-col items-center">
              <div className="w-20 h-20 mb-8 rounded-full border border-white/20 flex items-center justify-center hover:border-amber-500 hover:bg-amber-500/10 transition-all duration-300 cursor-pointer" onClick={togglePlay}>
                {isPlaying ? (
                  <Pause className="text-white" size={32} />
                ) : (
                  <Play className="text-white ml-2" size={32} />
                )}
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-800 h-1 relative overflow-hidden">
                <div 
                  className={`absolute top-0 left-0 h-full transition-all duration-100 ease-linear ${isMixed ? 'bg-amber-500' : 'bg-white'}`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              <div className="w-full flex justify-between mt-4">
                <button onClick={resetAudio} className="text-gray-500 hover:text-white transition-colors flex items-center gap-1 text-xs tracking-widest uppercase">
                  <RotateCcw size={12} /> Reset
                </button>
                <div className="text-gray-500 text-xs tracking-widest font-mono">
                  {isPlaying ? "PLAYING..." : "PAUSED"}
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}
