import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const updatedPost = await prisma.post.updateMany({
    where: {
      title: {
        contains: "サマーMIXセール開催のお知らせ"
      }
    },
    data: {
      category: "お知らせ"
    }
  });

  console.log(`Updated ${updatedPost.count} posts.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
