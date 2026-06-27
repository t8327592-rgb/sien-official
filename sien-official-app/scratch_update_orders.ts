import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("--- 1. Specific Orders Update ---");
  const specificOrders = await prisma.order.findMany({
    where: {
      songTitle: {
        in: ['ないない', 'Magnet']
      }
    }
  });

  for (const order of specificOrders) {
    if ((order.songTitle === 'ないない' && order.clientName === '音和のま') ||
        (order.songTitle === 'Magnet' && order.clientName === '雨風ヤム')) {
      await prisma.order.update({
        where: { id: order.id },
        data: { planId: 'コラボ・合唱プラン' }
      });
      console.log(`Updated Order ${order.songTitle} to planId: コラボ・合唱プラン`);
    }
  }

  console.log("--- 2. Update all internal values to Japanese names ---");
  const planMappings: Record<string, string> = {
    'std': 'スタンダードプラン',
    'chorus': 'ワンコーラスプラン',
    'short': 'ショート動画用プラン',
    'speed': '短納期プラン',
    'superspeed': '最短納期プラン',
    'collab': 'コラボ・合唱プラン',
    'other': 'その他'
  };

  const allOrders = await prisma.order.findMany();
  let updatedCount = 0;
  for (const order of allOrders) {
    if (order.planId && planMappings[order.planId]) {
      await prisma.order.update({
        where: { id: order.id },
        data: { planId: planMappings[order.planId] }
      });
      console.log(`Updated Order ID ${order.id} from ${order.planId} to ${planMappings[order.planId]}`);
      updatedCount++;
    }
  }
  console.log(`Finished updating ${updatedCount} orders.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
