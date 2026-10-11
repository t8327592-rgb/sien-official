import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const originalOptions = [
    { name: "ボーカルディレクション（オンライン）", priceText: "5,000円", category: "ORIGINAL", orderIndex: 1 },
    { name: "人間による仮歌歌唱", priceText: "5,000円〜10,000円", category: "ORIGINAL", orderIndex: 2 },
    { name: "生楽器演奏追加", priceText: "要相談", category: "ORIGINAL", orderIndex: 3 }
  ];

  for (const opt of originalOptions) {
    const existing = await prisma.option.findFirst({
      where: { name: opt.name }
    });
    if (!existing) {
      await prisma.option.create({
        data: opt
      });
      console.log(`Created: ${opt.name}`);
    } else {
      await prisma.option.update({
        where: { id: existing.id },
        data: { category: "ORIGINAL" }
      });
      console.log(`Updated existing: ${opt.name}`);
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
