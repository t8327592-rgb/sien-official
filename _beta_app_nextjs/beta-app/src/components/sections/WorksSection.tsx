"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import VideoModal from "@/components/VideoModal";
import { ChevronDown, ChevronUp, Mic2, Tag } from "lucide-react";

type Work = {
  id: string;
  title: string;
  videoId: string;
  artist?: string | null;
  tags?: string | null;
  comment?: string | null;
};

type WorksProps = {
  works: Work[];
};

export default function WorksSection({ works = [] }: WorksProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTag, setActiveTag] = useState<string>("すべて");
  
  const INITIAL_DISPLAY_COUNT = 9;

  // すべてのタグを抽出
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    works.forEach(w => {
      if (w.tags) {
        w.tags.split(',').forEach(t => tags.add(t.trim()));
      }
    });
    return ["すべて", ...Array.from(tags)];
  }, [works]);

  // タグで絞り込み
  const filteredWorks = useMemo(() => {
    if (activeTag === "すべて") return works;
    return works.filter(w => {
      if (!w.tags) return false;
      return w.tags.split(',').map(t => t.trim()).includes(activeTag);
    });
  }, [works, activeTag]);
  
  const displayedWorks = isExpanded ? filteredWorks : filteredWorks.slice(0, INITIAL_DISPLAY_COUNT);
  
  const featuredVideos = works.slice(0, 3).map(w => w.videoId);

  return (
    <section id="works" className="py-24 relative overflow-hidden bg-background">
      <div className="container mx-auto px-6">
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-5xl font-black text-gray-800 mb-6">制作実績</h2>
          <p className="text-gray-600 font-bold text-lg max-w-2xl mx-auto">
            ジャンルに合わせた最適なアプローチで、<br />ボーカルの魅力を引き出します。
          </p>
        </motion.div>

        {/* 信頼と実績の数字バッジ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-16"
        >
          <div className="bg-white rounded-3xl p-6 text-center border-2 border-orange-100 shadow-xl shadow-orange-100/50 flex flex-col justify-center transform hover:-translate-y-1 transition-transform">
            <p className="text-orange-500 font-bold text-sm mb-1">豊富な経験と実績</p>
            <p className="text-3xl font-black text-gray-800 tracking-tight">MIX実績 <span className="text-4xl text-orange-500">800</span><span className="text-2xl">件以上</span></p>
          </div>
          <div className="bg-white rounded-3xl p-6 text-center border-2 border-amber-100 shadow-xl shadow-amber-100/50 flex flex-col justify-center transform hover:-translate-y-1 transition-transform">
            <p className="text-amber-500 font-bold text-sm mb-1">確かなクオリティ</p>
            <p className="text-3xl font-black text-gray-800 tracking-tight">総再生数 <span className="text-4xl text-amber-500">1000</span><span className="text-2xl">万回+</span></p>
          </div>
          <div className="bg-white rounded-3xl p-6 text-center border-2 border-blue-100 shadow-xl shadow-blue-100/50 flex flex-col justify-center transform hover:-translate-y-1 transition-transform">
            <p className="text-blue-500 font-bold text-sm mb-1">高いリピート率</p>
            <p className="text-3xl font-black text-gray-800 tracking-tight">継続依頼率 <span className="text-4xl text-blue-500">80</span><span className="text-2xl">%</span></p>
          </div>
        </motion.div>

        {/* タグフィルター */}
        {allTags.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mb-12 max-w-4xl mx-auto">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => { setActiveTag(tag); setIsExpanded(false); }}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                  activeTag === tag 
                  ? "bg-gray-800 text-white" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* 制作実績一覧 */}
        <div className="max-w-6xl mx-auto">

          {/* 代表実績 (Pick Up) */}
          {activeTag === "すべて" && !isExpanded && works.length >= 3 && (
            <div className="mb-16">
              <div className="flex items-center gap-2 mb-6 border-b-2 border-gray-100 pb-2">
                <div className="bg-orange-500 text-white text-xs font-black px-2 py-1 rounded">PICK UP</div>
                <h3 className="text-xl font-black text-gray-800">代表実績</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                {works.slice(0, 3).map((work) => (
                  <motion.div
                    key={`featured-${work.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    className="bg-white rounded-3xl overflow-hidden border-2 border-orange-100 shadow-xl shadow-orange-100/50 hover:shadow-2xl hover:border-orange-300 transition-all flex flex-col group relative"
                  >
                    <div className="relative aspect-video w-full bg-gray-100 overflow-hidden">
                      <img 
                        src={`https://img.youtube.com/vi/${work.videoId}/maxresdefault.jpg`} 
                        onError={(e) => { e.currentTarget.src = `https://img.youtube.com/vi/${work.videoId}/hqdefault.jpg`; }}
                        alt={work.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <a 
                        href={`https://www.youtube.com/watch?v=${work.videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center"
                      >
                        <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-110 transition-all duration-300">
                          <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[16px] border-l-orange-500 border-b-[10px] border-b-transparent ml-1" />
                        </div>
                      </a>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-center">
                      <h3 className="text-base md:text-lg font-black text-gray-800 line-clamp-2 leading-tight mb-2">
                        {work.title}
                      </h3>
                      {work.artist && (
                        <p className="text-sm font-bold text-gray-500 flex items-center gap-1">
                          <Mic2 size={14} /> {work.artist}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* その他の実績 */}
          {activeTag === "すべて" && !isExpanded && (
            <div className="flex items-center gap-2 mb-6 border-b-2 border-gray-100 pb-2">
              <h3 className="text-lg font-black text-gray-500">最新の実績</h3>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTag}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
            >
              {(activeTag === "すべて" && !isExpanded ? displayedWorks.slice(3) : displayedWorks).map((work) => (
                <motion.div
                  key={work.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-3xl overflow-hidden border-2 border-gray-100 shadow-md hover:shadow-xl hover:border-gray-200 transition-all flex flex-col group relative"
                >
                  <div className="relative aspect-video w-full bg-gray-100 overflow-hidden">
                    <img 
                      src={`https://img.youtube.com/vi/${work.videoId}/mqdefault.jpg`} 
                      alt={work.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <a 
                      href={`https://www.youtube.com/watch?v=${work.videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center"
                    >
                      <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300">
                        <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-orange-500 border-b-[8px] border-b-transparent ml-1" />
                      </div>
                    </a>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-center">
                    {/* タグ表示 */}
                    {work.tags && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {work.tags.split(',').map(tag => (
                          <span key={tag} className="text-[10px] font-bold px-2 py-1 bg-gray-100 text-gray-500 rounded-md">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                    <h3 className="text-sm md:text-base font-bold text-gray-800 line-clamp-2 leading-tight mb-2" title={work.title}>
                      {work.title}
                    </h3>
                    {work.artist && (
                      <p className="text-xs font-bold text-gray-500 flex items-center gap-1 mb-2">
                        <Mic2 size={12} /> {work.artist}
                      </p>
                    )}
                    {/* コメント */}
                    {work.comment && (
                      <div className="mt-3 p-3 bg-orange-50/50 rounded-xl border border-orange-100 text-xs font-bold text-gray-600">
                        {work.comment}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* もっと見るボタン */}
          {filteredWorks.length > INITIAL_DISPLAY_COUNT && (
            <motion.div 
              layout
              className="mt-12 text-center"
            >
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white font-bold rounded-full hover:bg-gray-800 transition-colors shadow-lg"
              >
                {isExpanded ? (
                  <>実績を折りたたむ <ChevronUp size={20} /></>
                ) : (
                  <>もっと見る（全{filteredWorks.length}件） <ChevronDown size={20} /></>
                )}
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
