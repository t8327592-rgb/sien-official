import { prisma } from '@/lib/prisma';

async function main() {
  const news = await prisma.news.findMany();
  for (const n of news) {
    if (!n.slug) {
      await prisma.news.update({
        where: { id: n.id },
        data: { slug: `news-${Math.random().toString(36).substring(2, 10)}` }
      });
    }
  }
  console.log("Updated slugs for existing news.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
