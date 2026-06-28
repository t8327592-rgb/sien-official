import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const post = await prisma.post.findFirst({
    where: { title: { contains: '公式のインスト音源は歌ってみたに使っていいの？' } }
  });
  console.log(post ? `Title: ${post.title}\nPublished: ${post.published}` : 'Not found');
}

main().catch(console.error).finally(() => prisma.$disconnect());
