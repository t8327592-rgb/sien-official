import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const root = path.resolve(import.meta.dirname, '..');
function createLoader(mocks = {}) {
 const cache = new Map();
 return function load(file) {
  file = path.resolve(root, file);
  if (cache.has(file)) return cache.get(file).exports;
  const compiled = { exports: {} }; cache.set(file, compiled);
  const output = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const mockedRequire = name => Object.hasOwn(mocks, name) ? mocks[name] : name.startsWith('@/') ? load('src/' + name.slice(2) + '.ts') : name.startsWith('.') ? load(path.resolve(path.dirname(file), name + '.ts')) : require(name);
  vm.runInThisContext('(function(require,module,exports,fetch){' + output + '\n})', { filename: file })(mockedRequire, compiled, compiled.exports, mocks.fetch || globalThis.fetch);
  return compiled.exports;
 };
}
const load = createLoader();
const { parsePxCsv, buildPxPreview, signPxPreview, verifyPxPreview, validatePxDecisions } = load('src/lib/pxstudio-import.ts');
const { PX_HEADERS, PX_MAX_ROWS, pxMonthlySummary, pxDifference } = load('src/lib/pxstudio-shared.ts');
const header = PX_HEADERS.join(',');
const row = ['2026-04-28', '確認用の曲', 'ボーカルミックス', '架空の依頼者', '15000', '0', '1194', '11700', '送金済み'];
const csv = (rows = [row]) => header + '\r\n' + rows.map(r => r.map(c => '"' + c.replaceAll('"', '""') + '"').join(',')).join('\r\n') + '\r\n';
const entry = (r, id = 'existing') => ({ ...r, id, version: 1 });

test('PX CSV parses BOM, quoting, commas, newlines and keeps original values and the discrepancy', () => {
  const special = [...row]; special[1] = '歌,"引用"\n改行';
  const { rows } = parsePxCsv('\ufeff' + csv([special]));
  assert.equal(rows[0].songTitle, special[1]); assert.deepEqual(rows[0].rawCells, special);
  assert.equal(rows[0].net, 11700); assert.equal(pxDifference(rows[0]), 2106);
});

test('PX CSV rejects invalid headers, partial rows, malformed quotes, dates and lossy amounts', () => {
  for (const bad of ['', header, csv().replace('送金日', '発生日'), header + '\n1,2', header + '\n"unclosed', header + '\n"a"b,2', csv().replace('2026-04-28', '2026-02-30'), csv().replace('"15000"', '"15000円"'), csv().replace('"15000"', '"1.5"'), csv().replace('"15000"', '"-1"'), csv().replace('"15000"', '"2147483648"'), csv().replace('確認用の曲', '\0'), csv().replace('確認用の曲', '\ufffd')]) {
    assert.throws(() => parsePxCsv(bad), undefined, bad);
  }
});

test('PX CSV enforces row and byte limits and does not discard legitimate zero values', () => {
  assert.throws(() => parsePxCsv(csv(Array.from({ length: PX_MAX_ROWS + 1 }, () => row))));
  assert.throws(() => parsePxCsv('あ'.repeat(400000)));
  const zero = [...row]; zero.splice(4, 4, '0', '0', '0', '0');
  assert.equal(parsePxCsv(csv([zero])).rows[0].net, 0);
});

test('PX file identity ignores BOM, line endings and row order, but retains row multiplicity', () => {
  const other = [...row]; other[4] = '1000';
  const a = parsePxCsv(csv([row, other]));
  assert.equal(a.fileHash, parsePxCsv('\ufeff' + csv([other, row]).replaceAll('\r\n', '\n')).fileHash);
  assert.notEqual(a.previewHash, parsePxCsv(csv([other, row])).previewHash);
  assert.notEqual(a.fileHash, parsePxCsv(csv([row, other, row])).fileHash);
});

test('PX matching preserves same-day extra-charge rows and exposes changed values as candidates', () => {
  const extra = [...row]; extra[4] = '1000'; extra[7] = '800';
  const { rows } = parsePxCsv(csv([row, extra]));
  const preview = buildPxPreview(rows, [entry(rows[0])]);
  assert.equal(preview[0].exactIds.length, 1);
  assert.equal(preview[1].exactIds.length, 0); assert.equal(preview[1].candidates.length, 1);
  assert.equal(rows.length, 2); assert.notEqual(rows[0].fingerprint, rows[1].fingerprint);
});

