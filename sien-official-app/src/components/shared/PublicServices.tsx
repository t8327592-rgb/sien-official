import Link from "next/link";
import { ArrowRight, Music, Archive } from "lucide-react";
import { getServices } from "@/lib/data/cms";
import { serviceCategory } from "@/lib/service-category";

function featureLines(value: string | null) {
  if (!value) return [];
  try { const parsed: unknown = JSON.parse(value); if (Array.isArray(parsed)) return parsed.filter((line): line is string => typeof line === "string"); } catch { /* Plain text is also supported by the CMS. */ }
  return value.split(/\r?\n/).filter(Boolean);
}
export async function PublicServices({ category }: { category?: "MIX" | "ORIGINAL" }) {
  const stored = await getServices();
  const available = !category && !stored.length ? [
    { id: "default-mix", name: "ボーカルMIX・マスタリング", category: "MIX", description: "歌ってみたのピッチ・タイミング補正からMIX・マスタリングまで。料金・条件を確認してご相談ください。", features: "ピッチ・タイミング補正\nMIX・マスタリング" },
    { id: "default-original", name: "オリジナル楽曲制作", category: "ORIGINAL", description: "作詞・作曲・編曲など、プランに応じて制作します。制作範囲・初稿提出目安は料金ページをご確認ください。", features: "作詞・作曲・編曲\n制作範囲はプランごとにご案内" }
  ] : stored;
  const services = available.filter(service => !category || serviceCategory(service.category) === category);
  if (!services.length) return null;
  return <section aria-labelledby={`services-${category || "all"}`} className="container mx-auto max-w-5xl px-4 py-12 md:py-24">
    <div className="mb-8 text-center md:mb-16">
      <h2 id={`services-${category || "all"}`} className="text-2xl font-extrabold text-slate-900 md:text-3xl">サービス内容</h2>
      <div aria-hidden="true" className="mx-auto mt-4 h-1 w-12 rounded-full bg-gradient-to-r from-orange-500 to-amber-500" />
    </div>
    <div className="grid gap-5 md:grid-cols-2 md:gap-8">{services.map(service => {
      const original = serviceCategory(service.category) === "ORIGINAL";
      const Icon = original ? Archive : Music;
      return <article key={service.id}>
        <Link className="group flex h-full cursor-pointer flex-col rounded-3xl border border-slate-200 bg-white p-6 transition-[border-color,box-shadow] hover:border-orange-300 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-600 md:rounded-[2rem] md:p-10" aria-label={`${service.name}の料金・条件を見る`} href={original ? "/original#plans" : "/mix#plans"}>
          <div aria-hidden="true" className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl md:mb-8 md:h-16 md:w-16 ${original ? "bg-amber-50 text-amber-500" : "bg-orange-50 text-orange-500"}`}><Icon className="h-7 w-7 md:h-8 md:w-8" /></div>
          <h3 className="mb-4 text-xl font-bold text-slate-900 md:text-2xl">{service.name}</h3>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600 sm:text-base">{service.description}</p>
          <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-slate-600">{featureLines(service.features).map((feature, i) => <li key={i}>{feature}</li>)}</ul>
          <span className="mt-auto inline-flex min-h-11 items-center gap-2 pt-6 font-bold text-orange-600 group-hover:underline group-hover:underline-offset-4">料金・条件を見る <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
        </Link>
      </article>;
    })}</div>
  </section>;
}
