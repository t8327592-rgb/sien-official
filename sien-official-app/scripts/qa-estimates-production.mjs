// Read-only production smoke check plus an UNSAVED synthetic PDF preview.
// Does not save estimates, change source orders, or send external notifications.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
const base = 'https://www.sien-official.com';
const direct = new URL(process.env.POSTGRES_URL_NON_POOLING || 'http://invalid');
if (direct.hostname !== 'ep-dark-fog-atw8j4kc.c-9.us-east-1.aws.neon.tech' || direct.pathname !== '/neondb' || direct.searchParams.get('sslmode') !== 'require') throw Error('Production target mismatch');
const db = new PrismaClient({ datasources: { db: { url: direct.href } } });
const cookies = new Map(), results = [];
async function call(url, options = {}) {
  const response = await fetch(base + url, { ...options, redirect: 'manual', signal: AbortSignal.timeout(60000), headers: { Origin: base, Cookie: [...cookies].map(([k,v]) => `${k}=${v}`).join('; '), ...options.headers } });
  for (const raw of response.headers.getSetCookie()) { const pair = raw.split(';')[0], i = pair.indexOf('='); cookies.set(pair.slice(0,i), pair.slice(i+1)); }
  return response;
}
const post = (url, body, origin = base) => call(url, { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json', Origin: origin } });
try {
  for (const url of ['/admin/estimates', '/admin/estimates/new', '/admin/orders']) {
    const response = await call(url); assert.equal(response.status, 307); assert.match(response.headers.get('location'), /login/);
  }
  assert.equal((await post('/api/admin/estimates', {})).status, 401);
  assert.equal((await post('/api/admin/estimates/preview', {})).status, 401);
  assert.equal((await call('/api/admin/estimates/nonexistent/pdf')).status, 401);
  results.push('Anonymous admin pages and estimate APIs denied');
  const csrf = await (await call('/api/auth/csrf')).json();
  await call('/api/auth/callback/credentials', { method: 'POST', body: new URLSearchParams({ csrfToken: csrf.csrfToken, username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD, callbackUrl: base + '/admin', json: 'true' }) });
  const session = await (await call('/api/auth/session')).json(); assert.equal(session.user?.email, 'admin@sien-official.com');
  for (const [url, expected] of [['/admin/orders','ご依頼管理'], ['/admin/estimates','保存済みの見積書'], ['/admin/sales','売上'], ['/admin/finance','売上'], ['/admin/pxstudio','PXstudio']]) {
    const response = await call(url); assert.equal(response.status, 200, url); assert.ok((await response.text()).includes(expected), url);
  }
  results.push('Authenticated orders, estimates, sales, finance and PXstudio pages load');
  const order = await db.order.findFirstOrThrow({ where: { isTest: false, isArchived: false }, select: { id: true } });
  const draft = await call('/admin/estimates/new?orders=' + order.id); assert.equal(draft.status, 200); assert.ok((await draft.text()).includes('見積書の編集'));
  const day = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo' }).format(new Date());
  const content = { clientName: '本番動作確認（未保存）', number: 'EST-PRODUCTION-CHECK', issuedOn: day, validUntil: day,
    lines: [{ id: 'preview-line', orderId: order.id, kind: 'BASE', songTitle: '日本語表示・PDF動作確認', name: '動作確認', quantity: 1, unitPrice: 10000, note: '' }],
    discount: { name: '', mode: 'PERCENT', value: 0, target: 'ALL', lineIds: [] }, notes: '未保存プレビューのため実案件・売上・入金は変更されません。', paymentGuide: '', message: '' };
  const count = await db.estimate.count();
  assert.equal((await post('/api/admin/estimates/preview', { content, orderIds: [order.id] }, 'https://untrusted.invalid')).status, 401);
  const pdf = await post('/api/admin/estimates/preview', { content, orderIds: [order.id], revision: 1 });
  assert.equal(pdf.status, 200); assert.match(pdf.headers.get('content-type'), /application\/pdf/); assert.match(pdf.headers.get('cache-control'), /private, no-store/);
  const bytes = Buffer.from(await pdf.arrayBuffer()); assert.equal(bytes.subarray(0,4).toString(), '%PDF'); assert.ok(bytes.length > 10000);
  assert.equal(await db.estimate.count(), count); assert.equal(count, 0); assert.equal(await db.estimateOrder.count(), 0);
  assert.equal((await call('/api/admin/estimates/nonexistent/pdf')).status, 404);
  results.push('New editor and deployed PDF assets work; preview creates no records; wrong Origin denied');
  const result = { verifiedAt: new Date().toISOString(), result: 'PASS', site: base, checks: results, estimateCount: count, pdfBytes: bytes.length };
  const directory = path.resolve(import.meta.dirname, '../../audit/estimates-release-2026-11-24');
  fs.mkdirSync(directory, { recursive: true }); fs.writeFileSync(path.join(directory, 'production-smoke.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  // No HTML, customer content, cookies, credentials, or connection strings.
  console.error(JSON.stringify({ result: 'FAILED', type: error?.name, code: error?.code, status: error?.actual })); process.exitCode = 1;
} finally { await db.$disconnect(); }
