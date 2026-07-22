import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisYearStart = new Date(now.getFullYear(), 0, 1);
  
  const ordersThisMonth = await prisma.order.findMany({
    where: { createdAt: { gte: thisMonthStart } },
    select: { id: true, clientName: true, status: true, price: true, createdAt: true, deliveredAt: true }
  });
  console.log('--- All Orders Created This Month ---');
  console.table(ordersThisMonth);

  const completedOrdersCreatedThisYear = await prisma.order.findMany({
    where: { status: 'COMPLETED', createdAt: { gte: thisYearStart } },
    select: { id: true, clientName: true, status: true, price: true, createdAt: true, deliveredAt: true }
  });
  
  const createdThisMonthRevenue = completedOrdersCreatedThisYear
    .filter(o => o.createdAt >= thisMonthStart)
    .reduce((sum, order) => sum + (order.price || 0), 0);
    
  console.log('\n--- Calculated createdThisMonthRevenue (受注ベース) ---');
  console.log(createdThisMonthRevenue);
  
  const realCreatedThisMonthRevenue = ordersThisMonth
    .filter(o => o.status !== 'CANCELLED')
    .reduce((sum, order) => sum + (order.price || 0), 0);
  console.log('\n--- Real Order Base Revenue (Not cancelled) ---');
  console.log(realCreatedThisMonthRevenue);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
