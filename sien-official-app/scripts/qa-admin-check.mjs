import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';
import { spawn } from 'node:child_process';
const base = 'http://127.0.0.1:3002';
const databaseUrl = 'postgresql://qa:qa@127.0.0.1:55432/qa?sslmode=disable&connection_limit=1&statement_cache_size=0&pgbouncer=true';
const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
const cookies = new Map();
const orderId = 'qa-accounting-' + crypto.randomUUID();
async function call(url, options = {}) {
  const response = await fetch(base + url, { ...options, redirect: 'manual', headers: { origin: base, cookie: [...cookies].map(([k,v]) => `${k}=${v}`).join('; '), ...options.headers } });
  for (const cookie of response.headers.getSetCookie()) { const [pair] = cookie.split(';'); const i = pair.indexOf('='); cookies.set(pair.slice(0,i), pair.slice(i+1)); }
  return response;
}
async function finance(body) {
  const response = await call(`/api/admin/orders/${orderId}/finance`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  return { status: response.status, data: await response.json() };
}
async function migration(apply) {
  const args = ['scripts/unify-orders.mjs', '--test-ids=qa-corp-test', ...(apply ? ['--apply'] : [])];
  const output = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, { env: { ...process.env, QA_ISOLATED: '1', POSTGRES_PRISMA_URL: databaseUrl, POSTGRES_URL_NON_POOLING: databaseUrl }, stdio: ['ignore','pipe','pipe'] });
    let out = '', err = ''; child.stdout.on('data', c => out += c); child.stderr.on('data', c => err += c); child.on('error', reject); child.on('exit', code => code ? reject(Error(err)) : resolve(out));
  });
  return JSON.parse(output);
}
try {
  const setting = await prisma.siteSetting.findUnique({ where: { id: 'default' } });
  assert.match(setting.announcement, /QA隔離環境/);
  const before = JSON.stringify(await prisma.businessContact.findMany({ orderBy: { id: 'asc' } }));
  const count = await prisma.order.count();
  assert.equal((await migration(false)).mode, 'READ_ONLY');
  assert.equal(await prisma.order.count(), count);
  assert.equal((await migration(true)).created, 0);
  assert.equal((await migration(true)).created, 0);
  assert.equal(JSON.stringify(await prisma.businessContact.findMany({ orderBy: { id: 'asc' } })), before);
  assert.equal(await prisma.order.count(), count);
  assert.equal((await prisma.order.findUnique({ where: { businessContactId: 'qa-corp-real' } })).isTest, false);
  assert.equal((await prisma.order.findUnique({ where: { businessContactId: 'qa-corp-test' } })).isTest, true);
  assert.equal((await prisma.order.findUnique({ where: { businessContactId: 'qa-corp-canceled' } })).isTest, false);
  const unlinked = await prisma.businessContact.create({ data: { id: 'qa-backfill-' + crypto.randomUUID(), companyName: '追加移行の検証用', contactName: 'QA', email: 'qa@example.invalid', inquiryType: 'その他のお問い合わせ', message: '旧問い合わせを一度だけ統合する検証', status: 'PENDING' } });
  assert.equal((await migration(true)).created, 1);
  assert.equal((await migration(true)).created, 0);
  assert.deepEqual(await prisma.businessContact.findUnique({ where: { id: unlinked.id } }), unlinked);
  await prisma.order.update({ where: { businessContactId: unlinked.id }, data: { isTest: true } });
  console.log('PASS migration dry-run, repeatability, exact source preservation and explicit test classification');

  await prisma.order.create({ data: { id: orderId, clientName: '入金API確認用', clientEmail: 'qa@example.invalid', serviceType: 'MIX', price: 99999, isTest: true, isArchived: true } });
  assert.equal((await finance({ action: 'confirm', version: 0, confirmedPrice: 10000, revenueAt: '2026-11-01' })).status, 401);
  const csrf = await (await call('/api/auth/csrf')).json();
  const login = await call('/api/auth/callback/credentials', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ csrfToken: csrf.csrfToken, username: 'qa-admin', password: 'qa-only-password', callbackUrl: base + '/admin', json: 'true' }) });
  assert.ok([200,302].includes(login.status));
  assert.equal((await (await call('/api/auth/session')).json()).user.email, 'admin@sien-official.com');
  assert.equal((await finance({ action: 'confirm', version: 0, confirmedPrice: -1, revenueAt: '2026-11-01' })).status, 400);
  let result = await finance({ action: 'confirm', version: 0, confirmedPrice: 10000, revenueAt: '2026-11-01' });
  assert.equal(result.status, 200); assert.equal(result.data.order.price, 99999); assert.equal(result.data.order.financeVersion, 1);
  assert.equal(result.data.order.revenueAt, '2026-10-31T15:00:00.000Z');
  assert.equal((await finance({ action: 'confirm', version: 0, confirmedPrice: 10001, revenueAt: '2026-11-01' })).status, 409);
  const payment = { action: 'payment', version: 1, requestKey: 'qa-' + crypto.randomUUID(), amount: 8900, fee: 100, withholding: 1000, paidAt: '2026-11-02', kind: 'RECEIPT', memo: 'API検証' };
  const parallel = await Promise.all([finance(payment), finance(payment)]);
  assert.ok(parallel.every(r => r.status === 200));
  assert.equal(await prisma.paymentRecord.count({ where: { orderId } }), 1);
  assert.equal((await finance({ ...payment, amount: 8901 })).status, 409);
  assert.equal((await finance({ ...payment, requestKey: 'qa-' + crypto.randomUUID() })).status, 409);
  const saved = await prisma.paymentRecord.findUnique({ where: { requestKey: payment.requestKey } });
  result = await finance({ action: 'void', version: 2, paymentId: saved.id, reason: '重複ではなく誤入力の取消確認' });
  assert.equal(result.status, 200); assert.ok(result.data.order.payments[0].voidedAt); assert.equal(result.data.order.financeVersion, 3);
  assert.equal((await finance({ action: 'void', version: 2, paymentId: saved.id, reason: '再送' })).status, 200);
  assert.equal(await prisma.paymentRecord.count({ where: { orderId } }), 1);
  assert.equal((await call(`/api/admin/orders/${orderId}`, { method: 'DELETE' })).status, 409);
  const linked = await prisma.order.findUnique({ where: { businessContactId: 'qa-corp-real' } });
  const legacy = await call('/admin/business/qa-corp-real');
  assert.ok(legacy.headers.get('location') === `/admin/orders/${linked.id}` || (await legacy.text()).includes(`/admin/orders/${linked.id}`));
  assert.equal((await call('/api/admin/business/qa-corp-real', { method: 'DELETE' })).status, 409);
  assert.equal(JSON.stringify(await prisma.businessContact.findMany({ where: { id: { not: unlinked.id } }, orderBy: { id: 'asc' } })), before);
  console.log('PASS admin auth, validation, optimistic conflict, parallel retries, immutable cancellation, deletion protection and legacy links');
  const businessBody = { idempotencyKey: crypto.randomUUID(), termsAccepted: true, termsVersion: '2026-10-11', companyName: '新規受付の統合検証用法人', contactName: 'QA担当', email: `${crypto.randomUUID()}@example.invalid`, inquiryType: '歌ってみたMIX・マスタリング', budget: '未定', deadline: '', message: '架空の新規法人受付。元データ・統合案件・通知予約が一度だけ作成されることを確認。' };
  const submit = () => call('/api/business-contact', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(businessBody) });
  const accepted = await submit(); assert.equal(accepted.status, 201);
  const receipt = await accepted.json();
  const replay = await submit(); assert.equal(replay.status, 200); assert.deepEqual(await replay.json(), receipt);
  assert.equal(await prisma.order.count({ where: { businessContactId: receipt.contactId } }), 1);
  assert.equal(await prisma.notificationJob.count({ where: { entityId: receipt.contactId } }), 2);
  const source = await prisma.businessContact.findUnique({ where: { id: receipt.contactId } });
  assert.equal(source.message, businessBody.message); assert.equal(source.status, 'PENDING');
  await prisma.order.update({ where: { businessContactId: receipt.contactId }, data: { isTest: true, isArchived: true } });
  console.log('PASS public business acceptance, atomic canonical order and source, replay without duplicated notifications');
  console.log('QA_ADMIN_CHECK_PASSED');
} finally { await prisma.$disconnect(); }
