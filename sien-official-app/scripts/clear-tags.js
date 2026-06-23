const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.portfolio.updateMany({
    data: { tags: null }
  });
  console.log(`Cleared tags for ${result.count} portfolios.`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
