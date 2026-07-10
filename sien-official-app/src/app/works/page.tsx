import { Metadata } from "next";
import { getPortfolios } from "@/lib/data/cms";
import WorksClient from "@/components/works/WorksClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "制作実績 | Sien-Official",
  description: "これまでに手掛けたMIX・マスタリング、オリジナル楽曲の制作実績をご紹介します。ボカロ、J-POPなど幅広いジャンルに対応。",
};

export default async function WorksPage() {
  const allPortfolios = await getPortfolios();
  const mixPortfolios = allPortfolios.filter(p => p.serviceCategory !== "オリジナル楽曲制作");
  const originalPortfolios = allPortfolios.filter(p => p.serviceCategory === "オリジナル楽曲制作");

  return (
    <div className="container mx-auto py-20 px-4 mt-20">
      <h1 className="text-4xl font-bold mb-8 text-center text-slate-800">制作実績</h1>
      <p className="text-center text-slate-500 mb-12 max-w-2xl mx-auto">
        これまでに手掛けたMIX・マスタリング等の制作実績をご紹介いたします。
      </p>
      
      <WorksClient 
        mixPortfolios={mixPortfolios} 
        originalPortfolios={originalPortfolios} 
      />
    </div>
  );
}
