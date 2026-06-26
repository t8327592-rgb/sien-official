const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.post.updateMany({
    where: {
      type: 'NEWS',
      title: '【重要】サービス料金改定のお知らせ（2026年6月1日より）'
    },
    data: {
      imageUrl: '/news_thumbnail.png'
    }
  });
  console.log('Image URL updated.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
