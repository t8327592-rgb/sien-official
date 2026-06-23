const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.portfolio.updateMany({
    where: {
      serviceCategory: 'ボーカルミックス'
    },
    data: {
      serviceCategory: 'MIX'
    }
  });
  console.log(`Unified ${result.count} categories from 'ボーカルミックス' to 'MIX'.`);
}

main().finally(() => prisma.$disconnect());
