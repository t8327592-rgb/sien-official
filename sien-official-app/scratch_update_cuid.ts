import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("--- Update cuid planIds to Japanese names ---");
  
  const allOrders = await prisma.order.findMany();
  const allPlans = await prisma.plan.findMany();
  
  let updatedCount = 0;
  for (const order of allOrders) {
    if (order.planId && order.planId.startsWith('cmq')) {
      const plan = allPlans.find(p => p.id === order.planId);
      if (plan) {
        await prisma.order.update({
          where: { id: order.id },
          data: { planId: plan.name }
        });
        console.log(`Updated Order ID ${order.id} ("${order.songTitle}") from cuid to ${plan.name}`);
        updatedCount++;
      } else {
        console.log(`Order ID ${order.id} has unknown planId: ${order.planId}`);
      }
    }
  }
  console.log(`Finished updating ${updatedCount} orders with cuid planIds.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
