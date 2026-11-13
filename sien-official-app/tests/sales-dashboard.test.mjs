import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { PGlite } from '@electric-sql/pglite';
import { createRequire } from 'node:module';

const testModule = { exports: {} };
const compiled = ts.transpileModule(fs.readFileSync(new URL('../src/lib/sales-dashboard.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
vm.runInThisContext('(function(module,exports){' + compiled + '\n})')(testModule, testModule.exports);
const { buildSalesState, salesSummary, salesPairHash } = testModule.exports;
const direct = (over = {}) => ({ id: 'd', orderId: 'o', clientName: '依頼者', songTitle: '楽曲', customerType: 'PERSONAL', kind: 'RECEIPT', date: '2026-11-01', amount: 7000, fee: 2000, withholding: 1000, grossReference: 10000, hash: 'direct-v1', ...over });
const px = (over = {}) => ({ id: 'p', clientName: '依頼者', songTitle: '楽曲', sentOn: '2026-11-02', gross: 10000, fee: 2000, withholding: 1000, net: 7000, paymentStatus: '送金済み', hash: 'px-v1', revenueOn: null, accountingVersion: 0, accountingCurrent: false, ...over });
const data = (d = [direct()], p = [px()], r = [], rr = []) => ({ direct: d, px: p, cashReviews: r, revenueReviews: rr });
const review = (d, p, mode = 'CASH', over = {}) => ({ directId: d.id, pxEntryId: p.id, status: 'DUPLICATE', amount: 7000, fee: 2000, withholding: 1000, sourceHash: salesPairHash(mode, d, p), reason: '確認済み', version: 1, ...over });
const total = state => salesSummary(state.events, 2026).total;

test('Unreviewed cross-channel candidates hold direct cash; no automatic merge or source mutation', () => {
  const input = data(), before = JSON.stringify(input), s = buildSalesState(input, 'CASH');
  assert.equal(s.held.length, 1); assert.equal(s.pairs[0].state, 'PENDING'); assert.equal(total(s).total, 7000);
  assert.equal(JSON.stringify(input), before);
});
test('Distinct confirmation restores both sources; duplicate removes only allocated components', () => {
  const d = direct(), p = px();
  const distinct = buildSalesState(data([d], [p], [review(d, p, 'CASH', { status: 'DISTINCT', amount: 0, fee: 0, withholding: 0 })]), 'CASH');
  assert.equal(total(distinct).total, 14000); assert.equal(distinct.held.length, 0);
  const partial = buildSalesState(data([d], [p], [review(d, p, 'CASH', { amount: 3000, fee: 500, withholding: 100 })]), 'CASH');
  assert.equal(total(partial).total, 11000); assert.equal(total(partial).fee, 3500); assert.equal(total(partial).withholding, 1900);
  const full = buildSalesState(data([d], [p], [review(d, p)]), 'CASH');
  assert.equal(full.events.length, 1); assert.equal(total(full).total, 7000);
});
test('Additional fee rows stay separate; every candidate must be reviewed', () => {
  const d = direct(), p = px(), extra = px({ id: 'extra', gross: 1000, net: 500, fee: 200, withholding: 100 });
  const input = data([d], [p, extra], [review(d, p)]);
  assert.equal(buildSalesState(input, 'CASH').held.length, 1);
  input.cashReviews.push(review(d, extra, 'CASH', { status: 'DISTINCT', amount: 0, fee: 0, withholding: 0 }));
  const s = buildSalesState(input, 'CASH'); assert.equal(s.held.length, 0); assert.equal(total(s).total, 7500);
});
test('Stale source confirmations and overallocations fail safely; allocation caps apply to both sides', () => {
  const d = direct(), p = px(), r = review(d, p);
  for (const [ds, ps, rs] of [
    [[direct({ hash: 'edited' })], [p], [r]], [[d], [px({ hash: 'edited' })], [r]],
    [[d], [p], [{ ...r, amount: 7001 }]], [[d], [p], [{ ...r, fee: 2001 }]],
    [[d], [p], [{ ...r, amount: -1 }]],
    [[d, direct({ id: 'd2' })], [p], [review(d, p), review(direct({ id: 'd2' }), p)]],
  ]) {
    const s = buildSalesState(data(ds, ps, rs), 'CASH'); assert.ok(s.held.length); assert.ok(s.pairs.every(p => p.state === 'STALE'));
  }
});
test('Receipt and refund dates, year boundaries, zero amounts and source sums are preserved', () => {
  const d = direct({ clientName: '別人', songTitle: '別曲', grossReference: 20000 });
  const s = buildSalesState(data([d, direct({ id: 'refund', kind: 'REFUND', amount: -500, fee: -50, withholding: -10 }), direct({ id: 'zero', clientName: '他人', songTitle: '', amount: 0, fee: 0, withholding: 0 }), direct({ id: 'prior', date: '2025-12-31', clientName: '他人', songTitle: '' })], [px()]), 'CASH');
  assert.equal(total(s).total, 13500); assert.equal(total(s).count, 4);
  const all = salesSummary(s.events, 2026, 11).total, a = salesSummary(s.events, 2026, 11, 'DIRECT').total, b = salesSummary(s.events, 2026, 11, 'PXSTUDIO').total;
  for (const k of ['total', 'fee', 'withholding', 'count']) assert.equal(all[k], a[k] + b[k]);
  assert.equal(salesSummary(s.events, 2026, 10).total.total, 0); assert.equal(salesSummary(s.events, 2025).total.total, 7000);
});
test('Revenue never infers dates from settlement and excludes unknown amount/date separately', () => {
  const d = direct({ kind: 'SALE', amount: 10000, fee: 0, withholding: 0, date: '2026-10-31', clientName: '別人', songTitle: '' });
  const input = data([d, direct({ id: 'unknown', kind: 'SALE', date: null }), direct({ id: 'noamount', kind: 'SALE', amount: null })], [px()]);
  const s = buildSalesState(input, 'REVENUE'); assert.equal(s.unknown.length, 3); assert.equal(total(s).total, 10000); assert.equal(salesSummary(s.events, 2026, 11).total.total, 0);
  input.px[0] = px({ revenueOn: '2025-12-31', accountingCurrent: true, accountingVersion: 1 });
  assert.equal(salesSummary(buildSalesState(input, 'REVENUE').events, 2025).total.total, 10000);
  input.px[0].accountingCurrent = false; assert.equal(buildSalesState(input, 'REVENUE').unknown.length, 3);
});
test('Unpaid settlements are separated; only explicitly confirmed accounting dates allow revenue dedup', () => {
  const d = direct({ kind: 'SALE', amount: 10000, fee: 0, withholding: 0 }), p = px({ paymentStatus: '送金待ち' });
  assert.equal(buildSalesState(data([], [p]), 'CASH').unknown.length, 1);
  const s = buildSalesState(data([d], [p], [], [review(d, p, 'REVENUE', { amount: 10000, fee: 0, withholding: 0 })]), 'REVENUE');
  assert.equal(s.pairs[0].state, 'STALE'); assert.equal(s.held.length, 1);
});
test('Manual pairs outside suggestions persist and pending reset is reversible', () => {
  const d = direct({ clientName: '別人', songTitle: '別曲', grossReference: 12345 }), p = px();
  assert.equal(buildSalesState(data([d], [p]), 'CASH').pairs.length, 0);
  const s = buildSalesState(data([d], [p], [review(d, p, 'CASH', { status: 'PENDING', amount: 0, fee: 0, withholding: 0 })]), 'CASH');
  assert.equal(s.held.length, 1); assert.match(s.pairs[0].reasons[0], /手動/);
});
test('Additive migration preserves all legacy rows and source tables', async () => {
  const db = await PGlite.create();
  try {
    await db.exec('CREATE TABLE "Order" (id text primary key, amount int); INSERT INTO "Order" VALUES (\'legacy\',123); CREATE TABLE "PxEntry" (id text primary key, amount int); INSERT INTO "PxEntry" VALUES (\'px\',456);');
    const before = await db.query('SELECT * FROM "Order" UNION ALL SELECT * FROM "PxEntry"');
    const sql = fs.readFileSync(new URL('../prisma/migrations/20261113090000_sales_dashboard_metadata/migration.sql', import.meta.url), 'utf8');
    assert.doesNotMatch(sql, /\b(?:ALTER|UPDATE|DELETE|DROP|TRUNCATE)\b/i); await db.exec(sql);
    assert.deepEqual(await db.query('SELECT * FROM "Order" UNION ALL SELECT * FROM "PxEntry"'), before);
    assert.equal((await db.query('SELECT COUNT(*)::int AS count FROM "SalesReviewAudit"')).rows[0].count, 0);
  } finally { await db.close(); }
});

test('Source projection uses JST, excludes tests/voids at query time, preserves canceled cash and unknown revenue', async () => {
  const require = createRequire(import.meta.url), cache = new Map();
  function load(file) {
    if (cache.has(file)) return cache.get(file).exports;
    const mod = { exports: {} }; cache.set(file, mod);
    const out = ts.transpileModule(fs.readFileSync(new URL('../' + file, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    const resolve = name => name === '@/lib/prisma' ? { prisma: {} } : name.startsWith('@/') ? load('src/' + name.slice(2) + '.ts') : require(name);
    vm.runInThisContext('(function(require,module,exports){' + out + '\n})')(resolve, mod, mod.exports);
    return mod.exports;
  }
  const { loadSalesData } = load('src/lib/sales-data.ts');
  const entry = { ...px(), version: 1, fingerprint: 'original', category: 'MIX', rawCells: [] };
  let accounting = [], reviews = [];
  const baseOrder = { id: 'order', companyName: '法人名', clientName: '担当者', songTitle: '曲', customerType: 'BUSINESS', financeVersion: 0, status: 'CANCELED', isTest: false, confirmedPrice: 99999, revenueAt: new Date('2026-10-31T15:00:00Z'), payments: [{ id: 'payment', kind: 'RECEIPT', amount: 1000, fee: 100, withholding: 200, paidAt: new Date('2026-10-31T15:00:00Z') }, { id: 'refund', kind: 'REFUND', amount: 500, fee: 0, withholding: 0, paidAt: new Date('2026-11-01T00:00:00Z') }] };
  const db = { order: { findMany: async query => { assert.deepEqual(query.where, { isTest: false }); assert.deepEqual(query.include.payments.where, { voidedAt: null }); return [baseOrder, { ...baseOrder, id: 'unknown', status: 'WORKING', confirmedPrice: null, revenueAt: null, payments: [] }]; } }, pxEntry: { findMany: async () => [entry] }, salesReview: { findMany: async () => reviews }, salesPxAccounting: { findMany: async () => accounting } };
  let result = await loadSalesData(db);
  assert.equal(result.direct.find(d => d.id === 'payment').date, '2026-11-01');
  assert.equal(result.direct.find(d => d.id === 'payment').clientName, '法人名');
  assert.equal(result.direct.find(d => d.id === 'refund').amount, -500);
  assert.ok(!result.direct.some(d => d.id === 'order' && d.kind === 'SALE'));
  assert.equal(result.direct.find(d => d.id === 'unknown').amount, null);
  assert.equal(result.direct.find(d => d.id === 'unknown').date, null);
  const current = result.px[0];
  accounting = [{ pxEntryId: current.id, revenueOn: '2026-01-01', version: 1, sourceHash: current.hash }];
  reviews = [{ ...review(result.direct[0], current), mode: 'CASH' }];
  result = await loadSalesData(db); assert.equal(result.px[0].accountingCurrent, true);
  entry.version++; entry.net = 6900;
  result = await loadSalesData(db); assert.equal(result.px[0].accountingCurrent, false);
  assert.equal(buildSalesState(result, 'CASH').pairs[0].state, 'STALE');
  assert.equal(result.px[0].net, 6900, 'Edited CSV amounts remain authoritative');
});

function clientHarness({ state = [], fetch = async () => ({ ok: true, json: async () => ({ success: true }) }) } = {}) {
  let index = 0;
  const jsx = (type, props) => ({ type, props });
  const mocks = {
    react: { useState: init => [index < state.length ? state[index++] : (index++, init), () => {}], useRef: init => ({ current: init }) },
    'react/jsx-runtime': { jsx, jsxs: jsx }, 'next/navigation': {}, 'next/link': {},
    '@/lib/admin-finance': {}, '@/lib/sales-dashboard': testModule.exports,
  };
  const out = ts.transpileModule(fs.readFileSync(new URL('../src/components/admin/sales/SalesDashboard.tsx', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const mod = { exports: {} };
  class DomFormData { constructor(form) { this.form = form; } get(name) { return this.form.fields[name]; } }
  vm.runInThisContext('(function(require,module,exports,fetch,FormData){' + out + '\nexports.ReviewForm=ReviewForm;exports.DateForm=DateForm;})')(name => mocks[name], mod, mod.exports, fetch, DomFormData);
  return mod.exports;
}
function nodes(tree) { return Array.isArray(tree) ? tree.flatMap(nodes) : tree && typeof tree === 'object' ? [tree, ...nodes(tree.props?.children)] : []; }

test('Review editor retains explicitly confirmed zero fee and withholding allocations when reopened', () => {
  const d = direct(), p = px(), r = review(d, p, 'CASH', { amount: 3000, fee: 0, withholding: 0 });
  const pair = { direct: d, px: p, mode: 'CASH', review: r };
  const tree = clientHarness().ReviewForm({ pair, close() {}, saved() {} });
  assert.deepEqual(nodes(tree).filter(n => n.type === 'input' && n.props.type === 'number').map(n => n.props.value), ['3000', '0', '0']);
});
test('Date confirmation submits the visible native date input even when its initial date was unknown', async () => {
  let payload, done;
  const saved = new Promise(resolve => { done = resolve; });
  const { DateForm } = clientHarness({ state: ['根拠を確認', true], fetch: async (url, options) => { assert.equal(url, '/api/admin/sales/review'); payload = JSON.parse(options.body); return { ok: true, json: async () => ({ success: true }) }; } });
  const tree = DateForm({ px: px(), close() {}, saved: done });
  const input = nodes(tree).find(n => n.type === 'input' && n.props.type === 'date');
  assert.equal(input.props.name, 'revenueOn'); assert.equal(input.props.defaultValue, '');
  tree.props.onSubmit({ preventDefault() {}, currentTarget: { fields: { revenueOn: '2026-10-31' } } });
  await saved;
  assert.equal(payload.revenueOn, '2026-10-31'); assert.equal(payload.pxEntryId, 'p'); assert.equal(payload.reason, '根拠を確認');
});
