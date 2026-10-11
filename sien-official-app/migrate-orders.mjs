import sqlite3 from './scripts/legacy-sqlite.mjs';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const db = new sqlite3.Database('./prisma/dev.db', sqlite3.OPEN_READONLY);

async function migrateOrders() {
  console.log('Migrating Orders...');
  db.all('SELECT * FROM "Order"', async (err, rows) => {
    if (err) {
      console.error('Error reading Order table:', err);
    } else if (rows && rows.length > 0) {
      for (const row of rows) {
        try {
          // Schema matches: id, name, email, planId, status, details, requirements, createdAt, updatedAt
          await prisma.order.upsert({
            where: { id: row.id },
            update: {},
            create: {
              id: row.id,
              name: row.name,
              email: row.email,
              planId: row.planId,
              status: row.status,
              details: row.details,
              requirements: row.requirements,
              createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
              updatedAt: row.updatedAt ? new Date(row.updatedAt) : new Date()
            }
          });
        } catch(e) {
          console.error('Skipped Order', row.id, e.message);
        }
      }
      console.log(`Migrated ${rows.length} Orders`);
    }
  });
}

migrateOrders();
