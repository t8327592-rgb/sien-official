import CreatorHeroSection from "@/components/creator/CreatorHeroSection";
import CreatorWorksSection from "@/components/creator/CreatorWorksSection";
import CreatorReasonsSection from "@/components/creator/CreatorReasonsSection";
import CreatorAudioCompareSection from "@/components/creator/CreatorAudioCompareSection";
import CreatorTestimonialSection from "@/components/creator/CreatorTestimonialSection";
import CreatorProfileSection from "@/components/creator/CreatorProfileSection";
import CreatorFAQSection from "@/components/creator/CreatorFAQSection";
import CreatorPricingSection from "@/components/creator/CreatorPricingSection";
import CreatorContactSection from "@/components/creator/CreatorContactSection";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "しえん / tonitune | 歌ってみた専門MIX・マスタリング",
  description: "実績800件以上。歌い手・VTuber特化のプロフェッショナルMIX。あなたの個性を殺さず、作品として最高の一曲に仕上げます。",
};

export default async function OfficialHome() {
  const portfolios = await prisma.portfolio.findMany({
    orderBy: { order: 'asc' },
  });

  const plans = await prisma.plan.findMany({
    orderBy: { order: 'asc' },
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#0f1013] font-sans selection:bg-[#f59e0b]/30">
      <CreatorHeroSection />
      <CreatorWorksSection works={portfolios} />
      <CreatorReasonsSection />
      <CreatorAudioCompareSection />
      <CreatorTestimonialSection />
      <CreatorProfileSection />
      <CreatorPricingSection plans={plans} />
      <CreatorFAQSection />
      <CreatorContactSection />
    </div>
  );
}
