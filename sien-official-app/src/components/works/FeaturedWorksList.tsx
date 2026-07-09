"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { Portfolio } from "@prisma/client";

type FeaturedWorksListProps = {
  portfolios?: Portfolio[];
  mixPortfolios?: Portfolio[];
  originalPortfolios?: Portfolio[];
};

export function FeaturedWorksList({ portfolios, mixPortfolios, originalPortfolios }: FeaturedWorksListProps) {
  const [activeTab, setActiveTab] = useState<"mix" | "original">("mix");
  const [playingId, setPlayingId] = useState<string | null>(null);

  const getYoutubeVideoId = (url: string | null) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : null;
  };

  const getYoutubeThumbnail = (url: string | null) => {
    const videoId = getYoutubeVideoId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg";
  };

  const hasTabs = mixPortfolios !== undefined && originalPortfolios !== undefined;
  const displayPortfolios = portfolios ? portfolios : (activeTab === "mix" ? (mixPortfolios || []) : (originalPortfolios || []));

  return (
    <div className="max-w-6xl mx-auto">
      {hasTabs && (
        <div className="flex justify-center mb-10 gap-3 sm:gap-4">
          <button 
            onClick={() => { setActiveTab("mix"); setPlayingId(null); }}
            className={`px-5 py-2.5 sm:px-8 sm:py-3 rounded-full font-bold text-sm sm:text-base transition-all duration-300 ${activeTab === "mix" ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30 scale-105" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            ボーカルMIX
          </button>
          <button 
            onClick={() => { setActiveTab("original"); setPlayingId(null); }}
            className={`px-5 py-2.5 sm:px-8 sm:py-3 rounded-full font-bold text-sm sm:text-base transition-all duration-300 ${activeTab === "original" ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30 scale-105" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            オリジナル楽曲制作
          </button>
        </div>
      )}

      <div className={`grid grid-cols-1 md:grid-cols-2 ${activeTab === "original" ? "lg:grid-cols-3 max-w-4xl mx-auto" : "lg:grid-cols-4"} gap-6`}>
        {displayPortfolios.map((p) => {
          const thumb = getYoutubeThumbnail(p.url);
          const videoId = getYoutubeVideoId(p.url);
          const isPlaying = playingId === p.id && videoId;

          return (
            <div key={p.id} className="group block relative rounded-2xl overflow-hidden aspect-video bg-slate-100 ring-1 ring-slate-200 hover:ring-orange-300 hover:shadow-xl transition-all duration-300">
              {isPlaying ? (
                <div className="absolute inset-0 bg-black z-20">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                    title={p.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <div className="w-full h-full cursor-pointer" onClick={() => setPlayingId(p.id)}>
                  <Image src={thumb} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 768px) 100vw, 25vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                  <div className="absolute bottom-0 inset-x-0 p-4 translate-y-2 group-hover:translate-y-0 transition-transform">
                    <h3 className="text-white font-bold text-sm line-clamp-2 mb-2 leading-snug">{p.title}</h3>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${activeTab === "original" ? "text-amber-700 bg-amber-100" : "text-orange-700 bg-orange-100"}`}>
                      {p.serviceCategory || (activeTab === "original" ? "オリジナル楽曲制作" : "MIX & MASTERING")}
                    </span>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                      <Play className="w-5 h-5 text-orange-600 ml-1 fill-orange-600" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
