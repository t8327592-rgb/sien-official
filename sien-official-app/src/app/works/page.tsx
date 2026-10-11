import { pageMetadata } from "@/lib/page-metadata";
import { Metadata } from "next";
import { getPortfolios } from "@/lib/data/cms";
import WorksClient from "@/components/works/WorksClient";
import { serviceCategory } from "@/lib/service-category";

export const revalidate = 60;

export const metadata: Metadata = pageMetadata("/works", {title: "制作実績 | Sien-Official", description: "これまでに手掛けたMIX・マスタリング、オリジナル楽曲の制作実績をご紹介します。ボカロ、J-POPなど幅広いジャンルに対応。"});

export default async function WorksPage() {
  const allPortfolios = await getPortfolios();
  const mixPortfolios = allPortfolios.filter(p => serviceCategory(p.serviceCategory) === "MIX");
  const originalPortfolios = allPortfolios.filter(p => serviceCategory(p.serviceCategory) === "ORIGINAL");

  return (
    <div className="container mx-auto py-10 md:py-20 px-4">
      <h1 className="text-4xl font-bold mb-8 text-center text-slate-800">制作実績</h1>
      <p className="text-center text-slate-500 mb-6 md:mb-12 max-w-2xl mx-auto">
        これまでに手掛けたMIX・マスタリング、オリジナル楽曲の制作実績をご紹介いたします。
      </p>

      <WorksClient
        mixPortfolios={mixPortfolios}
        originalPortfolios={originalPortfolios}
      />
    </div>
  );
}
