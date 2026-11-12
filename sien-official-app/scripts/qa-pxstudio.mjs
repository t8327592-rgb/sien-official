// Integration checks against the existing memory-only QA environment. No dotenv or live connections.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { PrismaClient } from '@prisma/client';

const base = 'http://127.0.0.1:3002';
const prisma = new PrismaClient({ datasources: { db: { url: 'postgresql://qa:qa@127.0.0.1:55432/qa?sslmode=disable&connection_limit=1&statement_cache_size=0&pgbouncer=true' } } });
const cookies = new Map();
async function call(url, options = {}) {
  const response = await fetch(base + url, { ...options, redirect: 'manual', headers: { origin: base, cookie: [...cookies].map(([k, v]) => `${k}=${v}`).join('; '), ...options.headers } });
  for (const cookie of response.headers.getSetCookie()) { const [pair] = cookie.split(';'); const i = pair.indexOf('='); cookies.set(pair.slice(0, i), pair.slice(i + 1)); }
  return response;
}
async function post(body, headers) {
  const response = await call('/api/admin/pxstudio/import', { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body) });
  return { status: response.status, data: await response.json() };
}
const header = '送金日,楽曲名,カテゴリ,依頼者名,制作費(円),手数料(円),源泉徴収(円),手取り(円),支払いステータス';
const a = '2026-04-28,QA確認用楽曲,ボーカルミックス,架空QA,15000,0,1194,11700,送金済み';
const extra = '2026-04-28,QA確認用楽曲,ボーカルミックス,架空QA,1000,200,80,720,送金済み';
const make = (...rows) => header + '\r\n' + rows.join('\r\n') + '\r\n';
const source = csv => ({ csv, fileName: 'qa-pxstudio.csv' });
const preview = async csv => { const r = await post({ action: 'preview', ...source(csv) }); assert.equal(r.status, 200, JSON.stringify(r.data)); return r.data.preview; };
const save = (csv, p, decisions) => post({ action: 'commit', ...source(csv), token: p.token, expiresAt: p.expiresAt, decisions, confirmed: true });
const legacySnapshot = async () => JSON.stringify(await Promise.all([
  prisma.order.findMany({ orderBy: { id: 'asc' } }), prisma.paymentRecord.findMany({ orderBy: { id: 'asc' } }),
  prisma.expense.findMany({ orderBy: { id: 'asc' } }), prisma.businessContact.findMany({ orderBy: { id: 'asc' } }), prisma.siteSetting.findMany(),
]));

