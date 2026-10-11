import { pageMetadata } from "@/lib/page-metadata";
import Link from "next/link";
import { PublicCampaigns } from "@/components/shared/PublicCampaigns";
export const metadata = pageMetadata("/summer-sale", {title: "サマーMIXセール2026・受付終了 | Sien-Official", description: "2026年7月8日から7月17日まで実施したサマーMIXセールは終了しました。現在の料金と受付状況をご案内します。"});
export default function SummerSalePage() {
  return <div><section className="mx-auto max-w-3xl px-4 py-20"><p className="mb-4 font-bold text-slate-700">過去のキャンペーン</p><h1 className="mb-6 text-3xl font-bold">サマーMIXセール2026は終了しました</h1><p className="mb-4">受付期間：2026年7月8日（水）18:00〜7月17日（金）23:59（日本時間）</p><p className="mb-8">当時のセール価格での新規受付は終了しています。現在の料金・初稿提出目安は料金ページ、受付状況は依頼フォームをご確認ください。</p><div className="flex flex-wrap gap-4"><Link href="/mix#plans" className="rounded-full bg-orange-600 px-6 py-3 font-bold text-slate-900">現在のMIX料金を見る</Link><Link href="/order?intent=CONSULTATION&service=MIX" className="rounded-full border border-orange-700 px-6 py-3 font-bold text-orange-800">無料で相談する</Link></div></section><PublicCampaigns /></div>;
}
