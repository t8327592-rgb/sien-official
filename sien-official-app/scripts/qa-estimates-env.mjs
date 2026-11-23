// Memory-only PostgreSQL and loopback Next.js. Never reads or copies live data.
import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';
import { PrismaClient } from '@prisma/client';
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { estimateFixtures } from '../tests/fixtures/estimates.mjs';
const app = path.resolve(import.meta.dirname, '..');
const databaseUrl = 'postgresql://qa:qa@127.0.0.1:55452/qa?sslmode=disable&connection_limit=1&statement_cache_size=0&pgbouncer=true';
const schema = spawnSync(process.execPath, ['node_modules/prisma/build/index.js', 'migrate', 'diff', '--from-empty', '--to-schema-datamodel', 'prisma/schema.prisma', '--script'], { cwd: app, encoding: 'utf8' });
if (schema.status !== 0) throw Error(schema.stderr || 'Cannot prepare isolated schema');
const db = await PGlite.create(); await db.exec(schema.stdout);
const server = new PGLiteSocketServer({ db, port: 55452, host: '127.0.0.1', maxConnections: 10 }); await server.start();
const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
await prisma.siteSetting.create({ data: { id: 'default', announcement: 'QA隔離環境・見積書検証専用' } });
const fixtures = estimateFixtures();
await prisma.plan.createMany({ data: fixtures.plans });
await prisma.order.createMany({ data: fixtures.orders });
await prisma.order.create({ data: { id: 'qa-estimate-other', clientName: '別クライアント', clientEmail: 'other@example.invalid', serviceType: 'MIX', songTitle: '別の曲' } });
for (const receipt of fixtures.receipts) await prisma.submissionReceipt.create({ data: { ...receipt, entityType: 'ORDER', requestKey: receipt.entityId, payloadHash: 'qa-only' } });
await prisma.order.update({ where: { id: fixtures.orders[0].id }, data: { confirmedPrice: 8000, revenueAt: new Date('2026-11-24T01:00:00Z') } });
await prisma.paymentRecord.create({ data: { orderId: fixtures.orders[0].id, requestKey: 'qa-estimate-payment', amount: 4000, paidAt: new Date('2026-11-24T01:00:00Z') } });
await prisma.$disconnect(); await db.exec('DEALLOCATE ALL');
const env = { ...process.env, QA_ISOLATED: '1', QA_ESTIMATES: '1', POSTGRES_PRISMA_URL: databaseUrl, POSTGRES_URL_NON_POOLING: databaseUrl,
  ADMIN_USERNAME: 'qa-admin', ADMIN_PASSWORD: 'qa-only-password', NEXTAUTH_SECRET: 'qa-estimates-isolated-secret-01234567890123456789', NEXTAUTH_URL: 'http://127.0.0.1:3006', NEXT_PUBLIC_SITE_URL: 'http://127.0.0.1:3006',
  SMTP_HOST: '', SMTP_USER: '', SMTP_PASS: '', DISCORD_WEBHOOK_URL: '', CRON_SECRET: '', GOOGLE_GENERATIVE_AI_API_KEY: '', OPENAI_API_KEY: '', NEXT_PUBLIC_GA_ID: '', GOOGLE_SERVICE_ACCOUNT_EMAIL: '', GOOGLE_PRIVATE_KEY: '', GOOGLE_CALENDAR_ID: '',
};
const output = path.join(app, '../tmp/estimates-qa'); fs.mkdirSync(output, { recursive: true });
const log = fs.createWriteStream(path.join(output, 'server.log'));
const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'dev', '--hostname', '127.0.0.1', '--port', '3006'], { cwd: app, env, stdio: ['ignore', 'pipe', 'pipe'] });
child.stdout.on('data', chunk => { log.write(chunk); if (chunk.toString().includes('Ready')) console.log('QA ready: http://127.0.0.1:3006 (memory-only database :55452)'); });
child.stderr.on('data', chunk => log.write(chunk));
let stopping = false;
async function stop() { if (stopping) return; stopping = true; child.kill(); await server.stop(); await db.close(); log.end(); process.exit(0); }
process.on('SIGINT', stop); process.on('SIGTERM', stop); child.on('exit', () => { if (!stopping) stop(); });
