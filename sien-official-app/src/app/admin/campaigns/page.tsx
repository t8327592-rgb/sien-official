import { requireAdminPage } from "@/lib/admin-page-auth";

import { getCampaigns } from "@/lib/data/cms";
import { CampaignList } from "./CampaignList";

export const dynamic = "force-dynamic";

export default async function AdminCampaignsPage() {
  await requireAdminPage();
  const campaigns = await getCampaigns(false); // 全て取得

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">キャンペーン・セール管理</h1>
        <p className="text-slate-500 mt-2">期間限定のセールやキャンペーン価格情報を管理します。</p>
      </div>

      <CampaignList initialCampaigns={campaigns} />
    </div>
  );
}
