import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("--- 1. Orders Update ---");
  const targetOrders = await prisma.order.findMany({
    where: {
      songTitle: {
        in: ['ないない', 'Magnet']
      }
    }
  });

  for (const order of targetOrders) {
    if ((order.songTitle === 'ないない' && order.clientName === '音和のま') ||
        (order.songTitle === 'Magnet' && order.clientName === '雨風ヤム')) {
      const updated = await prisma.order.update({
        where: { id: order.id },
        data: { planId: 'collab' }
      });
      console.log(`Updated Order ${order.songTitle} to planId: collab`);
    }
  }

  console.log("--- 2. Plans check & update ---");
  const plans = await prisma.plan.findMany();
  console.log("Current Plans:", plans);

  // マッピング
  const planMappings: Record<string, string> = {
    'std': 'スタンダードプラン',
    'chorus': 'ワンコーラスプラン',
    'short': 'ショート動画用プラン',
    'speed': '短納期プラン',
    'superspeed': '最短納期プラン',
    'collab': 'コラボ・合唱プラン',
    'other': 'その他'
  };

  for (const plan of plans) {
    if (planMappings[plan.id]) {
      const updatedPlan = await prisma.plan.update({
        where: { id: plan.id },
        data: { name: planMappings[plan.id] }
      });
      console.log(`Updated Plan ${plan.id} to name: ${planMappings[plan.id]}`);
    } else if (planMappings[plan.name]) {
       // もし name に std 等が入っている場合
       const updatedPlan = await prisma.plan.update({
        where: { id: plan.id },
        data: { name: planMappings[plan.name] }
      });
      console.log(`Updated Plan ${plan.id} from ${plan.name} to name: ${planMappings[plan.name]}`);
    }
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
