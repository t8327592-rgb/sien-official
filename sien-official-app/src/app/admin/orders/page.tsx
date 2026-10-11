import { requireAdminPage } from "@/lib/admin-page-auth";
import { prisma } from "@/lib/prisma";
import { OrderListClient } from "@/components/admin/OrderListClient";
import { parseOrderFilters, todayInJapan } from "@/lib/admin-order-filters";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdminPage();
  const params = await searchParams;
  const archived = params.archive === "1";
  const filters = parseOrderFilters(params);
  const orders = await prisma.order.findMany({
    where: { isArchived: archived },
    orderBy: { createdAt: "desc" },
  });

  const plans = await prisma.plan.findMany();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">ご依頼管理</h1>
      </div>

      <OrderListClient key={JSON.stringify([archived, filters])} initialOrders={orders} plans={plans} archived={archived} initialFilters={filters} today={todayInJapan()} />
    </div>
  );
}
