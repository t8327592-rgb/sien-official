import { prisma } from "@/lib/prisma";
import WorksPageClient from "./WorksPageClient";
import { Metadata } from "next";
import { SITE_INFO } from "@/lib/constants";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "制作実績・ポートフォリオ",
  description: "過去に担当した歌ってみたMIX・マスタリングの制作実績一覧です。総再生数1000万回以上のクオリティをご確認ください。",
};

export default async function WorksPage() {
  const portfolios = await prisma.portfolio.findMany({
    orderBy: { order: 'asc' },
  });

  return <OfficialWorksPageClient portfolios={portfolios} />;
}
