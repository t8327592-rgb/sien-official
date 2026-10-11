import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getPlans, getOptions } from "@/lib/data/cms";
import { pageMetadata } from "@/lib/page-metadata";
import { formatYen, formatOptionPrice } from "@/lib/public-format";
import { DELIVERY_TERMS, REVISION_TERMS } from "@/lib/contract-terms";

export const revalidate = 60;
export const metadata = pageMetadata("/pricing", {
  title: "料金・プラン | Sien-Official",
  description: "歌ってみたMIX・オリジナル楽曲制作・ボーカルガイドの料金、初稿提出目安、無料修正回数を比較できます。表示価格は税込です。",
});

export default async function PricingPage() {
  const [mixPlans, originalPlans, options] = await Promise.all([getPlans("MIX"), getPlans("ORIGINAL"), getOptions("MIX")]);
  const guide = options.find(option => option.name.includes("ボーカルガイド"));
  return (
    <div className="bg-white text-slate-900">
      <section className="border-b border-slate-100 bg-orange-50/40 px-4 py-10 md:py-20 text-center">
        <p className="mb-3 text-sm font-bold text-slate-600">サービスを選んで、料金を比較</p>
        <h1 className="text-3xl md:text-5xl font-bold">料金・プラン</h1>
        <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base leading-relaxed text-slate-600">表示価格はすべて税込です。制作範囲やオプションを確認したうえで、正式なお見積もりをご案内します。</p>
        <nav aria-label="料金のサービス選択" className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="#mix" className="inline-flex min-h-11 items-center rounded-full border border-slate-300 bg-white px-5 text-sm font-bold">ボーカルMIX</Link>
          <Link href="#original" className="inline-flex min-h-11 items-center rounded-full border border-slate-300 bg-white px-5 text-sm font-bold">オリジナル楽曲</Link>
        </nav>
      </section>
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">
        <div className="grid gap-8 lg:grid-cols-2">
          {[
            { id: "mix", title: "ボーカルMIX・マスタリング", plans: mixPlans, url: "/mix#plans", description: "歌ってみた・ショート動画・コラボ音源など" },
            { id: "original", title: "オリジナル楽曲制作", plans: originalPlans, url: "/original#plans", description: "作詞・作曲・編曲など、プランに応じて制作" },
          ].map(service => (
            <section key={service.id} id={service.id} className="scroll-mt-24">
              <h2 className="text-xl md:text-2xl font-bold">{service.title}</h2>
              <p className="mt-2 mb-5 text-sm text-slate-600">{service.description}</p>
              <ul className="divide-y divide-slate-200 rounded-3xl border border-slate-200 bg-white">
                {service.plans.map(plan => (
                  <li key={plan.id} className="p-4 sm:p-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-bold">{plan.name}</h3>
                      <p className="font-bold">{formatYen(plan.price)}</p>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">初稿目安：{plan.period || "要相談"}／無料修正：{plan.revisions || "要相談"}</p>
                    <Link href={`/order?plan=${encodeURIComponent(plan.id)}`} className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-bold underline decoration-orange-500 underline-offset-4">このプランで依頼する<ArrowRight size={16} aria-hidden="true" /></Link>
                  </li>
                ))}
                {!service.plans.length && <li className="p-5 text-sm text-slate-600">現在公開されているプランはありません。</li>}
              </ul>
              <Link href={service.url} className="mt-4 inline-flex min-h-11 items-center gap-2 font-bold text-slate-700 underline decoration-orange-500 underline-offset-4">制作範囲・オプションを見る<ArrowRight size={16} aria-hidden="true" /></Link>
            </section>
          ))}
        </div>
        {guide && <section className="mt-8 rounded-2xl border border-slate-200 p-5"><h2 className="text-lg font-bold">ボーカルガイド作成（単独）</h2><p className="mt-2 font-bold">{formatOptionPrice(guide.priceText)}</p><Link href={`/order?service=GUIDE&plan=${encodeURIComponent(guide.id)}`} className="mt-2 inline-flex min-h-11 items-center text-sm font-bold underline decoration-orange-500 underline-offset-4">ボーカルガイドだけを依頼する</Link></section>}
        <aside className="mt-8 rounded-2xl bg-slate-50 p-5 text-sm leading-relaxed text-slate-600" aria-labelledby="pricing-conditions">
          <h2 id="pricing-conditions" className="mb-3 font-bold text-slate-900">料金・日数・修正について</h2>
          <p>{DELIVERY_TERMS}</p><p className="mt-3">{REVISION_TERMS}</p>
          <p className="mt-3">トラック数・制作難易度・追加作業等で料金が変わる場合は、事前に内容と金額をご案内し、合意のうえで対応します。</p>
        </aside>
        <div className="mt-8 text-center"><p className="mb-4 text-sm text-slate-600">プランが決まっていなくてもご相談いただけます。</p><Link href="/order?intent=CONSULTATION" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-6 font-bold text-white shadow-lg shadow-orange-500/20">無料で相談・お見積もり<ArrowRight size={18} aria-hidden="true" /></Link></div>
      </div>
    </div>
  );
}
