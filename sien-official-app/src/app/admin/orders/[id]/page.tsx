import { requireAdminPage } from "@/lib/admin-page-auth";
import { OrderDetailEditor } from "@/components/admin/OrderDetailEditor";
import { OrderFinanceEditor } from "@/components/admin/OrderFinanceEditor";
import { BusinessOrderDetails } from "@/components/admin/BusinessOrderDetails";
import { loadOrderSales } from "@/lib/admin-order-sales";
import { fixedRevenueOptions } from "@/lib/order-revenue";

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
    include: { businessContact: true, payments: { orderBy: { createdAt: "desc" } } },
  });

  if (!order) {
    notFound();
  }

  const [sales, options] = await Promise.all([
    loadOrderSales([id]),
    prisma.option.findMany({ where: { isActive: true, category: { in: [order.serviceType, "COMMON"] } }, orderBy: [{ orderIndex: "asc" }, { id: "asc" }], select: { id: true, name: true, priceText: true } }),
  ]);

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
          <div><h2 className="font-bold text-slate-800">クライアント向け見積書</h2><p className="mt-1 text-sm text-slate-500">料金を編集してPDFを作成できます。保存しても確定売上・入金には反映されません。</p></div>
          <div className="flex flex-wrap gap-3"><Link href={`/admin/estimates/new?orders=${id}`} className="rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-bold text-white">見積書を作成</Link><Link href={`/admin/estimates?order=${id}`} className="rounded-lg border px-4 py-2.5 text-sm">この依頼の見積書</Link></div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-5">
          <div><h2 className="font-bold text-slate-800">フィードバック用メモ</h2><p className="text-sm text-slate-500 mt-1">名前・楽曲名を引き継いでメモをまとめ、Codexに渡せます。</p></div>
          <Link href={`/admin/orders/${id}/feedback`} className="rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-orange-700">メモを入力・コピー</Link>
        </div>
        {order.businessContact && <BusinessOrderDetails key={`business-${order.businessContact.updatedAt.toISOString()}`} orderId={order.id} companyName={order.companyName} contact={order.businessContact} />}
        <OrderDetailEditor key={`detail-${order.id}`} initialOrder={order} sale={sales[id]} />
        <OrderFinanceEditor key={JSON.stringify([order.id, order.status, order.price, order.options, order.serviceType])} initialOrder={order} availableOptions={fixedRevenueOptions(order, options)} />
      </div>

    </div>
  );
}
