// Fixed loopback-only QA targets. Never loads dotenv or connects to production.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { PrismaClient } from '@prisma/client';
import { buildSalesState, salesPairHash, salesSummary } from '../src/lib/sales-dashboard.ts';
const base = 'http://127.0.0.1:3004';
const prisma = new PrismaClient({ datasources: { db: { url: 'postgresql://qa:qa@127.0.0.1:55442/qa?sslmode=disable&connection_limit=1&statement_cache_size=0&pgbouncer=true' } } });
const cookies = new Map();
async function call(url, options = {}) {
  const res = await fetch(base + url, { ...options, redirect: 'manual', headers: { origin: base, cookie: [...cookies].map(([k, v]) => `${k}=${v}`).join('; '), ...options.headers } });
  for (const c of res.headers.getSetCookie()) { const pair = c.split(';')[0], i = pair.indexOf('='); cookies.set(pair.slice(0, i), pair.slice(i + 1)); }
  return res;
}
async function post(body, headers) {
  const r = await call('/api/admin/sales/review', { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body) });
  return { status: r.status, data: await r.json() };
}
async function get() { const r = await call('/api/admin/sales'); assert.equal(r.status, 200); assert.equal(r.headers.get('cache-control'), 'no-store'); return r.json(); }
async function review(mode, directId, pxEntryId, status, amounts = {}) {
  const data = await get(), d = data.direct.find(d => d.id === directId && (mode === 'CASH' ? d.kind === 'RECEIPT' : d.kind === 'SALE')), p = data.px.find(p => p.id === pxEntryId);
  const old = (mode === 'CASH' ? data.cashReviews : data.revenueReviews).find(r => r.directId === directId && r.pxEntryId === pxEntryId);
  return { action: 'review', confirmed: true, mode, directId, pxEntryId, status, amount: 0, fee: 0, withholding: 0, ...amounts, sourceHash: salesPairHash(mode, d, p), version: old?.version || 0, reason: '隔離QAで明細を照合' };
}
async function dateBody(id, revenueOn) {
  const p = (await get()).px.find(p => p.id === id);
  return { action: 'px-date', pxEntryId: id, revenueOn, sourceHash: p.hash, version: p.accountingVersion, reason: '隔離QAの完了日を確認', confirmed: true };
}
const snapshot = async () => JSON.stringify(await Promise.all([
  prisma.order.findMany({ orderBy: { id: 'asc' } }), prisma.paymentRecord.findMany({ orderBy: { id: 'asc' } }), prisma.expense.findMany({ orderBy: { id: 'asc' } }), prisma.businessContact.findMany({ orderBy: { id: 'asc' } }),
  prisma.pxEntry.findMany({ orderBy: { id: 'asc' } }), prisma.pxImport.findMany({ orderBy: { id: 'asc' } }), prisma.pxImportChange.findMany({ orderBy: { id: 'asc' } }), prisma.siteSetting.findMany(),
]));
const total = (data, mode = 'CASH', year = 2026, month = null, source = 'ALL') => salesSummary(buildSalesState(data, mode).events, year, month, source).total;
const main = 'qa-sales-px-duplicate', extra = 'qa-sales-px-extra', receipt = 'qa-sales-payment-duplicate';
try {
  assert.match((await prisma.siteSetting.findUniqueOrThrow({ where: { id: 'default' } })).announcement, /QA隔離環境/);
  assert.equal(await prisma.salesReview.count(), 0, 'Start a fresh QA_SALES environment before rerunning');
  const before = await snapshot();
  assert.equal((await call('/api/admin/sales')).status, 401);
  assert.equal((await call('/admin/sales')).status, 307);
  assert.equal((await post({})).status, 401);
  const csrf = await (await call('/api/auth/csrf')).json();
  await call('/api/auth/callback/credentials', { method: 'POST', body: new URLSearchParams({ csrfToken: csrf.csrfToken, username: 'qa-admin', password: 'qa-only-password', callbackUrl: base + '/admin/sales', json: 'true' }) });
  let d = await get();
  assert.equal(total(d).total, 36675); assert.equal(total(d, 'CASH', 2026, 11, 'DIRECT').total, 24175); assert.equal(total(d, 'CASH', 2026, 11, 'PXSTUDIO').total, 12500);
  assert.equal(buildSalesState(d, 'CASH').held.length, 1); assert.equal(buildSalesState(d, 'CASH').unknown.length, 1);
  assert.ok(!d.direct.some(e => e.id === 'qa-sales-voided')); assert.equal(d.px.find(p => p.id === extra).net, 500);
  for (const mode of ['CASH', 'REVENUE']) for (const y of [2025, 2026]) for (const m of [null, 1, 10, 11, 12]) {
    const all = total(d, mode, y, m), direct = total(d, mode, y, m, 'DIRECT'), px = total(d, mode, y, m, 'PXSTUDIO');
    for (const k of ['total', 'fee', 'withholding', 'count']) assert.equal(all[k], direct[k] + px[k]);
  }
  const partial = await review('CASH', receipt, main, 'DUPLICATE', { amount: 3000, fee: 500, withholding: 100 });
  assert.equal((await post(partial, { origin: 'https://untrusted.invalid' })).status, 401);
  assert.equal((await post({ ...partial, confirmed: false })).status, 400);
  assert.equal((await post({ ...partial, amount: -1 })).status, 400);
  assert.equal((await post({ ...partial, sourceHash: 'forged' })).status, 409);
  assert.equal((await post(partial)).status, 200);
  assert.equal(total(await get()).total, 36675, 'Other candidate is still pending');
  assert.equal((await post(await review('CASH', receipt, extra, 'DISTINCT'))).status, 200);
  assert.equal(total(await get()).total, 40675, 'Only allocated portion excluded');
  assert.equal((await post(partial)).status, 409, 'Old version cannot overwrite confirmation');
  assert.equal((await post(await review('CASH', receipt, main, 'DUPLICATE', { amount: 7001 }))).status, 400);
  assert.equal((await post(await review('CASH', receipt, main, 'DUPLICATE', { amount: 7000, fee: 2000, withholding: 1000 }))).status, 200);
  const competing = await review('CASH', receipt, extra, 'DISTINCT');
  const concurrent = await Promise.all([post(competing), post(competing)]);
  assert.deepEqual(concurrent.map(r => r.status).sort(), [200, 409]);
  assert.equal((await post(await review('CASH', 'qa-sales-payment-direct', main, 'DUPLICATE', { amount: 1 }))).status, 400, 'PX allocation cap is shared by direct receipts');
  const manual = await review('CASH', 'qa-sales-payment-direct', 'qa-sales-px-unconfirmed', 'PENDING');
  assert.equal((await post(manual)).status, 200); assert.equal(total(await get()).total, 32675);
  assert.equal((await post(await review('CASH', 'qa-sales-payment-direct', 'qa-sales-px-unconfirmed', 'DISTINCT'))).status, 200);
  assert.equal(total(await get()).total, 36675);
  console.log('PASS auth/origin, source sums, refund/archive/void handling, partial allocation, all-candidate resolution, shared caps, undo, concurrent and stale writes');

  const invalidDate = await dateBody('qa-sales-px-unconfirmed', '2026-02-30');
  assert.equal((await post(invalidDate)).status, 400);
  const confirmedDate = await dateBody('qa-sales-px-unconfirmed', '2026-10-31');
  assert.equal((await post(confirmedDate)).status, 200); assert.equal((await post(confirmedDate)).status, 409);
  assert.equal((await post(await dateBody('qa-sales-px-crossyear', '2026-01-01'))).status, 200);
  d = await get(); assert.equal(total(d, 'CASH', 2025).total, 2000); assert.equal(total(d, 'REVENUE', 2026, 1).total, 2500); assert.equal(total(d, 'REVENUE', 2026, 10, 'PXSTUDIO').total, 8000);
  assert.equal((await post(await review('REVENUE', 'qa-sales-duplicate', main, 'DUPLICATE', { amount: 10000 }))).status, 400, 'Unknown revenue date blocks dedup');
  assert.equal((await post(await dateBody(main, '2026-11-01'))).status, 200);
  assert.equal((await post(await review('REVENUE', 'qa-sales-duplicate', main, 'DUPLICATE', { amount: 10000 }))).status, 200);
  assert.equal((await post(await review('REVENUE', 'qa-sales-duplicate', extra, 'DISTINCT'))).status, 200);
  assert.equal((await post(await dateBody('qa-sales-px-unconfirmed', null))).status, 200);
  assert.ok(buildSalesState(await get(), 'REVENUE').unknown.some(e => e.id === 'qa-sales-px-unconfirmed'));
  // Supplemental date revision invalidates the revenue dedup review, never the original CSV.
  assert.equal((await post(await dateBody(main, '2026-10-31'))).status, 200);
  const stale = buildSalesState(await get(), 'REVENUE'); assert.equal(stale.pairs.find(p => p.px.id === main).state, 'STALE'); assert.equal(stale.held.length, 1);
  assert.equal((await post(await review('REVENUE', 'qa-sales-duplicate', main, 'DUPLICATE', { amount: 10000 }))).status, 200);
  console.log('PASS explicit accounting dates, date validation/reset, cross-year and month separation, independent basis reviews and re-confirmation after date revision');
  assert.equal(await snapshot(), before, 'Source financial data must remain byte-for-byte unchanged');
  const page = await call('/admin/sales'); assert.equal(page.status, 200); assert.match(await page.text(), /売上ダッシュボード/);
  assert.equal((await call('/admin/finance')).status, 200); assert.equal((await call('/admin/pxstudio')).status, 200);
  d = await get();
  const result = { checkedAt: new Date().toISOString(), localOnly: true, legacySourcesUnchanged: true, cash2026: total(d), revenue2026: total(d, 'REVENUE'), auditCount: await prisma.salesReviewAudit.count(), pxRawDiscrepancies: d.px.filter(p => p.gross - p.fee - p.withholding !== p.net).map(p => ({ id: p.id, net: p.net })) };
  fs.mkdirSync('../audit/sales-dashboard-local', { recursive: true }); fs.writeFileSync('../audit/sales-dashboard-local/integration.json', JSON.stringify(result, null, 2));
  console.log('PASS source immutability, existing finance/PX pages, preserved raw CSV discrepancies and supplemental audit trail', JSON.stringify(result));
} finally { await prisma.$disconnect(); }
