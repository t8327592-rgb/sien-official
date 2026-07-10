import { Campaign } from "../types/config";

export const activeCampaigns: Campaign[] = [
  {
    id: "short-mix-bundle",
    title: "ショートMIX まとめ依頼プラン開始！",
    description: "毎日投稿やシリーズ投稿を応援。\nまとめてのご依頼で、通常より最大30%OFFになります。",
    badge: "NEW",
    isActive: true,
    linkUrl: "/order"
  },
  {
    id: "summer-sale-2025",
    title: "サマーセール2025",
    description: "全プラン10%OFFキャンペーン実施中！",
    badge: "SALE",
    isActive: false, // 現在は非表示
    startDate: "2025-07-01",
    endDate: "2025-08-31",
    linkUrl: "/summer-sale"
  }
];
