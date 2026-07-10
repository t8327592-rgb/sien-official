import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('--- PLANS ---');
  console.log(JSON.stringify(await prisma.plan.findMany(), null, 2));
  console.log('--- OPTIONS ---');
  console.log(JSON.stringify(await prisma.option.findMany(), null, 2));
  console.log('--- PORTFOLIOS ---');
  console.log(JSON.stringify(await prisma.portfolio.findMany(), null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
