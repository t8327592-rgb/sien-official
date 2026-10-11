"use client";
import { useState } from "react";
import Image from "next/image";

export function YouTubePreview({ url, title }: { url: string | null; title: string }) {
  const [playing, setPlaying] = useState(false);
  const match = url?.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|shorts\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  const id = match?.[1];
  if (!id) return <p className="flex h-full items-center justify-center p-4 text-slate-700">動画の公開URLを準備中です</p>;
  if (playing) return <iframe className="absolute inset-0 h-full w-full border-0" src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`} title={title} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />;
  return <button type="button" onClick={() => setPlaying(true)} aria-label={`${title}をYouTubeで再生`} className="relative h-full w-full bg-slate-900"><Image src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" /><span className="absolute inset-0 flex items-center justify-center"><span className="rounded-full bg-slate-950/80 px-5 py-3 font-bold text-white">▶ 再生</span></span></button>;
}
