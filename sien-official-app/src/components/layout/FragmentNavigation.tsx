"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// A fragment may arrive before its target in a streamed page response.
export function FragmentNavigation() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    let observer: MutationObserver | undefined;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const stop = () => { observer?.disconnect(); clearTimeout(timeout); };
    const scroll = () => {
      let id: string;
      try { id = decodeURIComponent(window.location.hash.slice(1)); } catch { return true; }
      if (!id) return true;
      const target = document.getElementById(id);
      if (!target) return false;
      target.scrollIntoView({ block: "start", behavior: "instant" });
      stop();
      return true;
    };
    const align = () => {
      stop();
      if (scroll()) return;
      observer = new MutationObserver(scroll);
      observer.observe(document.body, { childList: true, subtree: true });
      timeout = setTimeout(stop, 15000);
    };
    align();
    window.addEventListener("hashchange", align);
    return () => { stop(); window.removeEventListener("hashchange", align); };
  }, [pathname]);
  return null;
}
