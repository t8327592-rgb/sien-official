import { pageMetadata } from "@/lib/page-metadata";
import { priceFromText } from "@/lib/order-pricing";
import { ConsultationForm } from "@/components/order/ConsultationForm";
import { getPlans, getOptions } from "@/lib/data/cms";
import OrderFormClient from "@/components/order/OrderFormClient";
import { getSiteSetting } from "@/lib/data/site-setting";
import { resolveOrderSelection, type OrderPlan } from "@/lib/order-selection";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata("/order", {title: "ご依頼フォーム | Sien-Official", description: "ボーカルMIX・マスタリング、オリジナル楽曲制作のご依頼・お見積りはこちらから。リアルタイムでお見積り概算が確認できます。"});

metadata.robots = { index: false, follow: false };

export default async function OrderPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  if (query.intent === "CONSULTATION") return <ConsultationForm service={typeof query.service === "string" ? query.service : undefined} />;
  const siteSetting = await getSiteSetting();

  if (siteSetting.orderStatus === "UNAVAILABLE") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm max-w-lg w-full">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-4">現在、新規受付を停止しております</h1>
          <p className="text-slate-600 mb-6 leading-relaxed">
            {siteSetting.announcement || "誠に恐れ入りますが、現在満枠のため新規のご依頼受付を一時停止しております。受付再開まで今しばらくお待ちくださいませ。"}
          </p>
          <Link href="/" className="inline-block bg-slate-800 text-white font-bold py-3 px-8 rounded-full hover:bg-slate-700 transition-colors mb-8">
            トップページへ戻る
          </Link>

          <div className="border-t border-slate-100 pt-6 mt-2">
            <p className="text-slate-600 text-sm font-medium mb-3">法人のお客様、企業・団体様からの案件等のご相談はこちら</p>
            <Link href="/business#contact-form" className="inline-flex items-center justify-center gap-2 text-orange-700 font-bold text-sm hover:text-orange-700 hover:underline">
              法人向け お問い合わせ・ご相談フォームへ
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
        </div>
      </div>
    );
  }



  const rawPlans = await getPlans();
  const rawOptions = await getOptions();

  const plans: (OrderPlan & { hasConsultation: boolean })[] = rawPlans.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price ?? null,
    hasConsultation: p.price === null
  }));

  const guide = rawOptions.find(option => option.category === "MIX" && option.name.includes("ボーカルガイド"));
  if (guide) plans.push({ id: guide.id, name: "ボーカルガイド作成（単独）", category: "GUIDE", price: priceFromText(guide.priceText), hasConsultation: /[〜～~]|要相談/.test(guide.priceText) });
  const options = rawOptions.map(o => ({
    id: o.id,
    name: o.name,
    category: o.category,
    priceText: o.priceText
  }));

  const selection = resolveOrderSelection(plans, typeof query.plan === "string" ? query.plan : undefined, typeof query.service === "string" ? query.service : undefined);
  return <OrderFormClient key={`${selection.serviceType}:${selection.planId}`} initialPlans={plans} initialOptions={options} siteSetting={siteSetting} initialSelection={selection} />;
}
