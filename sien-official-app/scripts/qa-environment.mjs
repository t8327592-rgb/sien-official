import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';
import { PrismaClient } from '@prisma/client';
import { spawn, spawnSync } from 'node:child_process';
import { createServer as createHttpServer } from 'node:http';
import { createServer as createTcpServer } from 'node:net';
import fs from 'node:fs';
import path from 'node:path';

// In-memory test data only. Never loads, copies, or resets the live database.
const app = path.resolve(import.meta.dirname, '..');
const databaseUrl = 'postgresql://qa:qa@127.0.0.1:55432/qa?sslmode=disable&connection_limit=1&statement_cache_size=0&pgbouncer=true';
const schema = spawnSync(process.execPath, ['node_modules/prisma/build/index.js', 'migrate', 'diff', '--from-empty', '--to-schema-datamodel', 'prisma/schema.prisma', '--script'], { cwd: app, encoding: 'utf8' });
if (schema.status !== 0) throw Error(schema.stderr || 'Could not generate isolated schema');
const db = await PGlite.create();
await db.exec(schema.stdout);
const server = new PGLiteSocketServer({ db, port: 55432, host: '127.0.0.1', maxConnections: 10 });
await server.start();
const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
await prisma.siteSetting.create({ data: { id: 'default', orderStatus: 'AVAILABLE', announcement: 'QA隔離環境・実際の申込は受け付けません', contactEmail: 'qa@example.invalid', youtubeUrl: 'https://www.youtube.com/@sien_mc09' } });
await prisma.plan.createMany({ data: [
  { id: 'qa-mix', name: 'スタンダードプラン', category: 'MIX', price: 10000, period: '7日', revisions: '5回', orderIndex: 0 },
  { id: 'qa-bulk', name: 'ショートMIX 3本セット', category: 'MIX', price: 13500, period: '14日', revisions: '各2回まで', orderIndex: 1 },
  { id: 'qa-original', name: 'フルパッケージプラン', category: 'ORIGINAL', price: 66000, period: '60日', revisions: '無制限', orderIndex: 2 },
  { id: 'qa-free', name: '0円確認用', category: 'MIX', price: 0, period: '7日', revisions: '1回', orderIndex: 3 },
] });
await prisma.option.createMany({ data: [
  { id: 'qa-guide', name: '人間による仮歌歌唱', category: 'ORIGINAL', priceText: '5,000円〜' },
  { id: 'qa-cut', name: 'カットアップ', category: 'MIX', priceText: '2,000円', description: '10秒あたり' },
  { id: 'qa-encode', name: 'エンコード', category: 'MIX', priceText: '0円〜1,000円' },
  { id: 'qa-vocal', name: 'ボーカルガイド作成', category: 'MIX', priceText: '3,000円' },
] });
await prisma.profile.create({ data: { name: 'QAプロフィール', title: 'QA Creator', bioShort: 'CMS短文の表示確認', bioLong: 'CMS本文の表示確認', imageUrl: '/profile.jpg', achievements: 'QA実績の表示確認' } });
await prisma.service.create({ data: { name: 'CMS MIXサービス', category: 'MIX', description: 'CMSサービス説明の確認', features: 'ピッチ補正\nタイミング補正' } });
await prisma.portfolio.createMany({ data: [
  { id: 'qa-work-mix', title: 'QA MIX作品', url: 'https://www.youtube.com/watch?v=olpsRfUFdjw', serviceCategory: 'MIX', isFeatured: true, showOnMix: true },
  { id: 'qa-work-original', title: 'QA オリジナル作品', url: 'https://www.youtube.com/watch?v=voTuWFmcbeI', serviceCategory: 'ORIGINAL', isFeatured: true, showOnOriginal: true },
] });
await prisma.post.create({ data: { id: 'qa-news', title: 'QA お知らせ', type: 'NEWS', published: true, content: '## QA見出し\n\n**太字**と本文。', createdAt: new Date('2026-07-08T00:00:00+09:00') } });
await prisma.campaign.create({ data: { id: 'qa-expired', name: '終了済みQAセール', targetPlanId: 'qa-mix', campaignPrice: 8000, endDate: new Date('2026-07-17T23:59:59+09:00') } });
await prisma.$disconnect();
await db.exec("DEALLOCATE ALL");

