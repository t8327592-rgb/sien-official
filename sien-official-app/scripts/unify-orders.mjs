import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';
import { businessOrderData } from '../src/lib/business-order.ts';

// Default: report only. Never infer historical test data from canceled status.
const args = process.argv.slice(2);
if (args.some(a => !['--apply', '--deployment'].includes(a) && !a.startsWith('--test-ids='))) throw Error('Unknown option');
const url = new URL(process.env.POSTGRES_PRISMA_URL || 'http://invalid');
if (!args.includes('--deployment') && !(process.env.QA_ISOLATED === '1' && url.hostname === '127.0.0.1' && url.port === '55432')) throw Error('Explicit deployment target or isolated QA database required');
const ids = new Set((args.find(a => a.startsWith('--test-ids='))?.slice(11) || '').split(',').filter(Boolean));
const prisma = new PrismaClient();
try {
  const contacts = await prisma.businessContact.findMany({ orderBy: { createdAt: 'asc' } });
  if ([...ids].some(id => !contacts.some(c => c.id === id))) throw Error('Unknown test ID; no changes made');
  const inventory = contacts.map(c => ({ id: c.id, status: c.status, isTest: ids.has(c.id) }));
  if (!args.includes('--apply')) {
    console.log(JSON.stringify({ mode: 'READ_ONLY', inventory, sourceRowsChanged: false }, null, 2));
  } else {
    const sql = fs.readFileSync(new URL('../prisma/migrations/202611050001_unified_orders/migration.sql', import.meta.url), 'utf8');
    // Separate SQL execution uses the direct PostgreSQL client in the QA socket as well.
    // Prisma raw calls accept one statement; the dollar-quoted DO block is kept intact.
    const statements = sql.replace(/--[^\n]*/g, '').match(/\s*DO \$\$[\s\S]*?END \$\$;|[^;]+;/g) || [];
    const result = await prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(202611050001::bigint)`;
      for (const statement of statements) await tx.$executeRawUnsafe(statement);
      let created = 0;
      // Re-read under the migration lock; repeated runs cannot duplicate source links.
      const current = await tx.businessContact.findMany();
      for (const contact of current) {
        const linked = await tx.order.findUnique({ where: { businessContactId: contact.id } });
        if (!linked) { await tx.order.create({ data: businessOrderData(contact, ids.has(contact.id)) }); created++; }
        else if (ids.has(contact.id) && !linked.isTest) await tx.order.update({ where: { id: linked.id }, data: { isTest: true, financeVersion: { increment: 1 } } });
      }
      return { created };
    }, { timeout: 60000 });
    console.log(JSON.stringify({ mode: 'APPLIED', ...result, sourceRowsChanged: false, originalOrderAmountsChanged: false, notificationsCreated: false }));
  }
} finally { await prisma.$disconnect(); }
