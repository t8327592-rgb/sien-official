import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  console.log("Top 5 recent orders:");
  for (const o of orders) {
    console.log(`- ${o.name} (${o.email}) - ${o.status}`);
    console.log(`  Message: ${o.message.substring(0, 100)}...`);
  }
  
  const total = await prisma.order.count();
  console.log(`Total orders in DB: ${total}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
