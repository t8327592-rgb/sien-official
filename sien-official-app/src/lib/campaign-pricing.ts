type CampaignPrice = { id: string; name: string; targetPlanId: string | null; campaignPrice: number; isActive: boolean; startDate: Date | null; endDate: Date | null };
export function campaignIsCurrent(campaign: Pick<CampaignPrice, "isActive" | "startDate" | "endDate">, now = new Date()) {
  return campaign.isActive && (!campaign.startDate || campaign.startDate <= now) && (!campaign.endDate || campaign.endDate >= now);
}
export function currentPlanCampaign(planId: string, campaigns: CampaignPrice[], now = new Date()): CampaignPrice | undefined {
  return campaigns.filter(campaign => campaign.targetPlanId === planId && campaign.campaignPrice >= 0 && campaignIsCurrent(campaign, now))
    .sort((a, b) => a.campaignPrice - b.campaignPrice || a.id.localeCompare(b.id))[0];
}

export function campaignDisplayStatus(campaign: Pick<CampaignPrice, "isActive" | "startDate" | "endDate" | "targetPlanId">, now = new Date()) {
  if (!campaign.isActive) return "停止中";
  if (campaign.endDate && new Date(campaign.endDate) < now) return "終了";
  if (campaign.startDate && new Date(campaign.startDate) > now) return "開始前";
  if (!campaign.targetPlanId) return "対象プラン未設定";
  return "開催中";
}
