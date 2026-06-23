import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const plans = [
  {
    name: "スタンダードプラン",
    price: 10000,
    description: "「歌ってみた」のMIXはこちら。ピッチ補正、タイミング補正、コーラス生成、マスタリングまで、すべての作業を行います。",
  },
  {
    name: "ワンコーラスプラン",
    price: 8000,
    description: "目安：〜1分30秒（例：Aメロ〜サビ）。ワンコーラス分の「歌ってみた」のMIXプランです。",
  },
  {
    name: "ショート動画用プラン",
    price: 5000,
    description: "目安：〜30秒（サビのみ）。「YouTube Shorts」など短尺動画向けのプランです。",
  },
  {
    name: "短納期プラン",
    price: 14000,
    description: "通常より優先して制作を行い、3日以内に納品いたします。",
  },
  {
    name: "最短納期プラン",
    price: 18000,
    description: "最優先で制作を行い、1日以内に納品いたします。特にお急ぎの方向けです。",
  },
  {
    name: "コラボ・合唱プラン",
    price: 16000,
    description: "2名様分のMIX料金。大人数の場合や複雑なトラック構成の場合は事前にご相談ください。",
  }
];

async function main() {
  console.log('Starting plans seed...');
  
  // 既存のプランをクリア
  await prisma.plan.deleteMany({});
  console.log('Cleared existing plans.');

  for (const p of plans) {
    await prisma.plan.create({
      data: p
    });
    console.log(`Created plan: ${p.name}`);
  }

  console.log('\nPlans seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
