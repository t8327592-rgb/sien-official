import { prisma } from "@/lib/prisma";
import { OrderListClient } from "@/components/admin/OrderListClient";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">ご依頼管理</h1>
      </div>
      
      <OrderListClient initialOrders={orders} />
    </div>
  );
}
