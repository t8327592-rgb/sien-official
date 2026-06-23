import { prisma } from '@/lib/prisma';
import OrdersAdminClient from '@/components/admin/OrdersAdminClient';
import { updateOrderStatus } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">ご依頼管理</h1>
      </div>

      <OrdersAdminClient 
        orders={orders as any} 
        updateStatusAction={updateOrderStatus} 
      />
    </div>
  );
}
