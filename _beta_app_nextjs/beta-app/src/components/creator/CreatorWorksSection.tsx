"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";
import Image from "next/image";

type Work = {
  id: string;
  title: string;
  videoId: string;
  artist?: string | null;
  tags?: string | null;
  comment?: string | null;
};

type WorksProps = {
  works?: Work[];
};

export default function CreatorWorksSection({ works }: WorksProps) {
  // Safe array fallback
  const safeWorks = Array.isArray(works) ? works : [];
  const displayWorks = safeWorks.length > 0 ? safeWorks : [
    { id: "1", title: "神っぽいな / 歌ってみた", videoId: "dummy1", artist: "Singer A", tags: "MIX" },
    { id: "2", title: "フォニイ / 歌ってみた", videoId: "dummy2", artist: "Singer B", tags: "MIX & MASTERING" },
    { id: "3", title: "酔いどれ知らず / 歌ってみた", videoId: "dummy3", artist: "Singer C", tags: "VOCAL EDIT" },
    { id: "4", title: "トウキョウ・シャンディ・ランデヴ", videoId: "dummy4", artist: "Singer D", tags: "MIX" },
  ];

  return (
    <section id="works" className="py-24 bg-[#111214]">
      <div className="container mx-auto px-6 max-w-7xl">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-2">
              Latest <span className="text-[#f59e0b]">Works</span>
            </h2>
            <p className="text-gray-400 font-medium">最近手掛けた制作実績</p>
          </motion.div>
          
          <motion.a 
            href="https://youtube.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="hidden md:inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white transition-colors"
          >
            SEE ALL ON YOUTUBE
          </motion.a>
        </div>

        {/* Spotify-style Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayWorks.map((work, idx) => (
            <motion.div
              key={work.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="bg-[#1e1f22] hover:bg-[#2b2d31] rounded-2xl p-4 transition-all duration-300 group cursor-pointer border border-transparent hover:border-[#313338]"
            >
              <div className="relative aspect-video rounded-xl overflow-hidden mb-4 shadow-lg bg-black/50">
                <Image 
                  src={`https://img.youtube.com/vi/${work.videoId}/maxresdefault.jpg`}
                  alt={work.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Spotify-style Play Button overlay */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-3">
                  <div className="w-12 h-12 bg-[#f59e0b] rounded-full flex items-center justify-center text-white shadow-lg translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out">
                    <Play fill="currentColor" size={20} className="ml-1" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-white font-bold text-base truncate mb-1 group-hover:text-[#f59e0b] transition-colors">
                  {work.title}
                </h3>
                <p className="text-gray-400 text-xs font-bold tracking-widest uppercase truncate">
                  {work.tags || work.artist || "WORKS"}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
