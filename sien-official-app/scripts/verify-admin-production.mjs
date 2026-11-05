import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Read-only checks of the existing production site. Credentials stay in memory.
const base = 'https://www.sien-official.com';
const cookies = new Map();
const results = [];
async function call(route, options = {}) {
  const response = await fetch(base + route, { ...options, redirect: 'manual', headers: { origin: base, cookie: [...cookies].map(([key, value]) => `${key}=${value}`).join('; '), ...options.headers }, signal: AbortSignal.timeout(45000) });
  for (const cookie of response.headers.getSetCookie()) { const pair = cookie.split(';')[0]; const i = pair.indexOf('='); cookies.set(pair.slice(0, i), pair.slice(i + 1)); }
  return response;
}
async function page(route, required = []) {
  const response = await call(route);
  assert.equal(response.status, 200, `Unexpected page status: ${route}`);
  const body = await response.text();
  assert.ok(!body.includes('管理画面を読み込めませんでした') && !body.includes('NEXT_HTTP_ERROR_FALLBACK;500'), `Page failed: ${route}`);
  assert.ok(!body.includes('ローカルプレビュー：架空の確認用データです。'), `QA marker leaked: ${route}`);
  for (const text of required) assert.ok(body.includes(text), `Missing expected UI on ${route}`);
  results.push({ route, status: response.status, verified: true });
  return body;
}
try {
  const publicRoutes = ['/', '/mix', '/original', '/order', '/news', '/policy/privacy'];
  for (const route of publicRoutes) await page(route);
  const sale = await call('/autumn-sale');
  assert.ok(sale.status === 404 || (await sale.text()).includes('NEXT_HTTP_ERROR_FALLBACK;404'), 'Postponed sale became public');
  results.push({ route: '/autumn-sale', verified: true, result: 'NOT_FOUND' });
  const blocked = await call('/api/admin/finance', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
  assert.equal(blocked.status, 401, 'Anonymous admin write was accepted');
  assert.ok(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD, 'Production admin credentials are not configured locally');
  const csrf = await (await call('/api/auth/csrf')).json();
  const login = await call('/api/auth/callback/credentials', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ csrfToken: csrf.csrfToken, username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD, callbackUrl: base + '/admin', json: 'true' }) });
  assert.ok([200, 302].includes(login.status), 'Admin login failed');
  const session = await (await call('/api/auth/session')).json();
  assert.equal(session.user?.email, 'admin@sien-official.com', 'Production admin session could not be verified');
  await page('/admin', ['売上・入金サマリー']);
  await page('/admin/orders', ['個人・法人すべて', '通常のみ']);
  await page('/admin/orders?archive=1');
  await page('/admin/orders?customer=BUSINESS');
  await page('/admin/orders?customer=BUSINESS&tests=only');
  await page('/admin/finance', ['平均案件単価', '月別比較']);
  await page('/admin/notifications');
  await page('/admin/settings', ['サイトの掲載内容を管理']);
  for (const route of ['/admin/profile', '/admin/faq', '/admin/services', '/admin/campaigns', '/admin/reviews', '/admin/portfolio', '/admin/plans', '/admin/news', '/admin/blog']) await page(route);
  const file = path.resolve(import.meta.dirname, '../../audit/admin-release-2026-11-05/after-summary.json');
  const migration = JSON.parse(fs.readFileSync(file, 'utf8'));
  const real = migration.corporateMappings.find(row => !row.isTest);
  assert.ok(real, 'Real corporate inquiry mapping missing');
  await page(`/admin/orders/${real.orderId}`, ['元のお問い合わせ', '確定金額・入金']);
  const legacy = await call(`/admin/business/${real.sourceId}`);
  assert.ok(legacy.headers.get('location') === `/admin/orders/${real.orderId}` || (await legacy.text()).includes(`/admin/orders/${real.orderId}`), 'Legacy corporate URL no longer reaches its case');
  const result = { verifiedAt: new Date().toISOString(), site: base, mode: 'READ_ONLY_PRODUCTION', checks: results, adminAuthenticationVerified: true, unauthorizedWriteBlocked: true, legacyCorporateLinkVerified: true, productionRecordsCreatedByVerification: 0, notificationsCreatedByVerification: 0 };
  fs.writeFileSync(path.resolve(import.meta.dirname, '../../audit/admin-release-2026-11-05/production-verification.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify({ ...result, checks: results.length }, null, 2));
} catch (error) {
  console.error(error instanceof assert.AssertionError ? error.message : 'Production verification failed. Credentials and private response contents were not logged.');
  process.exitCode = 1;
}
