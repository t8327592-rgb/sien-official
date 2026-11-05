import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';
const base = 'http://127.0.0.1:3002';
const prisma = new PrismaClient({ datasources: { db: { url: 'postgresql://qa:qa@127.0.0.1:55432/qa?sslmode=disable&connection_limit=1&statement_cache_size=0&pgbouncer=true' } } });
const cookies = new Map();
async function call(url, options = {}) {
  const response = await fetch(base + url, { ...options, redirect: 'manual', headers: { origin: base, cookie: [...cookies].map(([k,v]) => `${k}=${v}`).join('; '), ...options.headers } });
  for (const cookie of response.headers.getSetCookie()) { const [pair] = cookie.split(';'); const i = pair.indexOf('='); cookies.set(pair.slice(0,i), pair.slice(i+1)); }
  return response;
}
const json = (url, method, body) => call(url, { method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
try {
  const settings = await prisma.siteSetting.findUnique({ where: { id: 'default' } });
  assert.match(settings.announcement, /QA隔離環境/);
  assert.equal((await json('/api/admin/finance', 'POST', {})).status, 401);
  const csrf = await (await call('/api/auth/csrf')).json();
  await call('/api/auth/callback/credentials', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ csrfToken: csrf.csrfToken, username: 'qa-admin', password: 'qa-only-password', callbackUrl: base + '/admin', json: 'true' }) });
  assert.equal((await (await call('/api/auth/session')).json()).user.email, 'admin@sien-official.com');
  const paths = ['/admin', '/admin/orders', '/admin/orders?archive=1', '/admin/orders?tests=only', '/admin/orders/qa-order-november', '/admin/orders/qa-order-november/feedback', '/admin/finance', '/admin/notifications', '/admin/news', '/admin/news/new', '/admin/news/qa-news', '/admin/blog', '/admin/blog/new', '/admin/portfolio', '/admin/reviews', '/admin/plans', '/admin/plans/new', '/admin/settings', '/admin/profile', '/admin/services', '/admin/faq', '/admin/campaigns'];
  for (const path of paths) {
    const response = await call(path); const text = await response.text();
    assert.equal(response.status, 200, path);
    assert.ok(!text.includes('NEXT_HTTP_ERROR_FALLBACK;500') && !text.includes('管理画面を読み込めませんでした'), path);
  }
  console.log(`PASS ${paths.length} administrative pages, archive/test views and feedback editor`);
  const expenseCount = await prisma.expense.count();
  for (const amount of [-1, 1.5, '100円', 2147483648]) assert.equal((await json('/api/admin/finance', 'POST', { title: '不正金額', amount, category: '機材', date: '2026-11-01' })).status, 400);
  assert.equal(await prisma.expense.count(), expenseCount);
  const created = await json('/api/admin/finance', 'POST', { title: 'QA監査用経費', amount: 1200, category: '機材', date: '2026-11-01' });
  assert.equal(created.status, 201); const expense = await created.json();
  assert.equal(expense.date, '2026-10-31T15:00:00.000Z');
  assert.equal((await json(`/api/admin/finance/${expense.id}`, 'PATCH', { amount: 12.3 })).status, 400);
  const updated = await json(`/api/admin/finance/${expense.id}`, 'PATCH', { title: 'QA監査用経費・更新', amount: 2000, date: '2026-11-01' });
  assert.equal(updated.status, 200); assert.equal((await updated.json()).date, expense.date);
  assert.equal((await call(`/api/admin/finance/${expense.id}`, { method: 'DELETE' })).status, 200);
  assert.equal(await prisma.expense.count(), expenseCount);
  assert.equal((await json('/api/admin/settings/finance', 'PATCH', { targetMonthlySales: '100abc' })).status, 400);
  assert.equal((await json('/api/admin/settings/finance', 'PATCH', { targetMonthlySales: 50000 })).status, 200);
  assert.equal((await prisma.siteSetting.findUnique({ where: { id: 'default' } })).targetMonthlySales, 50000);
  await json('/api/admin/settings/finance', 'PATCH', { targetMonthlySales: settings.targetMonthlySales });
  console.log('PASS finance CRUD, strict validation, JST date preservation and goal validation');
  for (const [id, orderIndex] of [['qa-audit-review-1', 9000], ['qa-audit-review-2', 9001]]) await prisma.review.upsert({ where: { id }, update: {}, create: { id, name: `プレビュー確認用 ${orderIndex - 8999}`, content: '管理画面の並べ替え確認用です。非公開の架空データです。', serviceType: 'MIX', rating: 5, isPublished: false, orderIndex } });
  const ordered = await prisma.review.findMany({ orderBy: [{ orderIndex: 'asc' }, { id: 'asc' }] });
  const previous = ordered.map((r, orderIndex) => ({ id: r.id, orderIndex }));
  const sequence = [...previous].reverse().map((r, orderIndex) => ({ ...r, orderIndex }));
  assert.equal((await json('/api/admin/reviews/reorder', 'POST', { previous, sequence })).status, 200);
  assert.deepEqual((await prisma.review.findMany({ orderBy: [{ orderIndex: 'asc' }, { id: 'asc' }], select: { id: true } })).map(r => r.id), sequence.map(r => r.id));
  assert.equal((await json('/api/admin/reviews/reorder', 'POST', { previous, sequence })).status, 409);
  const invalid = await json('/api/admin/reviews', 'POST', { name: 'QA', serviceType: 'MIX', content: '本文', rating: 0 }); assert.equal(invalid.status, 400);
  // Test real DB rollback by forcing the last row to fail inside the reorder transaction.
  const firstBefore = await prisma.review.findUnique({ where: { id: sequence[0].id } });
  const lastId = sequence.at(-1).id;
  await prisma.$executeRawUnsafe(`ALTER TABLE "Review" ADD CONSTRAINT "qa_audit_reorder_failure" CHECK ("id" <> '${lastId.replaceAll("'", "''")}' OR "orderIndex" <> 4999)`);
  try {
    const failSequence = sequence.map((r, i) => ({ ...r, orderIndex: i === sequence.length - 1 ? 4999 : 4000 + i }));
    assert.equal((await json('/api/admin/reviews/reorder', 'POST', { previous: sequence, sequence: failSequence })).status, 500);
    assert.equal((await prisma.review.findUnique({ where: { id: firstBefore.id } })).orderIndex, firstBefore.orderIndex);
  } finally { await prisma.$executeRawUnsafe('ALTER TABLE "Review" DROP CONSTRAINT "qa_audit_reorder_failure"'); }
  console.log('PASS review ordering persistence, stale conflict and rollback after a later row fails');
  const sale = await call('/autumn-sale');
  // Next can stream its shell before notFound(), retaining a 200 transport status.
  assert.ok(sale.status === 404 || (await sale.text()).includes('NEXT_HTTP_ERROR_FALLBACK;404'));
  console.log('PASS postponed autumn sale remains unavailable');
  console.log('QA_ADMIN_AUDIT_PASSED');
} finally { await prisma.$disconnect(); }
