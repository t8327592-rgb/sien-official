"use client";
import Script from "next/script";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useSyncExternalStore, useState, useRef } from "react";

const eventName = "analytics-consent-change";
const settingsEvent = "analytics-settings-open";
let fallbackConsent: string | null = null;
function readConsent() {
  if (fallbackConsent) return fallbackConsent;
  try { const value = localStorage.getItem("analytics-consent"); return value === "yes" || value === "no" ? value : "unset"; } catch { return "unset"; }
}
function subscribe(listener: () => void) { window.addEventListener(eventName, listener); window.addEventListener("storage", listener); return () => { window.removeEventListener(eventName, listener); window.removeEventListener("storage", listener); }; }

export function CookieSettingsButton() {
  return <button type="button" onClick={() => window.dispatchEvent(new Event(settingsEvent))} className="min-h-11 w-fit rounded text-left text-muted-foreground underline-offset-4 hover:text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-600">Cookie設定</button>;
}
type AnalyticsWindow = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };

export function AnalyticsConsent({ gaId }: { gaId: string }) {
  const consent = useSyncExternalStore(subscribe, readConsent, () => "loading");
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [editing, setEditing] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const privatePage = /^\/(admin|login|order)(\/|$)/.test(pathname) || pathname === "/summer-sale/order";
  const enabled = /^G-[A-Z0-9]+$/.test(gaId) && consent === "yes" && !privatePage;
  useEffect(() => {
    function open() { opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; setEditing(true); }
    window.addEventListener(settingsEvent, open);
    return () => window.removeEventListener(settingsEvent, open);
  }, []);
  useEffect(() => { if (editing) heading.current?.focus({ preventScroll: true }); }, [editing]);
  function close() { setEditing(false); opener.current?.focus({ preventScroll: true }); }
  useEffect(() => {
    const state = window as unknown as Record<string, unknown>;
    state[`ga-disable-${gaId}`] = !enabled;
    if (enabled && ready) (window as AnalyticsWindow).gtag?.("event", "page_view", { page_location: location.origin + pathname, page_path: pathname });
  }, [enabled, gaId, pathname, ready]);
  function choose(value: string) {
    try { localStorage.setItem("analytics-consent", value); fallbackConsent = null; } catch { fallbackConsent = value; }
    (window as unknown as Record<string, unknown>)[`ga-disable-${gaId}`] = value !== "yes";
    if (value !== "yes") {
      for (const cookie of document.cookie.split(";")) { const key = cookie.trim().split("=")[0]; if (key.startsWith("_ga")) document.cookie = `${key}=; Max-Age=0; path=/`; }
    }
    window.dispatchEvent(new Event(eventName));
    close();
  }
  if (!/^G-[A-Z0-9]+$/.test(gaId) || privatePage) return null;
  return <>
    {(consent === "unset" || editing) && <section aria-labelledby="cookie-consent-heading" onKeyDown={event => { if (event.key === "Escape" && editing && consent !== "unset") close(); }} className="fixed inset-x-4 bottom-4 z-50 mx-auto max-h-[calc(100dvh-2rem)] max-w-sm overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-lg sm:left-auto sm:right-6 sm:bottom-6 sm:mx-0 sm:w-96 sm:p-6">
      <h2 id="cookie-consent-heading" ref={heading} tabIndex={-1} className="mb-2 text-base font-bold text-slate-900 outline-none">Cookieの利用について</h2>
      <p className="text-sm leading-relaxed text-slate-600">サイトの改善のため、Google Analyticsを使用しています。アクセス解析を許可するか選択できます。</p>
      {editing && consent !== "unset" && <p className="mt-2 text-xs text-slate-600">現在の設定：{consent === "yes" ? "許可" : "許可しない"}。ここでいつでも変更できます。</p>}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button type="button" onClick={() => choose("no")} className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600">許可しない</button>
        <button type="button" onClick={() => choose("yes")} className="min-h-11 rounded-xl border border-orange-700 bg-orange-700 px-3 py-2 text-sm font-bold text-white hover:bg-orange-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600">許可する</button>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 text-xs"><Link href="/policy/privacy" className="rounded py-2 text-slate-600 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600">プライバシーポリシー</Link>{editing && consent !== "unset" && <button type="button" onClick={close} className="min-h-11 rounded px-2 text-slate-600 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600">閉じる</button>}</div>
    </section>}
    {enabled && <Script id="consented-analytics" src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" onReady={() => { const win = window as AnalyticsWindow; win.dataLayer ??= []; win.gtag ??= function (...args: unknown[]) { win.dataLayer?.push(args); }; win.gtag("js", new Date()); win.gtag("config", gaId, { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false }); setReady(true); }} />}
  </>;
}
