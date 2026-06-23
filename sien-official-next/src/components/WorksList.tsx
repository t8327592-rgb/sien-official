'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';

type Work = {
  id: string;
  youtubeId: string;
  title: string;
  category: string;
  clientName: string;
};

const CATEGORIES = [
  { id: 'all', label: 'すべて' },
  { id: 'mix', label: '歌ってみた' },
  { id: 'orig', label: 'オリジナル' },
  { id: 'vtuber', label: 'VTuber' },
  { id: 'other', label: 'その他' }
];

export default function WorksList({ works }: { works: Work[] }) {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredWorks = useMemo(() => {
    return works.filter(work => {
      const matchQuery = work.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (work.clientName && work.clientName.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchCategory = selectedCategory === 'all' || work.category === selectedCategory;
      return matchQuery && matchCategory;
    });
  }, [works, searchQuery, selectedCategory]);

  return (
    <>
      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
        <div className="flex flex-wrap justify-center gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 shadow-sm ${
                selectedCategory === cat.id 
                  ? 'bg-[#47A1FF] text-white shadow-[0_4px_15px_rgba(71,161,255,0.4)] border border-[#47A1FF]' 
                  : 'bg-white text-gray-600 hover:text-[#1D1D1F] border border-gray-200 hover:border-[#0071E3]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:w-72 shadow-sm">
          <input 
            type="text" 
            placeholder="タイトルや名前で検索..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-full pl-10 pr-4 py-2.5 text-sm text-[#1D1D1F] focus:outline-none focus:border-[#47A1FF] focus:ring-1 focus:ring-[#47A1FF] transition-colors"
          />
          <svg className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      </div>

      {/* Grid List */}
      {filteredWorks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredWorks.map((work) => (
            <button
              key={work.id}
              onClick={() => setSelectedVideo(work.youtubeId)}
              className="modern-card group block relative w-full text-left rounded-2xl overflow-hidden glass-panel border-gray-200 shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
            >
              <div className="aspect-video relative overflow-hidden bg-gray-100">
                <Image 
                  src={`https://i.ytimg.com/vi/${work.youtubeId}/maxresdefault.jpg`} 
                  alt={work.title} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                  unoptimized
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-[#0071E3]/80 backdrop-blur rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300 shadow-[0_4px_20px_rgba(0,113,227,0.5)] text-white pl-1">
                    <span className="text-2xl">▶</span>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-white/50 h-full">
                <p className="text-xs font-bold text-[#47A1FF] mb-2 tracking-wider">
                  {CATEGORIES.find(c => c.id === work.category)?.label.toUpperCase() || work.category.toUpperCase()}
                </p>
                <h3 className="font-bold text-[#1D1D1F] line-clamp-2 transition-colors leading-snug group-hover:text-[#0071E3]">
                  {work.title}
                </h3>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500 font-medium">
          実績が見つかりませんでした。
        </div>
      )}

      {/* YouTube Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#111]/95 backdrop-blur-md" onClick={() => setSelectedVideo(null)}>
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10" onClick={e => e.stopPropagation()}>
            <button 
              className="absolute -top-12 right-0 text-gray-400 hover:text-white transition-colors"
              onClick={() => setSelectedVideo(null)}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </>
  );
}
