const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.post.create({
    data: {
      title: 'テストブログ記事です。カテゴリーとサムネイル対応',
      content: 'これはテスト用のブログ記事です。\n\n## 見出し2\n\n- リスト1\n- リスト2\n\n**太字** や *斜体* も可能です。\n\nこの機能により、Markdownで美しいブログが書けます！',
      type: 'BLOG',
      category: 'お知らせ',
      imageUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=1000&auto=format&fit=crop',
      published: true,
    }
  });
  console.log('Test blog post seeded.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
