import { Metadata } from "next";

export const metadata: Metadata = {
  title: "お問い合わせ・お見積り",
  description: "歌ってみたMIX・オリジナル楽曲のご相談、無料お見積りはこちらから。24時間以内にご返信いたします。",
};

export default function OrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
