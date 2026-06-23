import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const origPlans = [
    {
      name: "完パケプラン",
      category: "ORIGINAL",
      description: "ヒアリング、デモ作成、編曲、MIX、マスタリングまで、全ての工程を含んだ制作プランです。",
      price: 66000,
      period: "45日〜",
      revisions: "無制限",
      isActive: true,
    },
    {
      name: "作詞持ち込みプラン",
      category: "ORIGINAL",
      description: "歌詞はご自身で用意いただき、メロディと伴奏（編曲）を制作するプランです。",
      price: 55000,
      period: "45日〜",
      revisions: "無制限",
      isActive: true,
    }
  ];

  for (const plan of origPlans) {
    await prisma.plan.create({ data: plan });
  }
  console.log("Original plans seeded.");
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
