"use client";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useSyncExternalStore, useState } from "react";

const eventName = "analytics-consent-change";
function readConsent() { try { return localStorage.getItem("analytics-consent") || "unset"; } catch { return "unset"; } }
function subscribe(listener: () => void) { window.addEventListener(eventName, listener); window.addEventListener("storage", listener); return () => { window.removeEventListener(eventName, listener); window.removeEventListener("storage", listener); }; }
type AnalyticsWindow = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };

export function AnalyticsConsent({ gaId }: { gaId: string }) {
  const consent = useSyncExternalStore(subscribe, readConsent, () => "unset");
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const privatePage = /^\/(admin|login|order)(\/|$)/.test(pathname) || pathname === "/summer-sale/order";
  const enabled = /^G-[A-Z0-9]+$/.test(gaId) && consent === "yes" && !privatePage;
  useEffect(() => {
    const state = window as unknown as Record<string, unknown>;
    state[`ga-disable-${gaId}`] = !enabled;
    if (enabled && ready) (window as AnalyticsWindow).gtag?.("event", "page_view", { page_location: location.origin + pathname, page_path: pathname });
  }, [enabled, gaId, pathname, ready]);
  function choose(value: string) {
    try { localStorage.setItem("analytics-consent", value); } catch { return; }
    if (value !== "yes") {
      for (const cookie of document.cookie.split(";")) { const key = cookie.trim().split("=")[0]; if (key.startsWith("_ga")) document.cookie = `${key}=; Max-Age=0; path=/`; }
    }
    window.dispatchEvent(new Event(eventName));
  }
  if (!/^G-[A-Z0-9]+$/.test(gaId) || privatePage) return null;
  return <><section aria-label="アクセス解析の設定" className="border-t bg-slate-50 px-4 py-5 text-center text-sm text-slate-700"><p>アクセス解析：{consent === "yes" ? "同意済み" : consent === "no" ? "停止中" : "未設定"}。Google Analyticsで公開ページの閲覧情報を取得します。</p><div className="mt-3 flex flex-wrap justify-center gap-4"><button type="button" onClick={() => choose("yes")} className="rounded-lg bg-orange-600 px-4 py-2 font-bold text-slate-900">解析に同意する</button><button type="button" onClick={() => choose("no")} className="rounded-lg border border-slate-500 px-4 py-2 font-bold">同意しない・同意を撤回する</button></div></section>{enabled && <Script id="consented-analytics" src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" onReady={() => { const win = window as AnalyticsWindow; win.dataLayer ??= []; win.gtag ??= function (...args: unknown[]) { win.dataLayer?.push(args); }; win.gtag("js", new Date()); win.gtag("config", gaId, { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false }); setReady(true); }} />}</>;
}
