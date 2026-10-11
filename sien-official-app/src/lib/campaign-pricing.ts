type CampaignPrice = { id: string; name: string; targetPlanId: string | null; campaignPrice: number; isActive: boolean; startDate: Date | null; endDate: Date | null };
export function campaignIsCurrent(campaign: Pick<CampaignPrice, "isActive" | "startDate" | "endDate">, now = new Date()) {
  return campaign.isActive && (!campaign.startDate || campaign.startDate <= now) && (!campaign.endDate || campaign.endDate >= now);
}
export function currentPlanCampaign(planId: string, campaigns: CampaignPrice[], now = new Date()): CampaignPrice | undefined {
  return campaigns.filter(campaign => campaign.targetPlanId === planId && campaign.campaignPrice >= 0 && campaignIsCurrent(campaign, now))
    .sort((a, b) => a.campaignPrice - b.campaignPrice || a.id.localeCompare(b.id))[0];
}
