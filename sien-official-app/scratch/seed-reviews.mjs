import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const reviews = [
    {
      content: "初めてのMIX依頼で右も左もわからない状態でしたが、丁寧なヒアリングと迅速な対応で安心してお任せできました。完成した音源も期待以上で、自分の声がこんなに綺麗になるのかと感動しました！",
      name: "歌い手 A様",
      serviceType: "ボーカルMIX",
      orderIndex: 1,
    },
    {
      content: "細かなピッチ補正から全体のバランス調整まで、本当に丁寧に仕上げていただきました。特にハモリの馴染ませ方が絶妙で、曲全体のクオリティが一段上がりました。またぜひお願いしたいです。",
      name: "Vtuber B様",
      serviceType: "MIX・マスタリング",
      orderIndex: 2,
    },
    {
      content: "『こんな雰囲気のオリジナル曲が欲しい』というざっくりとした要望を見事に形にしていただきました。細かな修正にも快く応じてくださり、理想の楽曲が完成しました。最高の宝物です！",
      name: "活動者 C様",
      serviceType: "オリジナル楽曲制作",
      orderIndex: 3,
    },
  ];

  for (const review of reviews) {
    await prisma.review.create({
      data: review,
    });
  }
  console.log("Reviews seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
