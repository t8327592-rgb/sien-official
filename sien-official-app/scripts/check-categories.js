const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const items = await prisma.portfolio.groupBy({
    by: ['serviceCategory'],
    _count: { id: true }
  });
  console.log(items);
}

main().finally(() => prisma.$disconnect());
