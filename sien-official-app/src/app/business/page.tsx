import { Metadata } from "next";
import BusinessPageClient from "@/components/business/BusinessPageClient";

export const metadata: Metadata = {
  title: "法人・企業様お問い合わせ | Sien-Official",
  description: "法人様・企業様向けのお問い合わせページです。ゲーム・アプリの公式楽曲制作、PR用音源、大規模なMIX・マスタリングのご相談を承ります。",
};

export default function BusinessContactPage() {
  return <BusinessPageClient />;
}
