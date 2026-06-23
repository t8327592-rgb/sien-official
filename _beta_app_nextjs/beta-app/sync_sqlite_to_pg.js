const { PrismaClient } = require('@prisma/client');
// SQLite 用のクライアントは作成できない（現在はPG用に生成されている）ので、
// SQLiteのファイルを直接読み込むか、あらかじめ作っておいたテストデータを入れるかですが、
// Prismaは複数データソースを簡単には扱えないため、Better-sqlite3等で読みます。
const Database = require('better-sqlite3');

const prisma = new PrismaClient(); // PG側

async function main() {
  const db = new Database('./prisma/dev.db', { readonly: true });
  
  console.log("Reading from SQLite...");
  const portfolios = db.prepare('SELECT * FROM Portfolio').all();
  const plans = db.prepare('SELECT * FROM Plan').all();
  const news = db.prepare('SELECT * FROM News').all();
  
  console.log(`Found ${portfolios.length} portfolios, ${plans.length} plans, ${news.length} news in dev.db.`);

  // 念のためPG側の既存データ（さっき入れたシード等）をクリアするか、無ければ入れる。
  // 今回は一旦クリアしてSQLiteのものを正とします。
  await prisma.portfolio.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.news.deleteMany();

  // Insert Portfolios
  if (portfolios.length > 0) {
    await prisma.portfolio.createMany({
      data: portfolios.map(p => ({
        id: p.id,
        title: p.title,
        videoId: p.videoId,
        artist: p.artist,
        tags: p.tags,
        comment: p.comment,
        order: p.order,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt)
      }))
    });
    console.log("Migrated Portfolios.");
  }

  // Insert Plans
  if (plans.length > 0) {
    await prisma.plan.createMany({
      data: plans.map(p => ({
        id: p.id,
        title: p.title,
        price: p.price,
        description: p.description,
        period: p.period,
        revisions: p.revisions,
        isPopular: p.isPopular === 1,
        order: p.order,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt)
      }))
    });
    console.log("Migrated Plans.");
  }

  // Insert News
  if (news.length > 0) {
    await prisma.news.createMany({
      data: news.map(n => ({
        id: n.id,
        title: n.title,
        content: n.content,
        createdAt: new Date(n.createdAt),
        updatedAt: new Date(n.updatedAt)
      }))
    });
    console.log("Migrated News.");
  }

  console.log("Migration from dev.db to Supabase complete!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