test('PX identical rows are marked for individual review instead of silently collapsing', () => {
  const { rows } = parsePxCsv(csv([row, row]));
  assert.ok(buildPxPreview(rows, []).every(r => r.repeated));
});

test('PX preview signature rejects changed CSV, stale database and expired/tampered confirmations', () => {
  const old = process.env.NEXTAUTH_SECRET; process.env.NEXTAUTH_SECRET = 'qa-unit-only';
  try {
    const { rows, fileHash } = parsePxCsv(csv()); const entries = [entry(rows[0])];
    const expiry = Date.now() + 60000, token = signPxPreview(fileHash, entries, expiry);
    assert.doesNotThrow(() => verifyPxPreview(token, expiry, fileHash, entries));
    for (const args of [[token, expiry, 'changed', entries], [token, expiry, fileHash, [{ ...entries[0], version: 2 }]], [token, Date.now() - 1, fileHash, entries], ['0'.repeat(64), expiry, fileHash, entries]]) assert.throws(() => verifyPxPreview(...args));
  } finally { if (old === undefined) delete process.env.NEXTAUTH_SECRET; else process.env.NEXTAUTH_SECRET = old; }
});

test('PX decisions require all rows and reject unknown targets and competing updates', () => {
  const { rows } = parsePxCsv(csv([row, row])); const entries = [entry(rows[0])], preview = buildPxPreview(rows, entries);
  assert.throws(() => validatePxDecisions([], preview));
  assert.throws(() => validatePxDecisions([{ action: 'add' }, null], preview));
  assert.throws(() => validatePxDecisions([{ action: 'update', targetId: 'unknown' }, { action: 'skip' }], preview));
  assert.throws(() => validatePxDecisions([{ action: 'update', targetId: 'existing' }, { action: 'update', targetId: 'existing' }], preview));
  assert.equal(validatePxDecisions([{ action: 'add' }, { action: 'skip' }], preview).length, 2);
  assert.equal(validatePxDecisions([{ action: 'update', targetId: 'manually-selected' }, { action: 'skip' }], preview, [entry(rows[0], 'manually-selected')])[0].targetId, 'manually-selected');
});

test('PX settlement summary uses date-only months and counts statements rather than projects', () => {
  const { rows } = parsePxCsv(csv());
  const months = pxMonthlySummary([...rows, { ...rows[0], sentOn: '2027-01-01' }], 2026);
  assert.equal(months[3].count, 1); assert.equal(months[3].gross, 15000); assert.equal(months[3].net, 11700);
  assert.equal(months[3].warnings, 1); assert.equal(months[3].difference, 2106);
  assert.equal(months[0].count, 0);
});

test('PX additive migration preserves legacy tables and supports distinct identical statements with a unique import receipt', async () => {
  const { PGlite } = await import('@electric-sql/pglite');
  const db = await PGlite.create();
  try {
    await db.exec('CREATE TABLE "Order" (id TEXT PRIMARY KEY, price INTEGER); INSERT INTO "Order" VALUES (\'legacy\',123);');
    await db.exec(fs.readFileSync(path.join(root, 'prisma/migrations/202611130001_pxstudio/migration.sql'), 'utf8'));
    assert.equal((await db.query('SELECT price FROM "Order" WHERE id=\'legacy\'')).rows[0].price, 123);
    await db.exec(`INSERT INTO "PxImport" (id,"fileHash","fileName","rawCsv","rowCount",added,updated,skipped,"warningCount") VALUES ('batch','hash','qa.csv','raw',2,2,0,0,0)`);
    await assert.rejects(db.exec(`INSERT INTO "PxImport" (id,"fileHash","fileName","rawCsv","rowCount",added,updated,skipped,"warningCount") VALUES ('replay','hash','qa.csv','raw',2,2,0,0,0)`));
    for (const id of ['one', 'two']) await db.query(`INSERT INTO "PxEntry" (id,"sentOn","songTitle",category,"clientName",gross,fee,withholding,net,"paymentStatus",fingerprint,"rawCells","updatedAt") VALUES ($1,'2026-01-01','qa','mix','qa',100,0,0,100,'送金済み','same','[]',CURRENT_TIMESTAMP)`, [id]);
    assert.equal((await db.query('SELECT count(*) AS count FROM "PxEntry"')).rows[0].count, 2);
  } finally { await db.close(); }
});

