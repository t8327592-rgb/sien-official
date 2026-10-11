import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Explicit --apply is required; the default reads schema metadata only.
const directory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../prisma/migrations');
const migrations = ['202610010001_notification_outbox', '202610010002_submission_receipts', '202610010003_rate_limit'];
const retirementMigration = '202610110001_retire_receipt_numbers';
const retirementSql = fs.readFileSync(path.join(directory, retirementMigration, 'migration.sql'), 'utf8').replace(/--[^\n]*/g, '').trim();
if (retirementSql !== 'ALTER TABLE "SubmissionReceipt" ALTER COLUMN "receiptNumber" DROP NOT NULL;') throw Error('Unexpected receipt retirement SQL');
const tables = ['NotificationJob', 'SubmissionReceipt', 'ApiRateLimit'];
const statements = migrations.flatMap(name => fs.readFileSync(path.join(directory, name, 'migration.sql'), 'utf8').replace(/--[^\n]*/g, '').split(';').map(sql => sql.trim()).filter(Boolean));
if (statements.some(sql => !/^CREATE (?:TABLE|(?:UNIQUE )?INDEX) IF NOT EXISTS /i.test(sql))) throw Error('Only additive CREATE statements are allowed');
const expectedColumns = Object.fromEntries(tables.map(table => {
  const sql = statements.find(statement => statement.startsWith(`CREATE TABLE IF NOT EXISTS "${table}"`));
  return [table, [...sql.matchAll(/^\s*"([^"\n]+)" /gm)].map(match => match[1])];
}));
const apply = process.argv.includes('--apply');
if (process.argv.slice(2).some(value => !['--apply', '--deployment'].includes(value))) throw Error('Unknown option');
if (!process.argv.includes('--deployment') && !(process.env.QA_ISOLATED === '1' && new URL(process.env.POSTGRES_PRISMA_URL || 'http://invalid').hostname === '127.0.0.1' && new URL(process.env.POSTGRES_PRISMA_URL).port === '55432')) throw Error('Select the deployment target with --deployment, or the isolated QA database explicitly');
const prisma = new PrismaClient();
try {
  const inventory = await Promise.all(tables.map(async table => {
    const columns = await prisma.$queryRaw`SELECT column_name, is_nullable FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = ${table}`;
    const names = columns.map(column => column.column_name);
    if (names.length && expectedColumns[table].some(column => !names.includes(column))) throw Error('Existing table schema differs; review migration manually');
    return { table, exists: names.length > 0, ...(table === 'SubmissionReceipt' ? { numberRetired: columns.find(column => column.column_name === 'receiptNumber')?.is_nullable === 'YES' } : {}) };
  }));
  if (apply) await prisma.$transaction(async tx => {
    await tx.$queryRaw`SELECT 1 AS locked FROM pg_advisory_xact_lock(202610010040::bigint)`;
    // SQL comes exclusively from the checked-in, validated migration files.
    for (const sql of statements) await tx.$executeRawUnsafe(sql);
    await tx.$executeRawUnsafe(retirementSql);
  }, { timeout: 30000 });
  console.log(JSON.stringify({ mode: apply ? 'APPLIED_NON_DESTRUCTIVE' : 'READ_ONLY_CHECK', inventory, migrations: [...migrations, retirementMigration], existingRowsChanged: false }, null, 2));
} catch {
  console.error('Migration check/apply failed. Review connectivity and existing schema. No reset or automatic recovery was performed.');
  process.exitCode = 1;
} finally { await prisma.$disconnect(); }
