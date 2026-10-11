import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import nextEnv from '@next/env';
import { PrismaClient } from '@prisma/client';

// Explicit owner-only delivery test. Never connects to the configured database,
// processes existing real jobs, or accepts an arbitrary recipient/webhook URL.
assert.ok(process.argv.includes('--send-owner-test'), 'Explicit --send-owner-test required');
const root = path.resolve(import.meta.dirname, '..');
nextEnv.loadEnvConfig(root, true);
const owner = 'px.sien@gmail.com';
assert.equal(process.env.SMTP_USER, owner, 'Unexpected SMTP account');
assert.equal(process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_USER, owner, 'Unexpected admin recipient');
assert.match(process.env.DISCORD_WEBHOOK_URL || '', /^https:\/\/(?:discord\.com|discordapp\.com)\/api\/webhooks\/\d+\/[A-Za-z0-9._-]+$/);
const qa = new PrismaClient({ datasources: { db: { url: 'postgresql://qa:qa@127.0.0.1:55432/qa?sslmode=disable&connection_limit=1&statement_cache_size=0&pgbouncer=true' } } });
const runId = 'SIEN-QA-' + new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
const report = { runId, testedAt: new Date().toISOString(), isolatedDatabase: true, recipient: owner, events: [], jobs: [] };
const nativeRequire = createRequire(import.meta.url);
const nativeFetch = globalThis.fetch;
const cache = new Map();
function load(file) {
  if (cache.has(file)) return cache.get(file).exports;
  const compiled = { exports: {} }; cache.set(file, compiled);
  const source = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  vm.compileFunction(source, ['require', 'module', 'exports'], { filename: file })(name => {
    if (name === '@/lib/prisma') return { prisma: qa };
    if (name === '@/lib/mail') return { sendMail: ownerMail };
    if (name.startsWith('@/')) return load('src/' + name.slice(2) + '.ts');
    return nativeRequire(name);
  }, compiled, compiled.exports);
  return compiled.exports;
}
const realMail = load('src/lib/mail.ts').sendMail;
let smtpUnavailable = false, discordUnavailable = false;
async function ownerMail(message) {
  assert.equal(message.to, owner);
  if (smtpUnavailable) { report.events.push({ channel: 'SMTP', messageId: message.messageId, skipped: true }); throw new Error('SMTP_PREFLIGHT_FAILED'); }
  const prefix = `【動作確認・対応不要】${runId}\n隔離環境のテスト受付です。制作・返信は不要です。管理リンクはテスト用のため開けません。\n\n`;
  try {
    const result = await realMail({ ...message, subject: `【動作確認・対応不要】${runId} ${message.subject}`, text: prefix + message.text });
    report.events.push({ channel: 'SMTP', messageId: message.messageId, accepted: true }); return result;
  } catch (error) {
    smtpUnavailable = true;
    report.events.push({ channel: 'SMTP', messageId: message.messageId, accepted: false, code: typeof error.code === 'string' ? error.code : error.name, responseCode: error.responseCode || null });
    throw new Error('SMTP_TEST_FAILED');
  }
}
// The test wrapper adds a clear marker; the worker requests wait=true so the
// stored Discord message can be read back by message ID.
globalThis.fetch = async (url, init) => {
  const target = new URL(url);
  const configured = new URL(process.env.DISCORD_WEBHOOK_URL);
  assert.equal(target.origin + target.pathname, configured.origin + configured.pathname);
  if (discordUnavailable) { report.events.push({ channel: 'Discord', skipped: true }); throw new Error('DISCORD_PREFLIGHT_FAILED'); }
  const body = typeof init.body === 'string' ? JSON.parse(init.body) : JSON.parse(init.body.get('payload_json'));
  assert.doesNotMatch(JSON.stringify(body), /受付番号/);
  target.searchParams.set('wait', 'true');
  let response;
  try {
    const payload = { ...body, content: `【動作確認・対応不要】${runId}\n隔離環境のテスト受付です。制作・返信は不要です。管理リンクはテスト用のため開けません。\n${body.content}`, allowed_mentions: { parse: [] } };
    const outgoing = typeof init.body === 'string' ? JSON.stringify(payload) : init.body;
    if (outgoing instanceof FormData) outgoing.set('payload_json', JSON.stringify(payload));
    response = await nativeFetch(target, { ...init, body: outgoing });
    if (!response.ok) { discordUnavailable = true; report.events.push({ channel: 'Discord', accepted: false, status: response.status }); return response; }
    const sent = await response.clone().json();
    assert.ok(sent.id && sent.channel_id);
    const readback = await nativeFetch(`${process.env.DISCORD_WEBHOOK_URL}/messages/${sent.id}`, { signal: AbortSignal.timeout(10000) });
    const received = readback.ok ? await readback.json() : null;
    assert.ok(readback.ok && received.id === sent.id && received.content.includes(runId));
    report.events.push({ channel: 'Discord', accepted: true, readBackVerified: true, messageId: sent.id, channelId: sent.channel_id });
    return response;
  } catch (error) {
    discordUnavailable = true;
    report.events.push({ channel: 'Discord', accepted: false, code: error.name }); throw new Error('DISCORD_TEST_FAILED');
  }
};
try {
  assert.match((await qa.siteSetting.findUniqueOrThrow({ where: { id: 'default' } })).announcement, /QA隔離環境/);
  const { queueNotifications, processPendingNotifications } = load('src/lib/notifications.ts');
  for (const type of ['ORDER', 'CONSULTATION', 'BUSINESS']) {
    const entity = type === 'BUSINESS' ? 'BUSINESS' : 'ORDER';
    const record = entity === 'BUSINESS'
      ? await qa.businessContact.create({ data: { companyName: 'QA動作確認・対応不要', contactName: 'QAテスト', email: owner, inquiryType: 'お見積りのご依頼', message: runId } })
      : await qa.order.create({ data: { clientName: 'QA動作確認・対応不要', clientEmail: owner, serviceType: 'MIX', planId: type === 'CONSULTATION' ? '無料相談' : 'QA通知テスト', price: null, message: runId } });
    await qa.submissionReceipt.create({ data: { entityType: entity, entityId: record.id, requestKey: randomUUID(), payloadHash: runId, quote: { test: true }, termsVersion: 'QA-NON-CONTRACT-TEST', consentedAt: new Date() } });
    await queueNotifications(qa, entity, record.id);
    const jobs = await qa.notificationJob.findMany({ where: { entityId: record.id } });
    assert.equal(jobs.length, 2); assert.ok(jobs.every(job => !job.kind.endsWith('_RECEIPT_EMAIL')));
    for (const job of jobs) {
      await processPendingNotifications(1, 20000, job.id);
      const finished = await qa.notificationJob.findUniqueOrThrow({ where: { id: job.id } });
      report.jobs.push({ form: type, id: job.id, kind: job.kind, status: finished.status, attempts: finished.attempts });
    }
  }
} finally {
  globalThis.fetch = nativeFetch;
  await qa.$disconnect();
  fs.writeFileSync(path.resolve(root, '../audit/forms-live-notifications-2026-10-11.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}
