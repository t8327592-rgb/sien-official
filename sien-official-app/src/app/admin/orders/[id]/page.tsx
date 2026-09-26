import { OrderDetailEditor } from "@/components/admin/OrderDetailEditor";

export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AiReplyPanel } from "@/components/admin/AiReplyPanel";
import { AiPostGeneratorPanel } from "@/components/admin/AiPostGeneratorPanel";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 依頼データを取得
  const order = await prisma.order.findUnique({
    where: { id },
  });

  if (!order) {
    notFound();
  }

  // プラン情報を取得
  let planDetails = null;
  if (order.planId) {
    planDetails = await prisma.plan.findFirst({
      where: { category: order.serviceType, OR: [{ id: order.planId }, { name: order.planId }] }
    });
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/orders" className="text-slate-500 hover:text-slate-900 transition-colors font-bold text-sm bg-white border px-4 py-2 rounded-full shadow-sm hover:shadow">
          ← 戻る
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-800">依頼詳細</h1>
      </div>

      <div className="space-y-6">
        <OrderDetailEditor initialOrder={order} planDetails={planDetails} />
      </div>

      <div className="space-y-6 mt-12 pt-12 border-t border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <span className="text-blue-500">🤖</span> AI アシスト
        </h2>
        <AiReplyPanel order={order} />
        <AiPostGeneratorPanel order={order} />
      </div>
    </div>
  );
}
