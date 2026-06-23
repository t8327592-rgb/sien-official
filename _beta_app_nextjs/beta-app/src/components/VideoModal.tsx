"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, ChevronLeft, ChevronRight } from "lucide-react";

interface VideoModalProps {
  videos: string[];
}

export default function VideoModal({ videos }: VideoModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(0);

  const nextVideo = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentVideo((prev) => (prev + 1) % videos.length);
  };

  const prevVideo = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentVideo((prev) => (prev - 1 + videos.length) % videos.length);
  };

  // サムネイル画像のURLを取得する関数 (YouTubeの仕様)
  const getThumbnailUrl = (videoId: string) => {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  return (
    <>
      {/* サムネイルと再生ボタン (TV風デザインを引き継ぎつつ高級感アップ) */}
      <div className="relative w-full max-w-4xl mx-auto mb-16 group">
        <div className="absolute inset-0 bg-orange-400 rounded-3xl transform rotate-1 scale-105 opacity-20 -z-10 transition-transform group-hover:rotate-2 group-hover:scale-110" />
        <div className="absolute inset-0 bg-pink-400 rounded-3xl transform -rotate-2 scale-[1.02] opacity-30 -z-20 transition-transform group-hover:-rotate-3 group-hover:scale-105" />
        
        <div className="bg-white border-4 border-gray-900 rounded-[2rem] p-3 md:p-6 shadow-2xl relative transition-all group-hover:shadow-orange-200/50">
          {/* TV Antenna/Decorations */}
          <div className="absolute -top-6 left-12 w-2 h-10 bg-gray-900 rounded-full transform -rotate-12" />
          <div className="absolute -top-8 left-16 w-2 h-12 bg-gray-900 rounded-full transform rotate-12" />
          <div className="absolute top-4 right-4 w-4 h-4 bg-red-500 rounded-full animate-pulse border-2 border-gray-900" />
          
          <div 
            className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-900 cursor-pointer group/player"
            onClick={() => setIsOpen(true)}
          >
            {/* サムネイル画像（AnimatePresenceでスライダー実装） */}
            <AnimatePresence mode="wait">
              <motion.img
                key={currentVideo}
                src={getThumbnailUrl(videos[currentVideo])}
                alt="Video Thumbnail"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 0.8, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </AnimatePresence>

            {/* 中央の再生ボタン */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50 shadow-2xl transition-transform duration-300 group-hover/player:scale-110 group-hover/player:bg-white/30">
                <Play className="text-white fill-white ml-2" size={32} />
              </div>
            </div>

            {/* スライダーコントロール (サムネイル切り替え) */}
            <button 
              onClick={prevVideo}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white text-gray-900 rounded-full flex items-center justify-center shadow-lg border-2 border-gray-200 opacity-0 group-hover/player:opacity-100 transition-all transform hover:scale-110 z-10"
            >
              <ChevronLeft size={28} />
            </button>
            <button 
              onClick={nextVideo}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white text-gray-900 rounded-full flex items-center justify-center shadow-lg border-2 border-gray-200 opacity-0 group-hover/player:opacity-100 transition-all transform hover:scale-110 z-10"
            >
              <ChevronRight size={28} />
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {videos.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentVideo(idx);
                  }}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${currentVideo === idx ? "bg-orange-500 scale-125" : "bg-white/60 hover:bg-white"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* モーダル (ポップアップ再生) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <button 
              className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors p-2"
              onClick={() => setIsOpen(false)}
            >
              <X size={36} />
            </button>
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${videos[currentVideo]}?autoplay=1&rel=0`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
