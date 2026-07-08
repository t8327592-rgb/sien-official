import { prisma } from "@/lib/prisma";
import SummerSaleOrderFormClient from "@/components/order/SummerSaleOrderFormClient";

export const metadata = {
  title: "サマーセール専用 ご依頼フォーム | Sien-Official",
  description: "期間限定サマーセールの専用ご依頼フォームです。",
};

export default async function SummerSaleOrderPage() {
  // オプション情報をDBから取得
  const options = await prisma.option.findMany({
    orderBy: { createdAt: "asc" }
  });

  return (
    <main>
      <SummerSaleOrderFormClient initialOptions={options} />
    </main>
  );
}