try {
  assert.match((await prisma.siteSetting.findUnique({ where: { id: 'default' } })).announcement, /QA隔離環境/);
  assert.equal(await prisma.pxEntry.count(), 0, 'Restart QA before running this suite; it never deletes existing data');
  const before = await legacySnapshot();
  assert.equal((await post({ action: 'preview', ...source(make(a)) })).status, 401);
  assert.equal((await call('/admin/pxstudio')).status, 307);
  const csrf = await (await call('/api/auth/csrf')).json();
  await call('/api/auth/callback/credentials', { method: 'POST', body: new URLSearchParams({ csrfToken: csrf.csrfToken, username: 'qa-admin', password: 'qa-only-password', callbackUrl: base + '/admin', json: 'true' }) });
  assert.equal((await (await call('/api/auth/session')).json()).user.email, 'admin@sien-official.com');
  assert.equal((await post({ action: 'preview', ...source(make(a)) }, { origin: 'https://untrusted.invalid' })).status, 401);
  assert.equal((await post({ action: 'preview', ...source(make(a).replace('15000', '15000円')) })).status, 400);
  const first = make(a, extra), p = await preview(first);
  assert.equal(await prisma.pxEntry.count(), 0); assert.equal(await prisma.pxImport.count(), 0);
  assert.equal(p.rows.length, 2); assert.equal(p.rows[0].difference, 2106);
  const decisions = p.rows.map(() => ({ action: 'add' }));
  const concurrent = await Promise.all([save(first, p, decisions), save(first, p, decisions)]);
  assert.ok(concurrent.every(r => r.status === 200), JSON.stringify(concurrent));
  assert.equal(concurrent.filter(r => r.data.result.replayed).length, 1);
  assert.equal(await prisma.pxEntry.count(), 2); assert.equal(await prisma.pxImport.count(), 1);
  assert.equal((await preview(make(extra, a))).alreadyImported, true);
  const original = await prisma.pxEntry.findFirstOrThrow({ where: { gross: 15000 } });
  assert.equal(original.net, 11700); assert.equal(original.fee, 0);
  console.log('PASS auth/origin, validation, read-only preview, concurrent replay, renamed/reordered content identity and raw amount preservation');

  const changed = make(a.replace('15000', '16000'));
  const c = await preview(changed);
  assert.equal(c.rows[0].candidates.length, 2); assert.equal(c.rows[0].exactIds.length, 0);
  assert.equal((await save(changed, c, [{ action: 'update', targetId: 'unknown' }])).status, 400);
  assert.equal(await prisma.pxImport.count(), 1);
  assert.equal((await save(changed, c, [{ action: 'update', targetId: original.id }])).status, 200);
  const revision = await prisma.pxImportChange.findFirstOrThrow({ where: { action: 'update' } });
  assert.equal(revision.before.gross, 15000); assert.equal(revision.after.gross, 16000);
  assert.equal((await prisma.pxEntry.findUniqueOrThrow({ where: { id: original.id } })).version, 2);
  assert.equal(await prisma.pxEntry.count(), 2, 'Partial file must not delete omitted rows');
  const freshCsv = make('2026-12-31,新規QA,ボーカルミックス,新規架空,100,10,5,85,送金済み');
  const f = await preview(freshCsv);
  const staleCsv = make(a.replace('15000', '17000'));
  const stale = await preview(staleCsv);
  assert.equal((await save(freshCsv, f, [{ action: 'add' }])).status, 200);
  assert.equal((await save(staleCsv, stale, [{ action: 'update', targetId: original.id }])).status, 409);
  const refreshed = await preview(staleCsv);
  assert.equal((await post({ action: 'commit', ...source(staleCsv), token: '0'.repeat(64), expiresAt: refreshed.expiresAt, decisions: [{ action: 'add' }], confirmed: true })).status, 409);
  console.log('PASS explicit update and audit history, partial-file retention, stale preview and signature tampering rejection');

  // Deliberate constraint failure on a new QA-only entry verifies that the batch and earlier rows roll back together.
  await prisma.$executeRawUnsafe('ALTER TABLE "PxEntry" ADD CONSTRAINT "qa_px_failure" CHECK ("gross" <> 123456)');
  const failing = make('2026-11-01,途中QA,ボーカルミックス,架空QA,100,0,0,100,送金済み', '2026-11-02,失敗QA,ボーカルミックス,架空QA,123456,0,0,123456,送金済み');
  const failPreview = await preview(failing), counts = [await prisma.pxEntry.count(), await prisma.pxImport.count(), await prisma.pxImportChange.count()];
  assert.equal((await save(failing, failPreview, [{ action: 'add' }, { action: 'add' }])).status, 500);
  assert.deepEqual([await prisma.pxEntry.count(), await prisma.pxImport.count(), await prisma.pxImportChange.count()], counts);
  await prisma.$executeRawUnsafe('ALTER TABLE "PxEntry" DROP CONSTRAINT "qa_px_failure"');
  console.log('PASS database failure rolls back the entire batch, entries and audit rows');

  const overlap = make(extra, '2026-11-03,重複期間QA,ボーカルミックス,架空QA,100,0,0,100,送金済み');
  const overlapPreview = await preview(overlap), beforeOverlap = await prisma.pxEntry.count();
  assert.equal(overlapPreview.rows[0].exactIds.length, 1);
  const overlapSaved = await save(overlap, overlapPreview, [{ action: 'skip' }, { action: 'add' }]);
  assert.equal(overlapSaved.status, 200); assert.equal(overlapSaved.data.result.skipped, 1);
  assert.equal(await prisma.pxEntry.count(), beforeOverlap + 1);
  const ordered = make('2026-11-04,順序QA1,ボーカルミックス,架空QA,100,0,0,100,送金済み', '2026-11-05,順序QA2,ボーカルミックス,架空QA,200,0,0,200,送金済み');
  const orderPreview = await preview(ordered);
  const reordered = header + '\r\n' + ordered.trim().split('\r\n').slice(1).reverse().join('\r\n') + '\r\n';
  assert.equal((await save(reordered, orderPreview, [{ action: 'add' }, { action: 'add' }])).status, 409);
  assert.equal(await prisma.pxEntry.count(), beforeOverlap + 1);
  console.log('PASS overlapping exports skip confirmed matches and add only new rows; changed row order invalidates pending decisions');

  if (process.argv[2]) {
    const csv = fs.readFileSync(process.argv[2], 'utf8');
    const sample = await preview(csv), beforeCount = await prisma.pxEntry.count();
    const saved = await save(csv, sample, sample.rows.map(() => ({ action: 'add' })));
    assert.equal(saved.status, 200, JSON.stringify(saved.data));
    assert.equal(await prisma.pxEntry.count(), beforeCount + sample.rows.length);
    const actual = await prisma.pxImportChange.findMany({ where: { importId: saved.data.result.id }, orderBy: { rowNumber: 'asc' }, include: { entry: true } });
    assert.equal(actual.length, sample.rows.length);
    for (let i = 0; i < sample.rows.length; i++) for (const key of ['sentOn', 'songTitle', 'category', 'clientName', 'gross', 'fee', 'withholding', 'net', 'paymentStatus']) assert.equal(actual[i].entry[key], sample.rows[i][key]);
    assert.equal((await save(csv, sample, sample.rows.map(() => ({ action: 'add' })))).data.result.replayed, true);
    console.log(`PASS supplied CSV: ${sample.rows.length} statements preserved field-for-field; ${sample.rows.filter(r => r.difference).length} discrepancies retained; repeated upload adds nothing`);
  }
  assert.equal(await legacySnapshot(), before, 'Existing finance, orders, corporate contacts and settings must be untouched');
  for (const url of ['/admin/pxstudio', '/admin/finance', '/admin']) assert.equal((await call(url)).status, 200);
  console.log('PASS existing tables unchanged and all dashboard routes render');
  console.log('QA_PXSTUDIO_PASSED');
} finally { await prisma.$disconnect(); }
