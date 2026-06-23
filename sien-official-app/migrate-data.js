const sqlite3 = require('sqlite3').verbose();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const db = new sqlite3.Database('./prisma/dev.db', sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

async function migrate() {
  console.log('Starting migration...');
  
  // Migrate Plans
  db.all('SELECT * FROM Plan', async (err, rows) => {
    if (err) {
      console.error('Error reading Plan table:', err);
    } else if (rows && rows.length > 0) {
      for (const row of rows) {
        try {
          await prisma.plan.upsert({
            where: { id: row.id },
            update: {},
            create: {
              id: row.id,
              name: row.name,
              category: row.type === 'original' ? 'ORIGINAL' : 'MIX',
              description: row.description,
              price: row.price,
              features: row.features,
              isActive: true,
              orderIndex: row.orderIndex || 0
            }
          });
        } catch(e) {
          console.error('Skipped Plan', row.id, e.message);
        }
      }
      console.log(`Migrated ${rows.length} Plans`);
    }
  });

  // Migrate Portfolios
  db.all('SELECT * FROM Portfolio', async (err, rows) => {
    if (err) {
      console.error('Error reading Portfolio table:', err);
    } else if (rows && rows.length > 0) {
      for (const row of rows) {
        try {
          await prisma.portfolio.upsert({
            where: { id: row.id },
            update: {},
            create: {
              id: row.id,
              title: row.title,
              url: row.url,
              serviceCategory: row.serviceCategory,
              tags: row.tags,
              isFeatured: row.isFeatured === 1,
              isPublished: true,
              orderIndex: row.orderIndex || 0
            }
          });
        } catch(e) {
          console.error('Skipped Portfolio', row.id, e.message);
        }
      }
      console.log(`Migrated ${rows.length} Portfolios`);
    }
  });
}

migrate();
