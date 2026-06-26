import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'asc' },
  });

  console.log(`Found ${orders.length} orders. Recalculating isRepeater...`);

  let updatedCount = 0;

  for (const order of orders) {
    const isRepeater = await prisma.order.findFirst({
      where: {
        id: { not: order.id },
        createdAt: { lt: order.createdAt },
        OR: [
          { clientEmail: order.clientEmail },
          { 
            AND: [
              { twitterId: { not: "" } },
              { twitterId: { not: null } },
              { twitterId: order.twitterId }
            ]
          },
          { clientName: order.clientName },
        ]
      }
    }).then(res => res !== null);

    if (order.isRepeater !== isRepeater) {
      await prisma.order.update({
        where: { id: order.id },
        data: { isRepeater }
      });
      updatedCount++;
      console.log(`Updated order ${order.id} (${order.clientName}) to isRepeater: ${isRepeater}`);
    }
  }

  console.log(`Finished. Updated ${updatedCount} orders.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
