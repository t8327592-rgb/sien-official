import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const portfolios = await prisma.portfolio.findMany();
  console.log(JSON.stringify(portfolios, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