function pxClient(preview, entries = []) {
  const values = [], requests = []; let cursor = 0, refreshes = 0;
  const react = { ...require('react'), useState(initial) { const i = cursor++; if (!(i in values)) values[i] = typeof initial === 'function' ? initial() : initial; return [values[i], value => { values[i] = typeof value === 'function' ? value(values[i]) : value; }]; } };
  react.useRef = initial => react.useState(() => ({ current: initial }))[0];
  const Client = createLoader({ react, recharts: {}, 'next/navigation': { useRouter: () => ({ refresh() { refreshes++; } }) }, fetch: async (url, options) => {
    const body = JSON.parse(options.body); requests.push(body);
    return Response.json(body.action === 'preview' ? { success: true, preview } : { success: true, result: { added: 1, updated: 1, skipped: 0 } });
  } })('src/components/admin/pxstudio/PxStudioClient.tsx').PxStudioClient;
  function render() {
    cursor = 0; const nodes = [];
    function walk(n) { if (Array.isArray(n)) return n.forEach(walk); if (!n?.props) return; nodes.push(n); walk(n.props.children); }
    walk(Client({ entries, history: [] })); return nodes;
  }
  return { render, requests, get refreshes() { return refreshes; } };
}
const flush = () => new Promise(resolve => setImmediate(resolve));
async function selectClientFile(client) {
  const bytes = new TextEncoder().encode(csv());
  client.render().find(n => n.type === 'input' && n.props.type === 'file').props.onChange({ currentTarget: { files: [{ size: bytes.length, name: 'qa.csv', arrayBuffer: async () => bytes.buffer }], value: 'qa.csv' } });
  await flush();
}

test('PX client upload only previews; ambiguous candidates block save until explicitly resolved and confirmed', async () => {
  const { rows } = parsePxCsv(csv()); const existing = [entry(rows[0])];
  const changed = [...row]; changed[4] = '16000';
  const previewRows = buildPxPreview(parsePxCsv(csv([changed])).rows, existing);
  const client = pxClient({ token: 'signed', expiresAt: Date.now() + 10000, rows: previewRows, alreadyImported: false }, existing);
  await selectClientFile(client);
  assert.deepEqual(client.requests.map(r => r.action), ['preview']);
  const save = () => client.render().find(n => n.type === 'button' && n.props.children === '確認した内容で保存');
  assert.equal(save().props.disabled, true);
  client.render().find(n => n.type === 'select' && n.props.value === '').props.onChange({ target: { value: 'update' } });
  client.render().filter(n => n.type === 'select' && n.props.value === '').at(-1).props.onChange({ target: { value: 'existing' } });
  assert.equal(save().props.disabled, true);
  client.render().find(n => n.type === 'input' && n.props.type === 'checkbox').props.onChange({ target: { checked: true } });
  assert.equal(save().props.disabled, false);
  save().props.onClick(); await flush();
  assert.equal(client.requests[1].decisions[0].targetId, 'existing'); assert.equal(client.requests[1].confirmed, true);
  assert.equal(client.refreshes, 1);
});

test('PX client defaults exact matches to skip and offers no save button for an already-imported file', async () => {
  const { rows } = parsePxCsv(csv()); const entries = [entry(rows[0])], previewRows = buildPxPreview(rows, entries);
  const client = pxClient({ rows: previewRows, alreadyImported: false }, entries);
  await selectClientFile(client);
  assert.ok(client.render().some(n => n.type === 'select' && n.props.value === 'skip'));
  const repeated = pxClient({ rows: previewRows, alreadyImported: true }, entries);
  await selectClientFile(repeated);
  assert.equal(repeated.render().some(n => n.type === 'button' && n.props.children === '確認した内容で保存'), false);
  assert.deepEqual(repeated.requests.map(r => r.action), ['preview']);
});
