"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, SkipBack, SkipForward, Disc3, Volume2, VolumeX } from "lucide-react";

const formatTime = (time: number) => {
  if (isNaN(time) || !isFinite(time)) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export function BeforeAfterPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAfter, setIsAfter] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);
  const [masterVolume, setMasterVolume] = useState(0.8);
  const playToken = useRef(0);
  const [audioError, setAudioError] = useState("");
  const [isMuted, setIsMuted] = useState(false);

  const beforeAudioRef = useRef<HTMLAudioElement | null>(null);
  const afterAudioRef = useRef<HTMLAudioElement | null>(null);
  const isDraggingRef = useRef(false);
  const animationRef = useRef<number | null>(null);
  const isAfterRef = useRef(isAfter);

  useEffect(() => {
    isAfterRef.current = isAfter;
  }, [isAfter]);

  const updateProgress = useCallback(() => {
    if (!isDraggingRef.current) {
      const activeAudio = isAfterRef.current ? afterAudioRef.current : beforeAudioRef.current;
      if (activeAudio) {
        setCurrentTime(activeAudio.currentTime);
      }
    }
  }, []);

  useEffect(() => {
    let animationId: number;
    const loop = () => {
      updateProgress();
      animationId = requestAnimationFrame(loop);
      animationRef.current = animationId;
    };

    if (isPlaying) {
      animationId = requestAnimationFrame(loop);
      animationRef.current = animationId;
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [isPlaying, updateProgress]);

  useEffect(() => {
    beforeAudioRef.current = new Audio("/comparison-before.mp3");
    afterAudioRef.current = new Audio("/comparison-after.mp3");

    beforeAudioRef.current.loop = false;
    afterAudioRef.current.loop = false;
    beforeAudioRef.current.preload = "none";
    afterAudioRef.current.preload = "none";

    const setAudioData = (e: Event) => {
      const audio = e.target as HTMLAudioElement;
      if (!isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (beforeAudioRef.current) beforeAudioRef.current.currentTime = 0;
      if (afterAudioRef.current) afterAudioRef.current.currentTime = 0;
    };

    afterAudioRef.current.addEventListener('loadedmetadata', setAudioData);
    beforeAudioRef.current.addEventListener('loadedmetadata', setAudioData);
    afterAudioRef.current.addEventListener('ended', handleEnded);
    beforeAudioRef.current.addEventListener('ended', handleEnded);

    return () => {
      if (beforeAudioRef.current) {
        beforeAudioRef.current.pause();
        beforeAudioRef.current.removeEventListener('loadedmetadata', setAudioData);
        beforeAudioRef.current.removeEventListener('ended', handleEnded);
      }
      if (afterAudioRef.current) {
        afterAudioRef.current.pause();
        afterAudioRef.current.removeEventListener('loadedmetadata', setAudioData);
        afterAudioRef.current.removeEventListener('ended', handleEnded);
      }
    };
  }, []);

  useEffect(() => {
    const volume = isMuted ? 0 : masterVolume;
    if (beforeAudioRef.current) beforeAudioRef.current.volume = volume;
    if (afterAudioRef.current) afterAudioRef.current.volume = volume;
  }, [masterVolume, isMuted]);

  async function playAudio(audio: HTMLAudioElement) {
    const token = ++playToken.current;
    setAudioError("");
    try { await audio.play(); if (token === playToken.current) setIsPlaying(true); }
    catch { if (token === playToken.current) { setIsPlaying(false); setAudioError("音源を再生できませんでした。通信状態を確認してもう一度再生してください。"); } }
  }
  function togglePlay() {
    const active = isAfterRef.current ? afterAudioRef.current : beforeAudioRef.current;
    if (!active) return;
    if (isPlaying) { playToken.current++; active.pause(); setIsPlaying(false); }
    else void playAudio(active);
  }
  function selectVersion(after: boolean) {
    if (after === isAfterRef.current) return;
    const source = isAfterRef.current ? afterAudioRef.current : beforeAudioRef.current;
    const target = after ? afterAudioRef.current : beforeAudioRef.current;
    if (!source || !target) return;
    const time = source.currentTime;
    source.pause();
    if (target.readyState >= 1) target.currentTime = time;
    else { const seek = () => { target.currentTime = time; }; target.addEventListener("loadedmetadata", seek, {once: true}); target.load(); }
    isAfterRef.current = after; setIsAfter(after); setCurrentTime(time);
    if (isPlaying) void playAudio(target);
  }

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);

    if (beforeAudioRef.current) beforeAudioRef.current.currentTime = time;
    if (afterAudioRef.current) afterAudioRef.current.currentTime = time;
  };

  const handleSeekMouseUp = () => isDraggingRef.current = false;
  const handleSeekMouseDown = () => isDraggingRef.current = true;

  const skipTime = (amount: number) => {
    if (!beforeAudioRef.current || !afterAudioRef.current) return;
    const newTime = Math.max(0, Math.min(duration, currentTime + amount));
    if (beforeAudioRef.current) beforeAudioRef.current.currentTime = newTime;
    if (afterAudioRef.current) afterAudioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  return (
    <div className="bg-white rounded-3xl p-5 md:p-8 shadow-xl border border-slate-200 max-w-2xl mx-auto overflow-hidden relative">
      <div className="flex flex-col items-center">
        {/* Track Info */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-200 shadow-sm">
            <Disc3 className={`w-8 h-8 text-orange-700 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
          </div>
          <h3 className="text-slate-900 font-bold text-lg">DECO*27 - モニタリング</h3>
          <p className="text-slate-500 text-sm mb-3">Cover by Sien-Official</p>
          <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
            再生時の音量にご注意ください
          </div>
        </div>

        {/* State Toggle Buttons */}
        <div className="flex bg-slate-100 p-1 rounded-full mb-8 relative w-full max-w-md border border-slate-200">
          <div
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-orange-600 rounded-full transition-all duration-300 shadow-md ${isAfter ? 'translate-x-full left-1' : 'left-1'}`}
          />
          <button
            className={`flex-1 py-2.5 text-sm font-bold z-10 transition-colors ${!isAfter ? 'text-white' : 'text-slate-500 hover:text-slate-700'}`}
            aria-pressed={!isAfter} onClick={() => selectVersion(false)}
          >
            MIX前
          </button>
          <button
            className={`flex-1 py-2.5 text-sm font-bold z-10 transition-colors ${isAfter ? 'text-white' : 'text-slate-500 hover:text-slate-700'}`}
            aria-pressed={isAfter} onClick={() => selectVersion(true)}
          >
            MIX後
          </button>
        </div>

        {/* Playback Controls & Timeline */}
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          <input
            aria-label="再生位置（秒）" type="range"
            min={0}
            max={duration || 100}
            step={0.01}
            value={currentTime}
            onChange={handleSeekChange}
            onMouseDown={handleSeekMouseDown}
            onMouseUp={handleSeekMouseUp}
            onTouchStart={handleSeekMouseDown}
            onTouchEnd={handleSeekMouseUp}
            className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer mb-8 accent-orange-500 focus:outline-none"
          />

          <div className="flex justify-center items-center gap-6">
            <button
              aria-label="10秒戻る" onClick={() => skipTime(-10)}
              className="text-slate-600 hover:text-slate-600 transition-colors"
            >
              <SkipBack className="w-6 h-6" />
            </button>

            <button
              aria-label={isPlaying ? "一時停止" : "再生"} onClick={togglePlay}
              className="w-16 h-16 bg-orange-600 text-white rounded-full flex items-center justify-center hover:bg-orange-500 hover:scale-105 transition-all shadow-lg shadow-orange-600/30"
            >
              {isPlaying ? (
                <Pause className="w-7 h-7 fill-current" />
              ) : (
                <Play className="w-7 h-7 fill-current ml-1" />
              )}
            </button>

            <button
              aria-label="10秒進む" onClick={() => skipTime(10)}
              className="text-slate-600 hover:text-slate-600 transition-colors"
            >
              <SkipForward className="w-6 h-6" />
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center justify-center gap-3 mt-8 text-slate-500">
            <button aria-label={isMuted ? "ミュートを解除" : "ミュート"} aria-pressed={isMuted} onClick={() => setIsMuted(!isMuted)} className="hover:text-orange-700 transition-colors">
              {isMuted || masterVolume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <input
              aria-label="音量" type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : masterVolume}
              onChange={(e) => {
                setMasterVolume(Number(e.target.value));
                if (Number(e.target.value) > 0) setIsMuted(false);
              }}
              className="w-24 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-orange-500 focus:outline-none"
            />
          </div>
        </div>

        {audioError && <p role="alert" className="mt-4 text-sm text-red-800">{audioError}</p>}
        {/* Equipment Info */}
        <p className="text-slate-500 text-xs mt-8 font-medium">※録音機材: AT2020 + MOTU M2</p>

      </div>
    </div>
  );
}
