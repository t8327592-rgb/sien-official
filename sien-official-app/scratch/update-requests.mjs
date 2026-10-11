import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import fs from 'fs';

async function main() {
  console.log("1. Updating categories...");
  await prisma.plan.updateMany({
    where: { name: { in: ['フルパッケージプラン', '作詞持ち込みプラン'] } },
    data: { category: 'ORIGINAL' }
  });

  console.log("2. Updating orderIndex...");
  const order = [
    'スタンダードプラン',
    'ワンコーラスプラン',
    'ショート動画用プラン',
    '短納期プラン',
    '最短納期プラン',
    'コラボ・合唱プラン'
  ];

  const plans = await prisma.plan.findMany({ where: { category: 'MIX' } });
  for (const plan of plans) {
    const idx = order.indexOf(plan.name);
    if (idx !== -1) {
      await prisma.plan.update({
        where: { id: plan.id },
        data: { orderIndex: idx }
      });
    }
  }

  console.log("3. Checking options...");
  const options = await prisma.option.findMany();
  console.log(`Current options count: ${options.length}`);
  
  if (options.length === 0) {
    console.log("Migrating options from temp.json...");
    const data = JSON.parse(fs.readFileSync('C:\\Users\\shien\\OneDrive\\デスクトップ\\Sien-Official\\_old_html_site\\temp.json', 'utf8'));
    
    let orderIndex = 0;
    if (data.mixOptions) {
      for (const opt of data.mixOptions) {
        await prisma.option.create({
          data: {
            name: opt.title,
            category: 'MIX',
            priceText: opt.price,
            description: opt.desc,
            isActive: true,
            orderIndex: orderIndex++
          }
        });
      }
    }
    
    orderIndex = 0;
    if (data.origOptions) {
      for (const opt of data.origOptions) {
        await prisma.option.create({
          data: {
            name: opt.title,
            category: 'ORIGINAL',
            priceText: opt.price,
            description: opt.desc,
            isActive: true,
            orderIndex: orderIndex++
          }
        });
      }
    }
    console.log("Options migrated successfully.");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
