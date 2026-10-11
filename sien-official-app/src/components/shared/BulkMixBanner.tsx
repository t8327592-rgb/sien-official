import Link from "next/link";
import type { Plan } from "@prisma/client";
import { ArrowRight } from "lucide-react";
import { formatYen } from "@/lib/public-format";
import { PriceAmount } from "@/components/ui/PriceAmount";

export function BulkMixBanner({ plans }: { plans: Plan[] }) {
  const bundles = plans.filter(plan => plan.name.includes("本セット"));
  const featured = bundles.find(plan => plan.name.includes("5本セット")) || bundles[0];
  if (!featured) return null;

  return (
    <aside className="mx-auto mb-10 rounded-3xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-5 shadow-sm md:mb-12 md:p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-8">
        <div className="min-w-0">
          <span className="mb-4 inline-flex rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-3 py-1 text-xs font-black tracking-wider text-white shadow-sm">まとめ依頼</span>
          <h3 className="mb-3 text-xl font-extrabold leading-relaxed text-slate-900 md:text-2xl">ショートMIX <span className="text-orange-600">まとめ依頼プラン</span></h3>
          <p className="text-sm font-medium leading-relaxed text-slate-600 md:text-base">毎日投稿やシリーズ投稿に。作品数・制作内容・初稿提出目安は各プランをご確認ください。</p>
          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {bundles.filter(plan => plan.id !== featured.id).map(plan => (
              <li key={plan.id}><Link href={`/order?service=MIX&plan=${encodeURIComponent(plan.id)}`} className="inline-flex min-h-11 items-center font-bold text-orange-700 underline underline-offset-4">{plan.name}：{formatYen(plan.price)}</Link></li>
            ))}
          </ul>
        </div>
        <Link href={`/order?service=MIX&plan=${encodeURIComponent(featured.id)}`} className="group flex shrink-0 flex-col items-center rounded-2xl border border-orange-100 bg-white p-5 text-center shadow-sm transition-shadow hover:shadow-md md:w-56">
          <span className="mb-2 text-sm font-bold text-slate-500">{featured.name}</span>
          <span className="text-2xl font-black text-slate-900 md:text-3xl"><PriceAmount value={featured.price} /></span>
          <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-sm font-bold text-orange-700">このプランで依頼 <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
        </Link>
      </div>
    </aside>
  );
}
