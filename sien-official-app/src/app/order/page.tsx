import { prisma } from "@/lib/prisma";
import OrderFormClient from "@/components/order/OrderFormClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ご依頼フォーム | Sien-Official",
  description: "ボーカルMIX・マスタリング、オリジナル楽曲制作のご依頼・お見積りはこちらから。リアルタイムでお見積り概算が確認できます。",
};

export default async function OrderPage() {
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      category: true,
      price: true,
    },
    orderBy: { createdAt: "asc" }
  });

  const options = await prisma.option.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      category: true,
      priceText: true,
    },
    orderBy: { createdAt: "asc" }
  });

  return <OrderFormClient initialPlans={plans} initialOptions={options} />;
}
