import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.plan.update({
    where: { id: 'cmq9zzs5s0002f6bfiogg2g3m' },
    data: { period: '5日', revisions: '5回' }
  });
  console.log("Updated ショート動画用プラン");
}

main().finally(() => prisma.$disconnect());
