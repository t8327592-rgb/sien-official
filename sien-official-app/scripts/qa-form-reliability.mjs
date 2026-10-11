import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';
import path from 'node:path';

const base = 'http://127.0.0.1:3002';
const capturesUrl = 'http://127.0.0.1:55433';
const qa = new PrismaClient({ datasources: { db: { url: 'postgresql://qa:qa@127.0.0.1:55432/qa?sslmode=disable&connection_limit=1&statement_cache_size=0&pgbouncer=true' } } });
const cookies = new Map();
const results = [];
async function call(route, init = {}) {
  const response = await fetch(base + route, { ...init, redirect: 'manual', headers: { Origin: base, Cookie: [...cookies].map(([key, value]) => `${key}=${value}`).join('; '), ...init.headers }, signal: AbortSignal.timeout(30000) });
  for (const cookie of response.headers.getSetCookie()) { const [key, value] = cookie.split(';')[0].split(/=(.*)/s); cookies.set(key, value); }
  return response;
}
try {
  assert.match((await qa.siteSetting.findUniqueOrThrow({ where: { id: 'default' } })).announcement, /QA隔離環境/);
  const csrf = await (await call('/api/auth/csrf')).json();
  await call('/api/auth/callback/credentials', { method: 'POST', body: new URLSearchParams({ csrfToken: csrf.csrfToken, username: 'qa-admin', password: 'qa-only-password', callbackUrl: base + '/admin', json: 'true' }) });
  assert.equal((await call('/admin')).status, 200);
  results.push({ name: 'QA administrator login', passed: true });
  for (const [clientName, expected] of [
    ['QAブラウザ正式依頼', { price: 16000, vocalKey: '-3', contactMethod: 'Discord', discordId: 'qa_test_only', paymentMethod: 'クレジットカード' }],
    ['QAブラウザオリジナル', { price: null, vocalGuideStatus: '人間による仮歌' }],
    ['QAブラウザ無料相談', { planId: '無料相談', serviceType: 'ORIGINAL', price: null }],
    ['QAブラウザ単独ガイド', { serviceType: 'GUIDE', price: 3000, vocalKey: '+2' }],
    ['QAブラウザ5本セット', { planId: 'ショートMIX 5本セット', price: 20000 }],
  ]) {
    const order = await qa.order.findFirstOrThrow({ where: { clientName } });
    for (const [field, value] of Object.entries(expected)) assert.equal(order[field], value);
    const receipt = await qa.submissionReceipt.findUniqueOrThrow({ where: { entityType_entityId: { entityType: 'ORDER', entityId: order.id } } });
    const response = await call('/admin/orders/' + order.id); assert.equal(response.status, 200);
    const html = await response.text(); assert.ok(html.includes(clientName) && html.includes(receipt.receiptNumber));
    assert.equal(await qa.notificationJob.count({ where: { entityId: order.id, status: 'DELIVERED' } }), 3);
    results.push({ name: `Browser form persisted and visible in admin: ${clientName}`, passed: true, receipt: receipt.receiptNumber });
  }
  const business = await qa.businessContact.findFirstOrThrow({ where: { companyName: 'QAブラウザテスト法人' } });
  const businessReceipt = await qa.submissionReceipt.findUniqueOrThrow({ where: { entityType_entityId: { entityType: 'BUSINESS', entityId: business.id } } });
  const businessPage = await call('/admin/business/' + business.id);
  assert.equal(businessPage.status, 200); assert.ok((await businessPage.text()).includes(businessReceipt.receiptNumber));
  assert.equal(await qa.notificationJob.count({ where: { entityId: business.id, status: 'DELIVERED' } }), 3);
  results.push({ name: 'Browser business form persisted and visible in admin', passed: true, receipt: businessReceipt.receiptNumber });
  const before = await (await fetch(capturesUrl + '/captures')).json();
  await fetch(capturesUrl + '/fail-webhook', { method: 'POST' });
  const body = { clientName: 'QA通知障害確認', clientEmail: `qa-failure-${randomUUID()}@example.invalid`, serviceType: 'MIX', planId: 'qa-mix', songTitle: 'QA', contactMethod: 'メール', paymentMethod: '銀行振込', vocalKey: '±0（原曲キー）', optionIds: [], termsAccepted: true, termsVersion: '2026-10-01', idempotencyKey: randomUUID() };
  const submitted = await call('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  assert.equal(submitted.status, 201); const accepted = await submitted.json();
  const receipt = await qa.submissionReceipt.findUniqueOrThrow({ where: { receiptNumber: accepted.receiptNumber } });
  // Read requests let the real after() callback finish without manually running
  // the worker; this verifies first-attempt delivery belongs to form submission.
  let jobs;
  for (let attempt = 0; attempt < 30; attempt++) {
    jobs = await qa.notificationJob.findMany({ where: { entityId: receipt.entityId } });
    if (jobs.every(job => ['DELIVERED', 'FAILED'].includes(job.status))) break;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.equal(jobs.filter(job => job.status === 'DELIVERED').length, 2);
  const failed = jobs.find(job => job.kind === 'ORDER_DISCORD'); assert.equal(failed.status, 'FAILED');
  assert.ok(await qa.order.findUnique({ where: { id: receipt.entityId } }));
  const replay = await call('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  assert.equal((await replay.json()).receiptNumber, receipt.receiptNumber);
  assert.equal(await qa.order.count({ where: { clientEmail: body.clientEmail } }), 1);
  const afterFailure = await (await fetch(capturesUrl + '/captures')).json();
  assert.equal(afterFailure.mail.length - before.mail.length, 2); assert.equal(afterFailure.webhook.length, before.webhook.length);
  results.push({ name: 'Discord 503 preserves order/receipt, delivers emails, records failure, replay does not duplicate', passed: true });
  await fetch(capturesUrl + '/fail-webhook', { method: 'DELETE' });
  const retried = await call('/api/admin/notifications/' + failed.id + '/retry', { method: 'POST' });
  assert.equal(retried.status, 200); assert.equal((await retried.json()).status, 'DELIVERED');
  const afterRetry = await (await fetch(capturesUrl + '/captures')).json();
  assert.equal(afterRetry.mail.length, afterFailure.mail.length); assert.equal(afterRetry.webhook.length - afterFailure.webhook.length, 1);
  assert.equal((await call('/api/admin/notifications/' + failed.id + '/retry', { method: 'POST' })).status, 409);
  results.push({ name: 'Individual retry delivers failed Discord once without resending delivered emails', passed: true });
} finally {
  await fetch(capturesUrl + '/fail-webhook', { method: 'DELETE' }).catch(() => {});
  await qa.$disconnect();
  const report = { testedAt: new Date().toISOString(), isolated: true, results };
  fs.writeFileSync(path.resolve(import.meta.dirname, '../../audit/forms-reliability-2026-10-11.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}
