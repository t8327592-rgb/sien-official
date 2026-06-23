"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Play } from "lucide-react";

type Work = {
  id: string;
  title: string;
  videoId: string;
  artist?: string | null;
  tags?: string | null;
};

export default function OfficialWorksPageClient({ portfolios }: { portfolios: Work[] }) {
  const [activeTag, setActiveTag] = useState<string>("すべて");

  const allTags = ["すべて", ...Array.from(new Set(
    portfolios.flatMap(w => w.tags ? w.tags.split(',').map(t => t.trim()) : [])
  ))].filter(Boolean);

  const displayedWorks = activeTag === "すべて" 
    ? portfolios 
    : portfolios.filter(w => w.tags && w.tags.includes(activeTag));

  return (
    <div className="min-h-screen bg-white">
      {/* Header / Nav */}
      <div className="container mx-auto px-6 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-amber-600 transition-colors uppercase tracking-widest font-bold">
          <ArrowLeft size={16} />
          Back to Top
        </Link>
      </div>

      <div className="pt-12 pb-32">
        <div className="container mx-auto px-6 max-w-7xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <span className="tracking-[0.2em] text-xs text-amber-600 uppercase font-bold mb-4 block">Portfolio</span>
            <h1 className="text-4xl md:text-5xl font-serif text-gray-900 tracking-wide mb-6">制作実績</h1>
            <p className="text-gray-500 text-sm tracking-widest">
              これまで手掛けた制作実績の一部をご紹介します。
            </p>
          </motion.div>

          {/* タグフィルター */}
          {allTags.length > 1 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-wrap justify-center gap-3 mb-16 max-w-4xl mx-auto"
            >
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  className={`px-6 py-2 rounded-full text-xs tracking-widest uppercase transition-all duration-300 ${
                    activeTag === tag 
                    ? "bg-gray-900 text-white shadow-lg" 
                    : "bg-white text-gray-500 border border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </motion.div>
          )}

          {/* 制作実績一覧 */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTag}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12"
            >
              {displayedWorks.map((work, idx) => (
                <motion.div
                  key={work.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-video w-full bg-gray-100 overflow-hidden mb-6">
                    <img 
                      src={`https://img.youtube.com/vi/${work.videoId}/maxresdefault.jpg`} 
                      onError={(e) => { e.currentTarget.src = `https://img.youtube.com/vi/${work.videoId}/hqdefault.jpg`; }}
                      alt={work.title}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 filter grayscale-[30%] group-hover:grayscale-0"
                    />
                    <a 
                      href={`https://www.youtube.com/watch?v=${work.videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500 flex items-center justify-center"
                    >
                      <div className="w-16 h-16 rounded-full border border-white/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all duration-500 backdrop-blur-sm">
                        <Play className="text-white ml-1" size={24} />
                      </div>
                    </a>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 line-clamp-2 leading-relaxed tracking-wide group-hover:text-amber-600 transition-colors">
                      {work.title}
                    </h3>
                    {work.artist && (
                      <p className="text-xs tracking-widest text-gray-400 mt-2 uppercase">
                        Vocal : {work.artist}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
