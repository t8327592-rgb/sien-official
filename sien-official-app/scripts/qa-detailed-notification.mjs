import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import nextEnv from '@next/env';
import { PrismaClient } from '@prisma/client';

// Sends exactly one synthetic order from the memory-only QA database to the
// owner's configured Discord webhook. Never reads/writes the live database.
assert.ok(process.argv.includes('--send-owner-test'), 'Explicit --send-owner-test required');
const root = path.resolve(import.meta.dirname, '..');
nextEnv.loadEnvConfig(root, true);
const webhook = process.env.DISCORD_WEBHOOK_URL;
assert.match(webhook || '', /^https:\/\/(?:discord\.com|discordapp\.com)\/api\/webhooks\/\d+\/[A-Za-z0-9._-]+$/);
const qa = new PrismaClient({ datasources: { db: { url: 'postgresql://qa:qa@127.0.0.1:55432/qa?sslmode=disable&connection_limit=1&statement_cache_size=0&pgbouncer=true' } } });
const report = { testedAt: new Date().toISOString(), isolatedDatabase: true, customerEmailsSent: 0 };
const nativeRequire = createRequire(import.meta.url);
const nativeFetch = globalThis.fetch;
const cache = new Map();
function load(file) {
  if (cache.has(file)) return cache.get(file).exports;
  const compiled = { exports: {} }; cache.set(file, compiled);
  const source = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  vm.compileFunction(source, ['require', 'module', 'exports'], { filename: file })(name => {
    if (name === '@/lib/prisma') return { prisma: qa };
    if (name === '@/lib/mail') return { sendMail: async () => { throw Error('No SMTP deliveries allowed in this Discord-only test'); } };
    if (name.startsWith('@/')) return load('src/' + name.slice(2) + '.ts');
    return nativeRequire(name);
  }, compiled, compiled.exports);
  return compiled.exports;
}
let deliveries = 0;
globalThis.fetch = async (url, init) => {
  const target = new URL(url); const expected = new URL(webhook);
  assert.equal(target.origin + target.pathname, expected.origin + expected.pathname);
  assert.equal(target.searchParams.get('wait'), 'true'); assert.equal(deliveries++, 0);
  const payload = typeof init.body === 'string' ? JSON.parse(init.body) : JSON.parse(init.body.get('payload_json'));
  assert.deepEqual(payload.allowed_mentions, { parse: [] });
  assert.doesNotMatch(JSON.stringify(payload), /受付番号/);
  const response = await nativeFetch(target, init);
  assert.ok(response.ok, `Discord status ${response.status}`);
  const sent = await response.clone().json(); assert.ok(sent.id);
  const readback = await nativeFetch(`${webhook}/messages/${sent.id}`, { signal: AbortSignal.timeout(10000) });
  assert.ok(readback.ok); const received = await readback.json();
  assert.equal(received.id, sent.id);
  const fields = Object.fromEntries(received.embeds[0].fields.map(field => [field.name, field.value]));
  assert.equal(fields['依頼者名'], 'QA動作確認・対応不要 20261011');
  assert.equal(fields['受付時点の概算金額'], '13,000円（税込）');
  assert.equal(fields['メールアドレス'], 'qa-notification-20261011@example.invalid');
  assert.equal(fields['希望する連絡手段'], 'Discord'); assert.equal(fields['歌唱キー'], '-3');
  assert.equal(fields['素材URL'], 'https://example.invalid/materials');
  assert.equal(fields['参考URL'], 'https://example.invalid/reference');
  assert.ok(fields['備考・ご要望'].includes('制作・請求・返信は不要'));
  report.discord = { delivered: true, readBackVerified: true, messageId: sent.id, fieldNames: Object.keys(fields) };
  return response;
};
try {
  assert.match((await qa.siteSetting.findUniqueOrThrow({ where: { id: 'default' } })).announcement, /QA隔離環境/);
  const orders = await qa.order.findMany({ where: { clientName: 'QA動作確認・対応不要 20261011', clientEmail: 'qa-notification-20261011@example.invalid' } });
  assert.equal(orders.length, 1); const order = orders[0];
  const submission = await qa.submissionReceipt.findUniqueOrThrow({ where: { entityType_entityId: { entityType: 'ORDER', entityId: order.id } } });
  assert.equal(submission.receiptNumber, null); assert.equal(submission.quote.price, 13000); assert.equal(submission.termsVersion, '2026-10-11');
  const jobs = await qa.notificationJob.findMany({ where: { entityId: order.id } });
  assert.equal(jobs.length, 2); assert.ok(jobs.every(job => !job.kind.endsWith('_RECEIPT_EMAIL')));
  const captures = await (await nativeFetch('http://127.0.0.1:55433/captures')).json();
  assert.ok(captures.mail.length >= 1);
  assert.ok(captures.mail.every(mail => !mail.includes('To: qa-notification-20261011@example.invalid')));
  assert.ok(captures.webhook.some(body => body.includes('QA動作確認・対応不要 20261011')));
  const job = jobs.find(job => job.kind === 'ORDER_DISCORD'); assert.ok(job);
  await qa.notificationJob.update({ where: { id: job.id }, data: { status: 'PENDING', attempts: 0, nextAttemptAt: new Date(), lockedUntil: null } });
  const result = await load('src/lib/notifications.ts').processPendingNotifications(1, 20000, job.id);
  assert.deepEqual(result, { delivered: 1, failed: 0 });
  assert.equal((await qa.notificationJob.findUniqueOrThrow({ where: { id: job.id } })).status, 'DELIVERED');
  report.orderId = order.id; report.saved = true; report.numberIssued = false; report.quote = submission.quote.price;
} finally {
  globalThis.fetch = nativeFetch;
  await qa.$disconnect();
  const directory = path.resolve(root, '../audit/notification-changes-2026-10-11');
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, 'live-discord-test.json'), JSON.stringify(report, null, 2));
}
console.log(JSON.stringify(report, null, 2));
