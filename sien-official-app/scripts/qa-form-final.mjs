import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import nextEnv from '@next/env';
import { PrismaClient } from '@prisma/client';

// Writes are restricted to the memory-only QA database. The configured database
// is used only to read public plans/options/campaigns, never customer records.
const root = path.resolve(import.meta.dirname, '..');
nextEnv.loadEnvConfig(root, true);
const qa = new PrismaClient({ datasources: { db: { url: 'postgresql://qa:qa@127.0.0.1:55432/qa?sslmode=disable&connection_limit=1&statement_cache_size=0&pgbouncer=true' } } });
const base = 'http://127.0.0.1:3002';
const nativeRequire = createRequire(import.meta.url);
function loader(overrides = {}) {
  const cache = new Map();
  function load(file) {
    if (cache.has(file)) return cache.get(file).exports;
    const compiled = { exports: {} }; cache.set(file, compiled);
    const source = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
    vm.compileFunction(source, ['require', 'module', 'exports'], { filename: file })(name => {
      if (Object.hasOwn(overrides, name)) return overrides[name];
      if (name.startsWith('@/')) return load('src/' + name.slice(2) + '.ts');
      return nativeRequire(name);
    }, compiled, compiled.exports);
    return compiled.exports;
  }
  return load;
}
const load = loader();
const { TERMS_VERSION } = load('src/lib/contract-terms.ts');
const { calculateOrderPrice, priceFromText } = load('src/lib/order-pricing.ts');
const { currentPlanCampaign } = load('src/lib/campaign-pricing.ts');
const { isHumanVocalGuide } = load('src/lib/vocal-guide.ts');
const { INQUIRY_TYPES } = load('src/lib/order-validation.ts');
const results = [];
const acceptedIds = [];
async function post(route, body) {
  const response = await fetch(base + route, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(30000) });
  return { status: response.status, body: await response.json() };
}
function bodyFor(plan, extra = {}) {
  return { clientName: 'QAフォーム最終確認', clientEmail: `qa-final-${randomUUID()}@example.invalid`, serviceType: plan.category, planId: plan.id, contactMethod: 'メール', songTitle: 'QAテスト音源', genre: 'ポップス', lyricsStatus: '未定', vocalGuideStatus: '不要', vocalKey: '±0（原曲キー）', paymentMethod: '銀行振込', optionIds: [], termsAccepted: true, termsVersion: TERMS_VERSION, idempotencyKey: randomUUID(), ...extra };
}
async function accept(name, body, expectedPrice, expectedOptionPrice = 0) {
  const result = await post('/api/orders', body);
  assert.equal(result.status, 201, `${name}: ${JSON.stringify(result)}`);
  const receipt = await qa.submissionReceipt.findUniqueOrThrow({ where: { entityType_entityId: { entityType: result.body.orderId ? 'ORDER' : 'BUSINESS', entityId: result.body.orderId || result.body.contactId } } });
  const order = await qa.order.findUniqueOrThrow({ where: { id: receipt.entityId } });
  assert.equal(order.serviceType, body.serviceType); assert.equal(order.price, expectedPrice); assert.equal(order.optionPrice, expectedOptionPrice);
  assert.equal(receipt.quote.price, expectedPrice); assert.equal(Object.hasOwn(result.body, 'receiptNumber'), false);
  assert.equal(receipt.termsVersion, TERMS_VERSION); assert.ok(receipt.consentedAt);
  assert.equal(await qa.notificationJob.count({ where: { entityId: order.id } }), 2);
  if (body.intent !== 'CONSULTATION') { assert.equal(order.contactMethod, body.contactMethod); assert.equal(order.vocalKey, body.serviceType === 'ORIGINAL' ? '' : body.vocalKey); }
  acceptedIds.push(order.id);
  results.push({ name, passed: true, entityId: receipt.entityId, price: order.price, optionPrice: order.optionPrice });
  return { body, receipt, order };
}
async function drain() {
  for (let i = 0; i < 30; i++) {
    const jobs = await qa.notificationJob.count({ where: { status: { in: ['PENDING', 'PROCESSING'] } } });
    if (!jobs) return;
    const result = await fetch(base + '/api/notifications/process', { headers: { Authorization: 'Bearer qa-only-cron-secret-0123456789-abcdefgh' }, signal: AbortSignal.timeout(30000) });
    assert.equal(result.status, 200);
  }
  throw new Error('QA_NOTIFICATION_DRAIN_INCOMPLETE');
}
try {
  assert.match((await qa.siteSetting.findUniqueOrThrow({ where: { id: 'default' } })).announcement, /QA隔離環境/);
  const liveReadOnly = new PrismaClient();
  let plans, options, campaigns;
  try {
    [plans, options, campaigns] = await Promise.all([
      liveReadOnly.plan.findMany({ where: { isActive: true }, orderBy: { orderIndex: 'asc' } }),
      liveReadOnly.option.findMany({ where: { isActive: true } }),
      liveReadOnly.campaign.findMany({ where: { isActive: true } }),
    ]);
  } finally { await liveReadOnly.$disconnect(); }
  assert.ok(plans.length > 0, 'No active public plans');
  for (const plan of plans) await qa.plan.upsert({ where: { id: plan.id }, create: plan, update: plan });
  for (const option of options) await qa.option.upsert({ where: { id: option.id }, create: option, update: option });
  for (const campaign of campaigns) await qa.campaign.upsert({ where: { id: campaign.id }, create: campaign, update: campaign });
  results.push({ name: 'Read-only public catalogue copied into isolated QA database', passed: true, plans: plans.length, options: options.length, campaigns: campaigns.length });
  for (const plan of plans) {
    const price = currentPlanCampaign(plan.id, campaigns)?.campaignPrice ?? plan.price;
    await accept(`${plan.category}: ${plan.name}`, bodyFor(plan), price);
  }
  const mix = plans.find(plan => plan.category === 'MIX');
  const original = plans.find(plan => plan.category === 'ORIGINAL');
  assert.ok(mix && original);
  for (const guide of options.filter(option => option.category === 'MIX' && option.name.includes('ボーカルガイド'))) {
    const price = priceFromText(guide.priceText);
    await accept(`GUIDE: ${guide.name}`, bodyFor({ id: guide.id, category: 'GUIDE' }), /[〜～~]|要相談/.test(guide.priceText) ? null : price);
  }
  for (const option of options) {
    const plan = option.category === 'ORIGINAL' ? original : mix;
    const quantities = option.name.includes('カットアップ') ? { [option.id]: 3 } : {};
    const estimate = calculateOrderPrice({ price: currentPlanCampaign(plan.id, campaigns)?.campaignPrice ?? plan.price, hasConsultation: plan.price === null }, [option], quantities);
    await accept(`Option: ${option.name}`, bodyFor(plan, { optionIds: [option.id], optionQuantities: quantities, ...(isHumanVocalGuide(option) ? { vocalGuideStatus: '人間による仮歌' } : {}) }), estimate.hasConsultation ? null : estimate.total, estimate.optionPrice);
  }
  const mixPrice = currentPlanCampaign(mix.id, campaigns)?.campaignPrice ?? mix.price;
  for (const [contactMethod, fields] of [['メール', {}], ['Discord', { discordId: 'qa_test_only' }], ['X (DM)', { twitterId: '@qa_test_only' }]]) {
    await accept(`Contact method: ${contactMethod}`, bodyFor(mix, { contactMethod, vocalKey: '-3', ...fields }), mixPrice);
  }
  for (const paymentMethod of ['銀行振込', 'クレジットカード', 'その他']) await accept(`Payment: ${paymentMethod}, key +2`, bodyFor(mix, { paymentMethod, vocalKey: '+2' }), mixPrice);
  for (const serviceType of ['MIX', 'ORIGINAL', 'GUIDE']) await accept(`Consultation: ${serviceType}`, bodyFor({ id: '', category: serviceType }, { intent: 'CONSULTATION', message: 'QA無料相談・契約なし' }), null);
  for (const inquiryType of INQUIRY_TYPES) {
    const body = { companyName: 'QAテスト法人', contactName: 'QAテスト担当', email: `qa-final-${randomUUID()}@example.invalid`, inquiryType, message: 'QA法人フォーム確認・対応不要', termsAccepted: true, termsVersion: TERMS_VERSION, idempotencyKey: randomUUID() };
    const result = await post('/api/business-contact', body); assert.equal(result.status, 201, JSON.stringify(result));
    const receipt = await qa.submissionReceipt.findUniqueOrThrow({ where: { entityType_entityId: { entityType: result.body.orderId ? 'ORDER' : 'BUSINESS', entityId: result.body.orderId || result.body.contactId } } });
    const record = await qa.businessContact.findUniqueOrThrow({ where: { id: receipt.entityId } });
    assert.equal(record.inquiryType, inquiryType); assert.equal(record.email, body.email);
    assert.equal(await qa.notificationJob.count({ where: { entityId: record.id } }), 2); acceptedIds.push(record.id);
    results.push({ name: `Business: ${inquiryType}`, passed: true, entityId: receipt.entityId });
  }
  const repeatBody = bodyFor(mix);
  const concurrent = await Promise.all([post('/api/orders', repeatBody), post('/api/orders', repeatBody)]);
  assert.ok(concurrent.every(result => [200, 201].includes(result.status)), JSON.stringify(concurrent));
  assert.equal(concurrent[0].body.orderId, concurrent[1].body.orderId);
  assert.equal(await qa.order.count({ where: { clientEmail: repeatBody.clientEmail } }), 1);
  assert.equal((await post('/api/orders', { ...repeatBody, message: '変更' })).status, 409);
  results.push({ name: 'Concurrent double submission has one record/receipt; changed replay rejected', passed: true });
  for (const extra of [{ termsAccepted: false }, { termsVersion: 'old' }, { contactMethod: 'Discord', discordId: '' }, { contactMethod: 'X (DM)', twitterId: '' }, { contactMethod: 'X (DM)', twitterId: 'bad id' }, { clientEmail: 'bad' }, { vocalKey: '-9' }, { optionIds: ['unknown'] }, { referenceUrl: 'javascript:alert(1)' }]) {
    const body = bodyFor(mix, extra); const result = await post('/api/orders', body);
    assert.ok([400, 409].includes(result.status), JSON.stringify(result));
    assert.equal(await qa.order.count({ where: { clientEmail: body.clientEmail } }), 0);
  }
  results.push({ name: 'Nine invalid input/consent cases rejected without saving', passed: true });
  await drain();
  const jobs = await qa.notificationJob.findMany({ where: { entityId: { in: acceptedIds } } });
  assert.equal(jobs.length, acceptedIds.length * 2);
  assert.ok(jobs.every(job => job.status === 'DELIVERED' && job.attempts === 1));
  const captures = await (await fetch('http://127.0.0.1:55433/captures')).json();
  assert.ok(captures.mail.length >= acceptedIds.length && captures.webhook.length >= acceptedIds.length);
  assert.ok(captures.webhook.every(body => !body.includes('受付番号')));
  results.push({ name: 'Every accepted form saved consent and delivered one admin SMTP message plus one detailed Discord webhook to local captures', passed: true, submissions: acceptedIds.length, jobs: jobs.length });
} finally {
  await qa.$disconnect();
  const report = { testedAt: new Date().toISOString(), isolated: true, base, results };
  fs.writeFileSync(path.resolve(root, '../audit/forms-final-2026-10-11.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}
