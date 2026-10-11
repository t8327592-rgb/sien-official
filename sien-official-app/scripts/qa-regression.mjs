import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';
import path from 'node:path';

// Fixed loopback endpoints and synthetic fixtures; never accepts a live URL.
const base = 'http://127.0.0.1:3002';
const prisma = new PrismaClient({ datasources: { db: { url: 'postgresql://qa:qa@127.0.0.1:55432/qa?sslmode=disable&connection_limit=1&statement_cache_size=0&pgbouncer=true' } } });
const results = [];
const orderBody = extra => ({ clientName: 'QA回帰確認', clientEmail: `qa-${randomUUID()}@example.invalid`, serviceType: 'MIX', planId: 'qa-mix', songTitle: 'QAテスト', contactMethod: 'メール', paymentMethod: '銀行振込', vocalKey: '±0（原曲キー）', optionIds: [], termsAccepted: true, termsVersion: '2026-10-11', idempotencyKey: randomUUID(), ...extra });
async function post(url, body) {
  const response = await fetch(base + url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(30000) });
  return { status: response.status, body: await response.json() };
}
async function accepted(name, body, expectedPrice, optionPrice = 0) {
  const response = await post('/api/orders', body);
  assert.equal(response.status, 201, JSON.stringify(response));
  const receipt = await prisma.submissionReceipt.findUnique({ where: { entityType_entityId: { entityType: 'ORDER', entityId: response.body.orderId } } });
  const order = await prisma.order.findUnique({ where: { id: receipt.entityId } });
  assert.equal(order.price, expectedPrice); assert.equal(order.optionPrice, optionPrice);
  assert.equal(receipt.quote.price, expectedPrice); assert.equal(Object.hasOwn(response.body, 'receiptNumber'), false);
  assert.equal(receipt.termsVersion, '2026-10-11'); assert.ok(receipt.consentedAt);
  assert.equal(await prisma.notificationJob.count({ where: { entityId: order.id } }), 2);
  results.push({ name, passed: true, entityId: receipt.entityId, price: order.price, basePrice: order.basePrice, optionPrice: order.optionPrice });
  return response;
}
try {
  assert.match((await prisma.siteSetting.findUnique({ where: { id: 'default' } })).announcement, /QA隔離環境/);
  await accepted('MIX ignores forged final price', orderBody({ price: 1, basePrice: 1, options: '偽オプション' }), 10000);
  await accepted('Cut-up three units', orderBody({ optionIds: ['qa-cut'], optionQuantities: { 'qa-cut': 3 } }), 16000, 6000);
  await accepted('Zero yen plan remains zero', orderBody({ planId: 'qa-free' }), 0);
  await accepted('Single guide service', orderBody({ serviceType: 'GUIDE', planId: 'qa-vocal' }), 3000);
  await accepted('Human vocal guide is quoted separately', orderBody({ serviceType: 'ORIGINAL', planId: 'qa-original', genre: 'ポップス', vocalGuideStatus: '人間による仮歌', optionIds: ['qa-guide'] }), null, 5000);
  await accepted('Consultation has no final price', orderBody({ intent: 'CONSULTATION', planId: '', message: 'プラン未定の相談' }), null);
  const concurrent = orderBody();
  const responses = await Promise.all([post('/api/orders', concurrent), post('/api/orders', concurrent)]);
  assert.ok(responses.every(response => [200, 201].includes(response.status)));
  assert.equal(responses[0].body.orderId, responses[1].body.orderId);
  assert.equal(await prisma.order.count({ where: { clientEmail: concurrent.clientEmail } }), 1);
  const replay = await post('/api/orders', concurrent); assert.equal(replay.body.orderId, responses[0].body.orderId);
  const conflict = await post('/api/orders', { ...concurrent, message: '受付後の変更' });
  assert.equal(conflict.status, 409); assert.equal(conflict.body.code, 'IDEMPOTENCY_CONFLICT', JSON.stringify(conflict));
  results.push({ name: 'Concurrent submit, replay and conflict', passed: true });
  for (const extra of [{ termsAccepted: false }, { planId: 'qa-original' }, { referenceUrl: 'javascript:alert(1)' }, { optionIds: ['not-real'] }, { optionIds: ['qa-cut'], optionQuantities: { 'qa-cut': -1 } }]) {
    const body = orderBody(extra); const response = await post('/api/orders', body);
    assert.equal(response.status, 400, JSON.stringify(response)); assert.equal(await prisma.order.count({ where: { clientEmail: body.clientEmail } }), 0);
  }
  results.push({ name: 'Five invalid submissions rejected before saving', passed: true });
  const business = { companyName: 'QA法人', contactName: 'QA担当', email: `qa-${randomUUID()}@example.invalid`, inquiryType: 'お見積りのご依頼', message: 'QAお問い合わせ', termsAccepted: true, termsVersion: '2026-10-11', idempotencyKey: randomUUID() };
  const contact = await post('/api/business-contact', business); assert.equal(contact.status, 201);
  const contactReceipt = await prisma.submissionReceipt.findUnique({ where: { entityType_entityId: { entityType: 'BUSINESS', entityId: contact.body.contactId } } });
  assert.equal(contactReceipt.entityType, 'BUSINESS'); assert.equal(await prisma.businessContact.count({ where: { email: business.email } }), 1);
  results.push({ name: 'Corporate contact receipt and persistence', passed: true });
  const admin = await fetch(base + '/api/admin/reviews', { redirect: 'manual' }); assert.equal(admin.status, 401);
  results.push({ name: 'Anonymous management API returns 401', passed: true });
  const worker = await fetch(base + '/api/notifications/process', { headers: { Authorization: 'Bearer qa-only-cron-secret-0123456789-abcdefgh' } }); assert.equal(worker.status, 200);
  const captures = await (await fetch('http://127.0.0.1:55433/captures')).json();
  assert.ok(captures.mail.length >= 2 && captures.webhook.length >= 1);
  assert.ok(captures.webhook.every(text => !text.includes('受付番号')));
  results.push({ name: 'Worker and captured SMTP/Webhook', passed: true, mails: captures.mail.length, webhooks: captures.webhook.length });
} finally {
  await prisma.$disconnect();
  const report = { testedAt: new Date().toISOString(), base, isolated: true, results };
  fs.writeFileSync(path.resolve(import.meta.dirname, '../../audit/final-api-regression.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}
