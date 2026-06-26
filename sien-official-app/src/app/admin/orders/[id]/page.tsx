import { OrderDetailEditor } from "@/components/admin/OrderDetailEditor";

export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AiReplyPanel } from "@/components/admin/AiReplyPanel";
import { AiPostGeneratorPanel } from "@/components/admin/AiPostGeneratorPanel";
import { OrderActions } from "@/components/admin/OrderActions";

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
      where: { id: order.planId }
    });
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders" className="text-muted-foreground hover:text-primary">
            ← 戻る
          </Link>
          <h1 className="text-3xl font-bold">依頼詳細</h1>
        </div>
        <div className="flex items-center gap-2">
          <OrderActions orderId={order.id} currentStatus={order.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左側: 依頼内容の表示と編集 */}
        <div className="lg:col-span-2 space-y-6">
          <OrderDetailEditor initialOrder={order} planDetails={planDetails} />
        </div>

        {/* 右側: 管理・AIアシストパネル */}
        <div className="space-y-6">
          <AiReplyPanel order={order} />
          <AiPostGeneratorPanel order={order} />
        </div>
      </div>
    </div>
  );
}
