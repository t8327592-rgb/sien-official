import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const orders = await prisma.order.findMany({
    select: { id: true, serviceType: true }
  });
  
  let mixCount = 0;
  let MIXCount = 0;
  let originalCount = 0;
  let ORIGINALCount = 0;
  let otherCount = 0;

  for (const o of orders) {
    if (o.serviceType === 'mix') mixCount++;
    else if (o.serviceType === 'MIX') MIXCount++;
    else if (o.serviceType === 'original') originalCount++;
    else if (o.serviceType === 'ORIGINAL') ORIGINALCount++;
    else otherCount++;
  }

  console.log(`mix: ${mixCount}`);
  console.log(`MIX: ${MIXCount}`);
  console.log(`original: ${originalCount}`);
  console.log(`ORIGINAL: ${ORIGINALCount}`);
  console.log(`Other: ${otherCount}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
