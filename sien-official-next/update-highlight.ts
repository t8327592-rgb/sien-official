import { prisma } from '@/lib/prisma';

async function updateHighlight() {
  await prisma.portfolio.updateMany({
    where: { isHighlight: true },
    data: { isHighlight: false }
  });

  await prisma.portfolio.updateMany({
    where: { title: { contains: "Campus mode" } },
    data: { isHighlight: true }
  });

  console.log("Updated highlight for Campus mode!!");
}

updateHighlight()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
