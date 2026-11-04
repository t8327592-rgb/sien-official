import Link from "next/link";
import { ArrowRight, CalendarDays, Mic2, Sparkles } from "lucide-react";
import { audioDeadline, autumnSale } from "@/config/autumn-sale";

export function AutumnSaleBanner() {
  return (
    <aside aria-label="秋のMIXセール" className="mb-6 rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-900">
            <Sparkles size={15} aria-hidden="true" />秋のMIXセール開催中
          </p>
          <p className="mt-2 text-sm font-bold text-slate-700">通常のお見積もり総額から</p>
          <p className="text-4xl font-extrabold leading-tight tracking-tight text-orange-800">{autumnSale.discount}<span className="text-2xl">% OFF</span></p>
        </div>
        <div className="space-y-2 text-sm font-bold text-slate-800">
          <p className="flex items-start gap-2"><CalendarDays size={17} className="mt-0.5 shrink-0 text-orange-700" aria-hidden="true" />
            音源提出は原則 {audioDeadline}まで（日本時間）
          </p>
          <p className="flex items-center gap-2"><Mic2 size={17} className="shrink-0 text-orange-700" aria-hidden="true" />録音前でも申し込みOK</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-orange-100 pt-3">
        <p className="text-xs text-slate-600">お支払いは正式見積もりに同意した後です。</p>
        <Link href={autumnSale.path} className="inline-flex min-h-10 items-center gap-2 text-sm font-bold text-orange-800 underline underline-offset-4">
          セールの詳細・注意事項を見る <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </aside>
  );
}

export function AutumnSaleNewsLink({ phase }: { phase: "upcoming" | "open" | "closed" }) {
  const status = phase === "open" ? "開催中" : phase === "upcoming" ? "開催予告" : "受付終了";
  return (
    <Link href={autumnSale.path} className="group flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl bg-orange-50 px-5 py-4 hover:bg-orange-100">
      <time dateTime={autumnSale.announcementDay} className="shrink-0 text-sm font-bold text-slate-600">{autumnSale.announcementDay.replaceAll("-", "/")}</time>
      <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-orange-800">{status}</span>
      <span className="min-w-0 flex-1 basis-52 font-bold text-slate-900 group-hover:text-orange-800">{autumnSale.firstDay.slice(0, 4)}年 秋のMIXセール{phase === "closed" ? "" : `（${autumnSale.discount}%OFF）`}</span>
      <ArrowRight size={17} className="ml-auto shrink-0 text-orange-800" aria-hidden="true" />
    </Link>
  );
}
