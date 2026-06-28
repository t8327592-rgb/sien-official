"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { List } from "lucide-react";

type TocItem = {
  id: string;
  text: string;
  level: number;
};

export function TableOfContents({ content, isInline = false }: { content: string, isInline?: boolean }) {
  const [activeId, setActiveId] = useState<string>("");
  const [toc, setToc] = useState<TocItem[]>([]);

  useEffect(() => {
    // 簡易的なMarkdown見出し抽出（クライアントサイドで実行）
    const headings = Array.from(document.querySelectorAll("h2, h3"))
      .filter((el) => el.id)
      .map((el) => ({
        id: el.id,
        text: el.textContent || "",
        level: el.tagName === "H2" ? 2 : 3,
      }));
    setToc(headings);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "0% 0% -80% 0%" }
    );

    document.querySelectorAll("h2, h3").forEach((el) => {
      if (el.id) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [content]);

  if (toc.length === 0) return null;

  if (isInline) {
    return (
      <div className="bg-slate-50 rounded-2xl p-6 md:p-8 border border-slate-200 my-12">
        <h3 className="text-lg md:text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2 pb-4 border-b border-slate-200">
          <List className="w-6 h-6 text-orange-500" />
          目次
        </h3>
        <nav className="flex flex-col gap-3">
          {toc.map((item) => (
            <Link
              key={item.id}
              href={`#${item.id}`}
              className={`text-[16px] md:text-[18px] font-medium transition-colors leading-relaxed hover:text-orange-600 flex items-start gap-2 ${
                item.level === 3 ? "ml-6 md:ml-8 text-sm md:text-base text-slate-600" : "text-slate-800"
              }`}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(item.id);
                if (el) {
                  const y = el.getBoundingClientRect().top + window.scrollY - 100;
                  window.scrollTo({ top: y, behavior: "smooth" });
                }
              }}
            >
              <span className="text-orange-400 mt-1 flex-shrink-0">{item.level === 2 ? "■" : "•"}</span>
              <span className="flex-1">{item.text}</span>
            </Link>
          ))}
        </nav>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm sticky top-24">
      <h3 className="text-base font-extrabold text-slate-900 mb-5 flex items-center gap-2 pb-4 border-b border-slate-100">
        <List className="w-5 h-5 text-orange-500" />
        目次
      </h3>
      <nav className="flex flex-col gap-2.5 max-h-[60vh] overflow-y-auto scrollbar-hide pr-2">
        {toc.map((item) => (
          <Link
            key={item.id}
            href={`#${item.id}`}
            className={`text-[15px] font-medium transition-all duration-200 line-clamp-2 leading-relaxed ${
              item.level === 3 ? "ml-5 text-sm" : ""
            } ${
              activeId === item.id
                ? "text-orange-600 font-extrabold translate-x-1"
                : "text-slate-600 hover:text-slate-900 hover:translate-x-0.5"
            }`}
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById(item.id);
              if (el) {
                const y = el.getBoundingClientRect().top + window.scrollY - 100;
                window.scrollTo({ top: y, behavior: "smooth" });
              }
            }}
          >
            {item.text}
          </Link>
        ))}
      </nav>
    </div>
  );
}
