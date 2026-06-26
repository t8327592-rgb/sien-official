const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const originals = [
    {
      title: "【誕生日MV】ハッピーエンドクリエイター！ - 草刈七海【オリジナル曲】",
      url: "https://www.youtube.com/watch?v=zTxvMNXaFoA",
      serviceCategory: "オリジナル楽曲制作",
      isFeatured: true,
      isPublished: true,
      orderIndex: 1,
    },
    {
      title: "【ボカデュオ2024】夜明けのアステロイド / YOFUKASHI 【オリジナル】",
      url: "https://www.youtube.com/watch?v=Rc531IszCes",
      serviceCategory: "オリジナル楽曲制作",
      isFeatured: true,
      isPublished: true,
      orderIndex: 2,
    },
    {
      title: "週末を待て。『SODA』Music Video",
      url: "https://www.youtube.com/watch?v=Ke1HAX8Z49I",
      serviceCategory: "オリジナル楽曲制作",
      isFeatured: true,
      isPublished: true,
      orderIndex: 3,
    },
  ];

  for (const item of originals) {
    await prisma.portfolio.create({
      data: item,
    });
  }
  console.log("Original portfolios seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
