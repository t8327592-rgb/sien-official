"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { List } from "lucide-react";

type TocItem = {
  id: string;
  text: string;
  level: number;
};

export function TableOfContents({ content }: { content: string }) {
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
            className={`text-sm font-medium transition-colors line-clamp-2 ${
              item.level === 3 ? "ml-4" : ""
            } ${
              activeId === item.id
                ? "text-orange-600 font-bold"
                : "text-slate-600 hover:text-slate-900"
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
