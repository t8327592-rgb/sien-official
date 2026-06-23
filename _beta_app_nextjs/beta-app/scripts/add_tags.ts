import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const targetPortfolios = await prisma.portfolio.findMany({
    where: {
      OR: [
        { title: { contains: 'Original' } },
        { title: { contains: 'オリジナル' } }
      ]
    }
  });

  for (const port of targetPortfolios) {
    await prisma.portfolio.update({
      where: { id: port.id },
      data: { tags: 'オリジナル' }
    });
    console.log(`Updated tag for: ${port.title}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
