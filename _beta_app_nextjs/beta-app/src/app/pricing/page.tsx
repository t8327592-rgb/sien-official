import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import OfficialPricingPageClient from "./PricingPageClient";
import { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "料金プラン・制作の流れ",
  description: "歌ってみたMIXの料金プラン、ご依頼から納品までの流れ、よくあるご質問（FAQ）をまとめています。ご予算に合わせたプランをご提案可能です。",
};

export default async function PricingPage() {
  const plans = await prisma.plan.findMany({
    orderBy: { order: 'asc' },
  });

  return (
    <Suspense fallback={<div className="p-24 text-center">Loading...</div>}>
      <OfficialPricingPageClient plans={plans} />
    </Suspense>
  );
}
