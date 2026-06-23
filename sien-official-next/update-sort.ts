import { prisma } from '@/lib/prisma';

async function main() {
  await prisma.portfolio.updateMany({
    where: { title: { contains: "Campus mode" } },
    data: { sortOrder: 0 }
  });
  console.log("Updated sortOrder for Campus mode!!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
