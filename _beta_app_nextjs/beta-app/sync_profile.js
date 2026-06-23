const { PrismaClient } = require('@prisma/client');
const Database = require('better-sqlite3');

const prisma = new PrismaClient(); // PG側

async function main() {
  const db = new Database('./prisma/dev.db', { readonly: true });
  
  const sqliteProfile = db.prepare('SELECT * FROM Profile LIMIT 1').get();
  if (sqliteProfile) {
    // 既存のSupabase側Profileを削除
    await prisma.profile.deleteMany();
    
    // SQLiteのProfileを挿入
    await prisma.profile.create({
      data: {
        id: sqliteProfile.id,
        name: sqliteProfile.name,
        title: sqliteProfile.title,
        twitterId: sqliteProfile.twitterId,
        text1: sqliteProfile.text1,
        text2: sqliteProfile.text2,
        text3: sqliteProfile.text3,
        availability: sqliteProfile.availability,
        deliveryInfo: sqliteProfile.deliveryInfo,
      }
    });
    console.log("Migrated Profile successfully!");
  } else {
    console.log("No profile found in dev.db.");
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
