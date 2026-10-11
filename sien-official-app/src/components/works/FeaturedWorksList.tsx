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
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
  };

  const hasTabs = mixPortfolios !== undefined && originalPortfolios !== undefined;
  const displayPortfolios = portfolios ? portfolios : (activeTab === "mix" ? (mixPortfolios || []) : (originalPortfolios || []));

  return (
    <div className="max-w-6xl mx-auto">
      {hasTabs && (
        <div className="flex flex-wrap justify-center mb-6 md:mb-10 gap-3 sm:gap-4">
          <button
            aria-pressed={activeTab === "mix"} onClick={() => { setActiveTab("mix"); setPlayingId(null); }}
            className={`px-5 py-2.5 sm:px-8 sm:py-3 rounded-full font-bold text-sm sm:text-base transition-all duration-300 ${activeTab === "mix" ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            ボーカルMIX
          </button>
          <button
            aria-pressed={activeTab === "original"} onClick={() => { setActiveTab("original"); setPlayingId(null); }}
            className={`px-5 py-2.5 sm:px-8 sm:py-3 rounded-full font-bold text-sm sm:text-base transition-all duration-300 ${activeTab === "original" ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            オリジナル楽曲制作
          </button>
        </div>
      )}

      <div className={`grid grid-cols-1 md:grid-cols-2 ${activeTab === "original" ? "lg:grid-cols-3 max-w-4xl mx-auto" : "lg:grid-cols-4"} gap-3 md:gap-6`}>
        {displayPortfolios.map((p) => {
          const thumb = getYoutubeThumbnail(p.url);
          const videoId = getYoutubeVideoId(p.url);
          const isPlaying = playingId === p.id && videoId;

          return (
            <div key={p.id} className="group relative aspect-video overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200 transition-[box-shadow] hover:ring-orange-300 hover:shadow-xl">
              {isPlaying ? (
                <div className="absolute inset-0 bg-black z-20">
                  <iframe loading="lazy" referrerPolicy="strict-origin-when-cross-origin"
                    className="w-full h-full"
                    src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
                    title={p.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <button type="button" aria-label={`${p.title}を再生`} disabled={!videoId} className="absolute inset-0 h-full w-full cursor-pointer text-left focus-visible:outline-offset-[-4px]" onClick={() => setPlayingId(p.id)}>
                  {thumb && <Image src={thumb} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/20 to-transparent"></div>
                  <div className="absolute inset-0 flex items-center justify-center transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg transition-all duration-300 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                      <Play className="w-5 h-5 text-orange-700 ml-1 fill-orange-600" />
                    </div>
                  </div>
                </button>
              )}
              <div className={isPlaying ? "sr-only" : "pointer-events-none absolute inset-x-0 bottom-0 min-w-0 p-4"}>
                <h3 className="mb-2 line-clamp-2 text-sm font-bold leading-snug text-white" title={p.title}>{p.title}</h3>
                <span className={`inline-block rounded-md px-2 py-1 text-[10px] font-bold ${activeTab === "original" ? "bg-amber-100 text-amber-800" : "bg-orange-100 text-orange-800"}`}>{p.serviceCategory === "ORIGINAL" ? "オリジナル楽曲制作" : p.serviceCategory === "MIX" ? "ボーカルMIX" : p.serviceCategory || "制作実績"}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