const captures = { mail: [], webhook: [] };
let failWebhook = false;
const captureServer = createHttpServer(async (request, response) => {
  if (request.url === '/captures') { response.setHeader('Content-Type', 'application/json'); response.end(JSON.stringify(captures)); return; }
  if (request.url === '/fail-webhook') { failWebhook = request.method === 'POST'; response.end('ok'); return; }
  let text = '';
  for await (const part of request) text += part.toString();
  if (failWebhook) { response.writeHead(503); response.end('QA failure'); return; }
  captures.webhook.push(text);
  response.writeHead(204); response.end();
});
captureServer.listen(55433, '127.0.0.1');
const smtp = createTcpServer(socket => {
  socket.write('220 localhost QA SMTP\r\n');
  let buffer = '', data = false, message = [];
  socket.on('data', chunk => {
    buffer += chunk.toString();
    let index;
    while ((index = buffer.indexOf('\r\n')) >= 0) {
      const line = buffer.slice(0, index); buffer = buffer.slice(index + 2);
      if (data) {
        if (line === '.') { captures.mail.push(message.join('\r\n')); message = []; data = false; socket.write('250 queued\r\n'); }
        else message.push(line);
      } else if (/^EHLO|^HELO/i.test(line)) socket.write('250 localhost\r\n');
      else if (/^DATA$/i.test(line)) { data = true; socket.write('354 data\r\n'); }
      else if (/^QUIT$/i.test(line)) { socket.end('221 bye\r\n'); }
      else socket.write('250 ok\r\n');
    }
  });
});
smtp.listen(2526, '127.0.0.1');
const env = { ...process.env, QA_ISOLATED: "1", POSTGRES_PRISMA_URL: databaseUrl, POSTGRES_URL_NON_POOLING: databaseUrl,
  ADMIN_USERNAME: 'qa-admin', ADMIN_PASSWORD: 'qa-only-password', NEXTAUTH_SECRET: 'qa-only-secret-never-for-production-0123456789', NEXTAUTH_URL: 'http://127.0.0.1:3002', NEXT_PUBLIC_SITE_URL: 'http://127.0.0.1:3002',
  SMTP_HOST: '127.0.0.1', SMTP_PORT: '2526', SMTP_USER: '', SMTP_PASS: '', SMTP_FROM: 'qa@example.invalid', ADMIN_NOTIFICATION_EMAIL: 'qa-admin@example.invalid',
  DISCORD_WEBHOOK_URL: 'http://127.0.0.1:55433/webhook', CRON_SECRET: 'qa-only-cron-secret-0123456789-abcdefgh', GOOGLE_GENERATIVE_AI_API_KEY: '', OPENAI_API_KEY: '', NEXT_PUBLIC_GA_ID: '', TRUSTED_CLIENT_IP_HEADER: '',
  GOOGLE_SERVICE_ACCOUNT_EMAIL: '', GOOGLE_PRIVATE_KEY: '', GOOGLE_CALENDAR_ID: '',
};
const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'dev', '--hostname', '127.0.0.1', '--port', '3002'], { cwd: app, env, stdio: ['ignore', 'pipe', 'pipe'] });
const logPath = path.resolve(app, '../audit/qa-server.log');
const log = fs.createWriteStream(logPath);
child.stdout.on('data', chunk => { log.write(chunk); if (chunk.toString().includes('Ready')) console.log('QA environment ready: http://127.0.0.1:3002 (memory-only PostgreSQL, captured notifications)'); });
child.stderr.on('data', chunk => log.write(chunk));
let stopping = false;
async function stop() { if (stopping) return; stopping = true; child.kill(); smtp.close(); captureServer.close(); await server.stop(); await db.close(); log.end(); process.exit(0); }
process.on('SIGINT', stop); process.on('SIGTERM', stop);
child.on('exit', () => { if (!stopping) stop(); });
