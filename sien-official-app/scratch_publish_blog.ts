import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const post = await prisma.post.findFirst({
    where: { title: { contains: '公式のインスト音源は歌ってみたに使っていいの？' } }
  });
  
  if (post) {
    const updated = await prisma.post.update({
      where: { id: post.id },
      data: { published: true }
    });
    console.log(`Published post: ${updated.title}`);
  } else {
    console.log('Post not found');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
