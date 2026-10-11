export {};
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const plans = [
    {
      name: "ショートMIX 3本セット",
      category: "MIX",
      description: "毎日投稿や継続活動を応援。通常より10%お得なプランです。",
      price: 13500,
      period: "要相談 (スケジュールに合わせた分割納品可能)",
      revisions: "各2回まで",
      features: JSON.stringify([
        "ショート動画用MIX 3本セット",
        "1本あたり4,500円 (通常5,000円)",
        "通常価格より1,500円お得 (10%OFF)",
        "シリーズ投稿でも音質を統一"
      ]),
      isActive: true,
      orderIndex: 11
    },
    {
      name: "ショートMIX 5本セット",
      category: "MIX",
      description: "一番人気！継続的な活動に最適なまとめ買いプランです。",
      price: 20000,
      period: "要相談 (スケジュールに合わせた分割納品可能)",
      revisions: "各2回まで",
      features: JSON.stringify([
        "ショート動画用MIX 5本セット",
        "1本あたり4,000円 (通常5,000円)",
        "通常価格より5,000円お得 (20%OFF)",
        "シリーズ投稿でも音質を統一"
      ]),
      isActive: true,
      orderIndex: 12
    },
    {
      name: "ショートMIX 10本セット",
      category: "MIX",
      description: "圧倒的にお得な大容量パック。ガッツリ活動される方に。",
      price: 35000,
      period: "要相談 (スケジュールに合わせた分割納品可能)",
      revisions: "各2回まで",
      features: JSON.stringify([
        "ショート動画用MIX 10本セット",
        "1本あたり3,500円 (通常5,000円)",
        "通常価格より15,000円お得 (30%OFF)",
        "シリーズ投稿でも音質を統一"
      ]),
      isActive: true,
      orderIndex: 13
    }
  ];

  for (const plan of plans) {
    await prisma.plan.create({
      data: plan
    });
    console.log(`Created plan: ${plan.name}`);
  }

  console.log('Finished adding short mix bulk plans.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
