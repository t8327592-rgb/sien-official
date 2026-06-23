"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";
import Link from "next/link";

type Work = {
  id: string;
  title: string;
  videoId: string;
  artist?: string | null;
};

type WorksProps = {
  works: Work[];
};

export default function OfficialWorksSection({ works = [] }: WorksProps) {
  // 最新の6件だけを表示する（公式サイトは一覧性より見栄え重視）
  const displayWorks = works.slice(0, 6);

  return (
    <section id="works" className="py-32 bg-white">
      <div className="container mx-auto px-6 max-w-7xl">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <span className="tracking-[0.2em] text-xs text-amber-600 uppercase font-bold mb-4 block">Portfolio</span>
            <h2 className="text-3xl md:text-4xl font-serif text-gray-900 tracking-wide">制作実績</h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Link href="/works" className="text-sm tracking-widest text-gray-400 hover:text-amber-600 transition-colors uppercase flex items-center gap-2">
              View all works <Play size={14} />
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {displayWorks.map((work, idx) => (
            <motion.div
              key={work.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.1, duration: 0.8 }}
              className="group cursor-pointer rounded-3xl hover:rotate-1 transition-transform duration-300"
            >
              <div className="relative aspect-video w-full bg-gray-100 overflow-hidden mb-6 rounded-3xl">
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
        </div>

      </div>
    </section>
  );
}
