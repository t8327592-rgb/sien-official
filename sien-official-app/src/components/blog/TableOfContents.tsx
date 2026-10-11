"use client";

import React, { useEffect, useState, useSyncExternalStore, useMemo } from "react";
import Link from "next/link";
import { List } from "lucide-react";

type TocItem = {
  id: string;
  text: string;
  level: number;
};

function subscribeHeadings(notify: () => void) {
  const observer = new MutationObserver(notify);
  observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["id"] });
  return () => observer.disconnect();
}
function headingSnapshot() {
  return JSON.stringify(Array.from(document.querySelectorAll(".prose h2[id], .prose h3[id]")).map(el => ({ id: el.id, text: el.textContent || "", level: el.tagName === "H2" ? 2 : 3 })));
}

export function TableOfContents({ content, isInline = false }: { content: string, isInline?: boolean }) {
  const [activeId, setActiveId] = useState<string>("");
  const serialized = useSyncExternalStore(subscribeHeadings, headingSnapshot, () => "[]");
  const toc = useMemo<TocItem[]>(() => JSON.parse(serialized), [serialized]);

  useEffect(() => {
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

    document.querySelectorAll(".prose h2[id], .prose h3[id]").forEach((el) => {
      if (el.id) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [content, serialized]);

  if (toc.length === 0) return null;

  if (isInline) {
    return (
      <div className="bg-slate-50 rounded-2xl p-6 md:p-8 border border-slate-200 my-12">
        <h3 className="text-lg md:text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2 pb-4 border-b border-slate-200">
          <List className="w-6 h-6 text-orange-700" />
          目次
        </h3>
        <nav className="flex flex-col gap-3">
          {toc.map((item) => (
            <Link
              key={item.id}
              href={`#${item.id}`}
              className={`text-[16px] md:text-[18px] font-medium transition-colors leading-relaxed hover:text-orange-700 flex items-start gap-2 ${
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
    <div className="sticky top-24 pt-2">
      <h3 className="text-[13px] font-extrabold text-slate-600 mb-4 tracking-wider uppercase flex items-center gap-2">
        <List className="w-4 h-4" />
        Table of Contents
      </h3>
      <nav className="flex flex-col gap-2 max-h-[70vh] overflow-y-auto scrollbar-hide pr-2">
        {toc.map((item) => (
          <Link
            key={item.id}
            href={`#${item.id}`}
            className={`text-[14px] font-medium transition-all duration-200 line-clamp-2 leading-relaxed border-l-2 pl-3 py-1 ${
              item.level === 3 ? "ml-3 text-[13px]" : ""
            } ${
              activeId === item.id
                ? "text-orange-700 border-orange-500 font-extrabold"
                : "text-slate-500 border-transparent hover:text-slate-800 hover:border-slate-300"
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
