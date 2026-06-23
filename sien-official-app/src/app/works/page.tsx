import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import WorksClient from "@/components/works/WorksClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "制作実績 | Sien-Official",
  description: "これまでに手掛けたMIX・マスタリング、オリジナル楽曲の制作実績をご紹介します。ボカロ、J-POPなど幅広いジャンルに対応。",
};

export default async function WorksPage() {
  const portfolios = await prisma.portfolio.findMany({
    orderBy: { orderIndex: 'asc' }
  });

  return (
    <div className="container mx-auto py-20 px-4 mt-20">
      <h1 className="text-4xl font-bold mb-8 text-center text-slate-800">制作実績</h1>
      <p className="text-center text-slate-500 mb-12 max-w-2xl mx-auto">
        これまでに手掛けたMIX・マスタリング等の制作実績をご紹介いたします。
      </p>
      
      <WorksClient 
        mixPortfolios={portfolios} 
        originalPortfolios={[
          {
            id: "orig-1",
            title: "【誕生日MV】ハッピーエンドクリエイター！ - 草刈七海【オリジナル曲】",
            url: "https://www.youtube.com/watch?v=zTxvMNXaFoA",
            serviceCategory: "オリジナル楽曲制作",
            tags: "",
            isFeatured: true
          },
          {
            id: "orig-2",
            title: "【ボカデュオ2024】夜明けのアステロイド / YOFUKASHI 【オリジナル】",
            url: "https://www.youtube.com/watch?v=Rc531IszCes",
            serviceCategory: "オリジナル楽曲制作",
            tags: "",
            isFeatured: false
          },
          {
            id: "orig-3",
            title: "週末を待て。『SODA』Music Video",
            url: "https://www.youtube.com/watch?v=Ke1HAX8Z49I",
            serviceCategory: "オリジナル楽曲制作",
            tags: "",
            isFeatured: false
          }
        ]} 
      />
    </div>
  );
}
