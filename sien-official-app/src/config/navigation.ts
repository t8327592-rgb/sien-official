import { NavigationItem } from "../types/config";

export const headerNavigation: NavigationItem[] = [
  { label: "プロフィール", href: "/profile" },
  { label: "ミックス/マスタリング", href: "/mix" },
  { label: "オリジナル楽曲", href: "/original" },
  { label: "制作実績", href: "/works" },
  { label: "ブログ", href: "/blog" },
];

export const footerNavigation = {
  contents: [
    { label: "ミックス・マスタリング", href: "/mix" },
    { label: "オリジナル楽曲制作", href: "/original" },
    { label: "制作実績", href: "/works" },
    { label: "ブログ", href: "/blog" },
  ],
  support: [
    { label: "ご依頼フォーム", href: "/order" },
    { label: "法人・企業様お問い合わせ", href: "/business" },
    { label: "よくある質問（FAQ）", href: "/faq" },
  ],
  legal: [
    { label: "ご依頼に関する留意事項", href: "/policy/guidelines" },
    { label: "プライバシーポリシー", href: "/policy/privacy" },
    { label: "特定商取引法に基づく表記", href: "/policy/law" },
  ]
};

export const mobileNavigation: NavigationItem[] = [
  { label: "ミックス・マスタリング", href: "/mix" },
  { label: "オリジナル楽曲制作", href: "/original" },
  { label: "制作実績", href: "/works" },
  { label: "ブログ", href: "/blog" },
  { label: "よくある質問", href: "/faq" },
];
