import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log("Updating 'mix' to 'MIX'...");
  const mixResult = await prisma.order.updateMany({
    where: { serviceType: 'mix' },
    data: { serviceType: 'MIX' },
  });
  console.log(`Updated ${mixResult.count} mix orders.`);

  console.log("Updating 'original' to 'ORIGINAL'...");
  const orgResult = await prisma.order.updateMany({
    where: { serviceType: 'original' },
    data: { serviceType: 'ORIGINAL' },
  });
  console.log(`Updated ${orgResult.count} original orders.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
