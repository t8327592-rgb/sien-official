import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { load } from './helpers/load-ts.mjs';
import { estimateFixtures } from './fixtures/estimates.mjs';
const root = path.resolve(import.meta.dirname, '..');
const { estimateTotals, validateEstimate, sameEstimateClient, estimateMessage } = load(path.join(root, 'src/lib/estimates.ts'));
const { createEstimateDraft } = load(path.join(root, 'src/lib/estimate-draft.ts'));
const { salePrice } = load(path.join(root, 'src/config/autumn-sale.ts'));
const draft = () => { const f = estimateFixtures(); return createEstimateDraft(f.orders, f.plans, f.receipts, 'EST-QA', new Date('2026-11-24T01:00:00Z')); };
test('11 songs: 110000 + 20000 - 26000 = 104000, source rows unchanged', () => {
  const f = estimateFixtures(), before = JSON.stringify(f);
  const { content, warnings } = createEstimateDraft(f.orders, f.plans, f.receipts, 'EST-QA');
  assert.deepEqual(estimateTotals(validateEstimate(content)), { base: 110000, options: 20000, subtotal: 130000, eligible: 130000, discount: 26000, total: 104000 });
  assert.equal(warnings.length, 0); assert.equal(JSON.stringify(f), before);
  assert.match(estimateMessage(content), /全11曲/); assert.match(estimateMessage(content), /104,000円/);
});
test('Single song, no options, no discount, multiple options and quantity', () => {
  const content = draft().content; content.lines = content.lines.filter(line => line.orderId === 'qa-estimate-order-0');
  content.discount = { ...content.discount, value: 0, lineIds: [] };
  assert.equal(estimateTotals(validateEstimate(content)).total, 10000);
  content.lines.push({ ...content.lines[0], id: 'opt-a', kind: 'OPTION', name: 'カットアップ', quantity: 6, unitPrice: 2000 }, { ...content.lines[0], id: 'opt-b', kind: 'OPTION', name: 'ライブ音源', quantity: 1, unitPrice: 1000 });
  assert.equal(estimateTotals(content).options, 13000);
});
test('Fixed and selected discounts; fractional percentages; reject overdiscounts', () => {
  const c = draft().content;
  c.discount = { ...c.discount, mode: 'FIXED', value: 3000, target: 'OPTION', lineIds: [] };
  assert.equal(estimateTotals(c).total, 127000);
  c.discount = { ...c.discount, mode: 'PERCENT', value: 12.34, target: 'SELECTED', lineIds: [c.lines[0].id] };
  assert.equal(estimateTotals(c).discount, 1234);
  c.discount.value = 100; assert.equal(estimateTotals(c).discount, 10000);
  c.discount.mode = 'FIXED'; c.discount.value = 10001; assert.throws(() => validateEstimate(c));
});
test('Rounding matches existing salePrice, including odd yen and large totals', () => {
  const c = draft().content; c.lines = [c.lines[0]]; c.discount.lineIds = [];
  for (const amount of [0, 1, 2, 3, 7, 999, 10001, 99999999]) {
    c.lines[0].unitPrice = amount; assert.equal(estimateTotals(c).total, salePrice(amount));
  }
  c.lines = [{ ...c.lines[0], id: 'a', orderId: 'a', unitPrice: 3 }, { ...c.lines[0], id: 'b', orderId: 'b', unitPrice: 7 }];
  assert.equal(estimateTotals(c).total, salePrice(3) + salePrice(7));
});
test('Client identity rejects mixed clients, blank emails, namesakes, companies, tests', () => {
  const { orders } = estimateFixtures(); assert.equal(sameEstimateClient(orders), true);
  assert.equal(sameEstimateClient([orders[0], { ...orders[1], clientEmail: ' ESTIMATE-FIXTURE@EXAMPLE.INVALID ' }]), true);
  for (const difference of [{ clientEmail: '' }, { clientEmail: 'other@example.invalid' }, { clientName: '別人' }, { companyName: '別会社' }, { customerType: 'BUSINESS' }, { isTest: true }]) assert.equal(sameEstimateClient([orders[0], { ...orders[1], ...difference }]), false);
});
test('Consultation options and encoding retain the existing calculation and prompt review', () => {
  const f = estimateFixtures(), receipt = f.receipts[0];
  receipt.quote.plan.price = 5000; receipt.quote.hasConsultation = true;
  receipt.quote.options = [{ id: 'consult', name: '相談加工', priceText: '5,000円・要相談', quantity: 1 }, { id: 'encode', name: 'エンコード', priceText: '0円〜1,000円', quantity: 1 }];
  const d = createEstimateDraft([f.orders[0]], f.plans, [receipt], 'QA');
  assert.equal(estimateTotals(validateEstimate(d.content)).total, 6000);
  assert.equal(d.content.lines.find(line => line.name === 'エンコード').unitPrice, 1000);
  assert.equal(d.content.discount.value, 0); assert.ok(d.warnings.some(warning => warning.includes('相談料金')));
});
test('Do not apply sale outside order dates, without receipt, or with unverifiable totals', () => {
  for (const override of [{ createdAt: new Date('2026-11-20T14:59:59Z') }, { createdAt: new Date('2026-11-30T15:00:00Z') }, { serviceType: 'ORIGINAL' }]) {
    const f = estimateFixtures(); const c = createEstimateDraft([{ ...f.orders[0], ...override }], f.plans, f.receipts, 'QA').content;
    assert.equal(estimateTotals(c).discount, 0);
  }
  const f = estimateFixtures();
  const legacy = createEstimateDraft([f.orders[1]], f.plans, [], 'QA');
  assert.equal(estimateTotals(legacy.content).total, f.orders[1].price); assert.equal(legacy.content.discount.value, 0); assert.equal(legacy.warnings.length, 1);
  f.receipts[0].quote.autumnSale.normalTotal = 999;
  assert.equal(createEstimateDraft([f.orders[0]], f.plans, f.receipts, 'QA').content.discount.value, 0);
});
test('Japanese long titles, many songs, immutable snapshots after plan changes', () => {
  const c = draft().content, json = JSON.stringify(c), f = estimateFixtures(); f.plans[0].price = 999999;
  assert.equal(JSON.stringify(c), json);
  c.lines = Array.from({ length: 100 }, (_, index) => ({ ...c.lines[0], id: `line-${index}`, orderId: `order-${index}`, songTitle: '長い日本語の楽曲名'.repeat(20) }));
  c.discount.lineIds = [];
  assert.equal(validateEstimate(c).lines.length, 100); assert.equal(estimateTotals(c).total, 800000);
});
test('Validation rejects bad dates, duplicate IDs, invalid amounts, unknown discount IDs', () => {
  for (const alter of [c => c.issuedOn = '2026-02-30', c => c.validUntil = '2026-01-01', c => c.lines[0].unitPrice = -1, c => c.lines[0].quantity = 1.5, c => c.lines[0].quantity = 0, c => c.discount.value = 100.01, c => c.discount.value = .001, c => c.discount.value = NaN, c => c.lines.push(c.lines[0]), c => c.discount.lineIds = ['unknown'], c => c.clientName = '', c => c.lines = [], c => c.lines[0].unitPrice = 2147483647]) {
    const c = draft().content; alter(c); assert.throws(() => validateEstimate(c));
  }
});
test('Additive migration preserves legacy finance; links restrict deletion; revision uniqueness', async () => {
  const db = await PGlite.create();
  try {
    await db.exec(`CREATE TABLE "Order" (id text primary key, "confirmedPrice" int); INSERT INTO "Order" VALUES ('legacy',104000); CREATE TABLE "PaymentRecord" (id text, amount int); INSERT INTO "PaymentRecord" VALUES ('paid',50000);`);
    const before = await db.query('SELECT * FROM "Order"');
    const sql = fs.readFileSync(path.join(root, 'prisma/migrations/202611240001_estimates/migration.sql'), 'utf8');
    assert.doesNotMatch(sql, /\b(?:ALTER|UPDATE|DELETE|DROP|TRUNCATE)\s+(?:TABLE|FROM|"Order")/i);
    await db.exec(sql);
    await db.query(`INSERT INTO "Estimate" (id,"seriesId",revision,"requestKey","payloadHash",content) VALUES ('e','s',1,'key','hash',$1)`, [draft().content]);
    await db.exec(`INSERT INTO "EstimateOrder" VALUES ('e','legacy')`);
    assert.deepEqual(await db.query('SELECT * FROM "Order"'), before);
    assert.equal((await db.query('SELECT SUM(amount) AS total FROM "PaymentRecord"')).rows[0].total, 50000);
    await assert.rejects(db.exec(`DELETE FROM "Order" WHERE id='legacy'`));
    await assert.rejects(db.exec(`INSERT INTO "Estimate" (id,"seriesId",revision,"requestKey","payloadHash",content) VALUES ('e2','s',1,'key2','hash','{}')`));
  } finally { await db.close(); }
});
