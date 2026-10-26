import { requireAdminPage } from "@/lib/admin-page-auth";
import { OrderDetailEditor } from "@/components/admin/OrderDetailEditor";

export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
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
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-5">
          <div><h2 className="font-bold text-slate-800">録音・歌唱フィードバック</h2><p className="text-sm text-slate-500 mt-1">依頼情報を引き継いで評価・コメントを入力し、PDFを作成できます。</p></div>
          <Link href={`/admin/orders/${id}/feedback`} className="rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-700">フィードバックを作成・編集</Link>
        </div>
        <OrderDetailEditor initialOrder={order} planDetails={planDetails} />
      </div>

    </div>
  );
}
