"use client";

import { useState } from "react";
import Image from "next/image";

type Portfolio = {
  id: string;
  title: string;
  url: string | null;
  serviceCategory: string | null;
  tags: string | null;
  isFeatured: boolean;
};

export default function WorksClient({
  portfolios,
  mixPortfolios,
  originalPortfolios
}: {
  portfolios?: Portfolio[],
  mixPortfolios?: Portfolio[],
  originalPortfolios?: Portfolio[]
}) {
  const [activeTab, setActiveTab] = useState<"mix" | "original">("mix");
  const [visibleCount, setVisibleCount] = useState(12);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  // モーダルではなく、現在インラインで再生中のポートフォリオIDを保持
  const [playingId, setPlayingId] = useState<string | null>(null);

  const hasTabs = mixPortfolios !== undefined && originalPortfolios !== undefined;
  const currentPortfolios = portfolios ? portfolios : (activeTab === "mix" ? (mixPortfolios || []) : (originalPortfolios || []));

  // 全タグを抽出して重複を削除
  const allTags = Array.from(new Set(
    currentPortfolios
      .flatMap(p => p.tags ? p.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [])
  )).sort();

  // タグでフィルタリング
  const filteredPortfolios = activeTag
    ? currentPortfolios.filter(p => p.tags && p.tags.split(",").map((t: string) => t.trim()).includes(activeTag))
    : currentPortfolios;

  const getYoutubeId = (url: string | null) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : null;
  };

  const getYoutubeThumbnail = (url: string | null) => {
    const id = getYoutubeId(url);
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
  };

  return (
    <>
      {/* タブ UI */}
      {hasTabs && (
        <div className="flex flex-wrap justify-center mb-8 gap-3 sm:gap-4">
          <button
            aria-pressed={activeTab === "mix"}
            onClick={() => { setActiveTab("mix"); setActiveTag(null); setPlayingId(null); setVisibleCount(12); }}
            className={`px-6 py-3 rounded-full font-bold text-sm sm:text-base transition-all duration-300 ${activeTab === "mix" ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            ボーカルMIX
          </button>
          <button
            aria-pressed={activeTab === "original"}
            onClick={() => { setActiveTab("original"); setActiveTag(null); setPlayingId(null); setVisibleCount(12); }}
            className={`px-6 py-3 rounded-full font-bold text-sm sm:text-base transition-all duration-300 ${activeTab === "original" ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            オリジナル楽曲制作
          </button>
        </div>
      )}

      {/* タグフィルター UI */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          <button
            aria-pressed={activeTag === null}
            onClick={() => { setActiveTag(null); setVisibleCount(12); setPlayingId(null); }}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
              activeTag === null
                ? "bg-orange-600 text-white shadow-md"
                : "bg-white text-slate-600 border border-slate-200 hover:border-orange-300 hover:bg-orange-50"
            }`}
          >
            すべて
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              aria-pressed={activeTag === tag}
              onClick={() => { setActiveTag(tag); setVisibleCount(12); setPlayingId(null); }}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                activeTag === tag
                  ? "bg-orange-600 text-white shadow-md"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-orange-300 hover:bg-orange-50"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* ポートフォリオ一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredPortfolios.slice(0, visibleCount).map((p) => {
          const thumbnail = getYoutubeThumbnail(p.url);
          const youtubeId = getYoutubeId(p.url);
          const isPlaying = playingId === p.id && youtubeId;

          return (
            <div
              key={p.id}
              className="group flex flex-col text-left bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 w-full"
            >
              <div className="aspect-video bg-slate-100 relative overflow-hidden w-full">
                {isPlaying ? (
                  <iframe loading="lazy" referrerPolicy="strict-origin-when-cross-origin"
                    src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1`}
                    title={p.title}
                    className="absolute inset-0 w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <>
                    {thumbnail ? (
                      <Image
                        src={thumbnail}
                        alt={p.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                        onClick={() => youtubeId && setPlayingId(p.id)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-200">No Image</div>
                    )}
                    {p.isFeatured && (
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-600 to-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md pointer-events-none">
                        代表作
                      </div>
                    )}
                    {/* 再生ボタンオーバーレイ (画像がある場合のみ) */}
                    {youtubeId && (
                      <button
                        onClick={() => setPlayingId(p.id)}
                        className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center w-full h-full cursor-pointer"
                        aria-label={`${p.title}を再生`}
                      >
                        <div className="w-12 h-12 rounded-full bg-white/90 shadow-lg flex items-center justify-center opacity-100 transition-all duration-300 ">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-orange-700 ml-1">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </button>
                    )}
                  </>
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col w-full">
                <div className="flex-1">
                  <h2 className="font-bold text-slate-800 text-sm leading-relaxed line-clamp-2 transition-colors" title={p.title}>
                    {p.title}
                  </h2>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold tracking-wider text-orange-700 bg-orange-50 px-2 py-1 rounded-md uppercase">
                    {p.serviceCategory || "MIX"}
                  </span>
                  {p.tags && p.tags.split(",").map((t: string) => t.trim()).filter(Boolean).map((t: string) => (
                    <span key={t} className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p role="status" className="mt-6 text-center text-sm text-slate-600">{Math.min(visibleCount, filteredPortfolios.length)} / {filteredPortfolios.length}件を表示</p>
      {visibleCount < filteredPortfolios.length && <div className="mt-4 text-center"><button type="button" onClick={() => setVisibleCount(count => count + 12)} className="min-h-12 rounded-full border border-slate-300 bg-white px-8 font-bold text-slate-700 hover:border-orange-400">さらに12件を見る</button></div>}
      {filteredPortfolios.length === 0 && (
        <div className="text-center py-20 text-slate-500 bg-white rounded-2xl border border-slate-100">
          該当する実績が見つかりませんでした。
        </div>
      )}
    </>
  );
}
