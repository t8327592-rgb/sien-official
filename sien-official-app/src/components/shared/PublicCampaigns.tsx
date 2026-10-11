import Link from "next/link";
import { getCampaigns, getPlans } from "@/lib/data/cms";
import { campaignIsCurrent } from "@/lib/campaign-pricing";

export async function PublicCampaigns() {
  const [campaigns, plans] = await Promise.all([getCampaigns(), getPlans()]);
  const current = campaigns.filter(campaign => campaignIsCurrent(campaign));
  if (!current.length) return null;
  return <section className="container mx-auto px-4 py-12" aria-labelledby="current-campaigns">
    <h2 id="current-campaigns" className="mb-6 text-2xl font-bold">開催中のキャンペーン</h2>
    <div className="grid gap-6 md:grid-cols-2">{current.map(campaign => {
      const plan = plans.find(item => item.id === campaign.targetPlanId);
      return <article key={campaign.id} className="rounded-2xl border border-orange-200 bg-orange-50 p-6">
        <h3 className="text-xl font-bold">{campaign.name}</h3>
        <p className="mt-3 whitespace-pre-wrap text-slate-700">{campaign.description}</p>
        <p className="mt-3 font-bold">{plan ? `${plan.name}：${campaign.campaignPrice.toLocaleString("ja-JP")}円（税込）` : "対象・適用価格はご相談時にご確認ください。"}</p>
        {campaign.endDate && <p className="mt-2 text-sm">受付期限：{campaign.endDate.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}</p>}
        <Link className="mt-4 inline-block font-bold text-orange-800 underline" href={plan ? `/order?plan=${encodeURIComponent(plan.id)}` : "/order?intent=CONSULTATION"}>{plan ? "このプランを選択する" : "条件を相談する"}</Link>
      </article>;
    })}</div>
  </section>;
}
