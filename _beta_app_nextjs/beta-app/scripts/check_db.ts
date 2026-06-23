import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const profile = await prisma.profile.findFirst();
  console.log("=== Profile ===");
  console.log(profile);

  const portfolios = await prisma.portfolio.findMany();
  console.log("=== Portfolios ===");
  console.log(portfolios);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
