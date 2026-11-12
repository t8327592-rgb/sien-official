import { PrismaClient } from '@prisma/client';
import { createHash, createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

// Explicit operational commands only. Never called by builds or request handlers.
// node --env-file=.env scripts/pxstudio-release.mjs --report|--backup|--restore-check|--migrate|--verify
const mode = process.argv[2];
if (process.argv.length !== 3 || !['--report', '--backup', '--restore-check', '--migrate', '--verify'].includes(mode)) throw Error('Choose one explicit release operation');
const expectedHost = 'ep-dark-fog-atw8j4kc.c-9.us-east-1.aws.neon.tech';
const direct = new URL(process.env.POSTGRES_URL_NON_POOLING || 'http://invalid');
if (direct.hostname !== expectedHost || direct.pathname !== '/neondb' || direct.searchParams.get('sslmode') !== 'require') throw Error('Production target does not match the approved database');
const prisma = new PrismaClient({ datasources: { db: { url: direct.href } } });
const directory = path.resolve(import.meta.dirname, '../../audit/pxstudio-release-2026-11-13');
const backupFile = path.join(directory, 'database-before.encrypted.json');
const newTables = ['PxEntry', 'PxImport', 'PxImportChange'];
const ident = value => '"' + value.replaceAll('"', '""') + '"';
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(k => [k, canonical(value[k])]));
  return value;
}
const recordHash = row => hash(canonical(row));
const tableHash = rows => hash(rows.map(recordHash).sort());

function protectKey(bytes, decrypt = false) {
  const script = `Add-Type -AssemblyName System.Security; $bytes=[Convert]::FromBase64String([Console]::In.ReadToEnd()); $result=[System.Security.Cryptography.ProtectedData]::${decrypt ? 'Unprotect' : 'Protect'}($bytes,$null,[System.Security.Cryptography.DataProtectionScope]::CurrentUser); [Console]::Out.Write([Convert]::ToBase64String($result));`;
  const result = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], { input: bytes.toString('base64'), encoding: 'utf8', windowsHide: true });
  if (result.status !== 0) throw Error('Backup key protection failed');
  return Buffer.from(result.stdout.trim(), 'base64');
}
function readBackup() {
  const saved = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
  const key = protectKey(Buffer.from(saved.wrappedKey, 'base64'), true);
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(saved.iv, 'base64'));
  decipher.setAuthTag(Buffer.from(saved.tag, 'base64'));
  const decoded = JSON.parse(Buffer.concat([decipher.update(Buffer.from(saved.ciphertext, 'base64')), decipher.final()]).toString('utf8'));
  if (hash(decoded) !== saved.contentHash || decoded.host !== expectedHost) throw Error('Backup integrity verification failed');
  return decoded;
}

async function snapshot() {
  return prisma.$transaction(async tx => {
    await tx.$executeRawUnsafe('SET TRANSACTION READ ONLY');
    const [{ schema }] = await tx.$queryRawUnsafe('SELECT current_schema() AS schema');
    const tables = await tx.$queryRawUnsafe("SELECT table_name FROM information_schema.tables WHERE table_schema=current_schema() AND table_type='BASE TABLE' ORDER BY table_name");
    const columns = await tx.$queryRawUnsafe(`SELECT c.relname AS "table", a.attname AS name, format_type(a.atttypid,a.atttypmod) AS type,
      a.attnotnull AS "notNull", pg_get_expr(d.adbin,d.adrelid) AS "default", a.attidentity::text AS identity, a.attgenerated::text AS generated
      FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace JOIN pg_attribute a ON a.attrelid=c.oid
      LEFT JOIN pg_attrdef d ON d.adrelid=c.oid AND d.adnum=a.attnum
      WHERE n.nspname=current_schema() AND c.relkind='r' AND a.attnum>0 AND NOT a.attisdropped ORDER BY c.relname,a.attnum`);
    const constraints = await tx.$queryRawUnsafe(`SELECT t.relname AS "table", c.conname AS name, pg_get_constraintdef(c.oid) AS definition
      FROM pg_constraint c JOIN pg_class t ON t.oid=c.conrelid JOIN pg_namespace n ON n.oid=t.relnamespace
      WHERE n.nspname=current_schema() ORDER BY CASE WHEN c.contype='f' THEN 1 ELSE 0 END,t.relname,c.conname`);
    const indexes = await tx.$queryRawUnsafe(`SELECT pg_get_indexdef(i.indexrelid) AS definition FROM pg_index i
      JOIN pg_class t ON t.oid=i.indrelid JOIN pg_namespace n ON n.oid=t.relnamespace
      WHERE n.nspname=current_schema() AND NOT EXISTS(SELECT 1 FROM pg_constraint c WHERE c.conindid=i.indexrelid) ORDER BY i.indexrelid::regclass::text`);
    const [{ unsupported }] = await tx.$queryRawUnsafe(`SELECT (
      (SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname=current_schema() AND (c.relkind IN ('S','v','m') OR c.relrowsecurity)) +
      (SELECT count(*) FROM pg_trigger g JOIN pg_class c ON c.oid=g.tgrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname=current_schema() AND NOT g.tgisinternal)
    )::integer AS unsupported`);
    if (unsupported || columns.some(c => c.identity || c.generated)) throw Error('Backup requires manual review of nonstandard schema features');
    const rows = {};
    for (const { table_name: table } of tables) rows[table] = (await tx.$queryRawUnsafe(`SELECT to_jsonb(t) AS record FROM ${ident(schema)}.${ident(table)} t ORDER BY to_jsonb(t)::text`)).map(r => r.record);
    const createTables = tables.map(({ table_name: table }) => `CREATE TABLE ${ident(schema)}.${ident(table)} (${columns.filter(c => c.table === table).map(c => `${ident(c.name)} ${c.type}${c.default ? ` DEFAULT ${c.default}` : ''}${c.notNull ? ' NOT NULL' : ''}`).join(', ')})`);
    return { version: 1, createdAt: new Date().toISOString(), host: expectedHost, schema, columns, constraints, indexes, createTables, rows };
  }, { isolationLevel: 'RepeatableRead', timeout: 120000 });
}
function summary(state) {
  return { host: state.host, createdAt: state.createdAt, counts: Object.fromEntries(Object.entries(state.rows).map(([table, rows]) => [table, rows.length])), rowHashes: Object.fromEntries(Object.entries(state.rows).map(([table, rows]) => [table, tableHash(rows)])) };
}
async function restoreCheck(state) {
  // Restores only into disposable in-memory PostgreSQL, never the deployment connection.
  const { PGlite } = await import('@electric-sql/pglite');
  const db = await PGlite.create();
  try {
    await db.exec(`CREATE SCHEMA IF NOT EXISTS ${ident(state.schema)}`);
    for (const sql of state.createTables) await db.exec(sql);
    for (const [table, rows] of Object.entries(state.rows)) if (rows.length) {
      const qualified = `${ident(state.schema)}.${ident(table)}`;
      await db.query(`INSERT INTO ${qualified} SELECT * FROM jsonb_populate_recordset(NULL::${qualified}, $1::jsonb)`, [JSON.stringify(rows)]);
    }
    for (const constraint of state.constraints) await db.exec(`ALTER TABLE ${ident(state.schema)}.${ident(constraint.table)} ADD CONSTRAINT ${ident(constraint.name)} ${constraint.definition}`);
    for (const index of state.indexes) await db.exec(index.definition);
    for (const [table, rows] of Object.entries(state.rows)) {
      const restored = (await db.query(`SELECT to_jsonb(t) AS record FROM ${ident(state.schema)}.${ident(table)} t`)).rows.map(r => r.record);
      if (tableHash(restored) !== tableHash(rows)) throw Error('Disposable restore did not preserve all row values');
    }
    const result = { verifiedAt: new Date().toISOString(), backupHash: hash(state), mode: 'DISPOSABLE_RESTORE_VERIFIED', ...summary(state) };
    fs.writeFileSync(path.join(directory, 'restore-check.json'), JSON.stringify(result, null, 2));
    return result;
  } finally { await db.close(); }
}

try {
  fs.mkdirSync(directory, { recursive: true });
  if (mode === '--restore-check') {
    const result = await restoreCheck(readBackup());
    console.log(JSON.stringify({ mode: result.mode, counts: result.counts }));
  } else if (mode === '--backup') {
    if (fs.existsSync(backupFile)) throw Error('Backup already exists; refusing to overwrite');
    const state = await snapshot();
    const key = randomBytes(32), iv = randomBytes(12), cipher = createCipheriv('aes-256-gcm', key, iv);
    const ciphertext = Buffer.concat([cipher.update(Buffer.from(JSON.stringify(state))), cipher.final()]);
    const envelope = { version: 1, algorithm: 'AES-256-GCM', keyProtection: 'Windows DPAPI CurrentUser', wrappedKey: protectKey(key).toString('base64'),
      iv: iv.toString('base64'), tag: cipher.getAuthTag().toString('base64'), ciphertext: ciphertext.toString('base64'), contentHash: hash(state) };
    fs.writeFileSync(backupFile, JSON.stringify(envelope), { flag: 'wx' });
    const verified = readBackup();
    fs.writeFileSync(path.join(directory, 'before-summary.json'), JSON.stringify(summary(verified), null, 2));
    console.log(JSON.stringify({ mode: 'ENCRYPTED_BACKUP_VERIFIED', backupPath: backupFile, counts: summary(verified).counts }));
  } else if (mode === '--migrate') {
    const before = readBackup();
    const check = JSON.parse(fs.readFileSync(path.join(directory, 'restore-check.json'), 'utf8'));
    if (check.backupHash !== hash(before)) throw Error('Verified disposable restore is required before migration');
    const sql = fs.readFileSync(new URL('../prisma/migrations/202611130001_pxstudio/migration.sql', import.meta.url), 'utf8');
    const statements = sql.replace(/--[^\n]*/g, '').split(';').map(s => s.trim()).filter(Boolean);
    if (!statements.length || statements.some(s => !/^CREATE (?:TABLE|(?:UNIQUE )?INDEX) /i.test(s) || !/"Px(?:Entry|Import|ImportChange)(?:_[A-Za-z0-9_]+)?"/.test(s))) throw Error('Migration must contain only the approved additive PXstudio schema');
    const result = await prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(202611130001::bigint)`;
      const present = await tx.$queryRawUnsafe("SELECT table_name FROM information_schema.tables WHERE table_schema=current_schema() AND table_name IN ('PxEntry','PxImport','PxImportChange')");
      if (present.length) throw Error('PXstudio tables already exist; do not rerun migration blindly');
      for (const statement of statements) await tx.$executeRawUnsafe(statement);
      return { mode: 'ADDITIVE_MIGRATION_APPLIED', tables: newTables, migrationHash: hash(sql), existingRowsWritten: 0 };
    }, { timeout: 60000 });
    fs.writeFileSync(path.join(directory, 'migration.json'), JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result));
  } else {
    const state = await snapshot();
    if (mode === '--verify') {
      const before = readBackup();
      const missing = {}, changed = {}, added = {};
      for (const [table, rows] of Object.entries(before.rows)) {
        const current = state.rows[table];
        if (!current) throw Error('Original table missing after release');
        const idColumn = before.columns.find(c => c.table === table).name;
        const index = new Map(current.map(row => [JSON.stringify(row[idColumn]), row]));
        missing[table] = rows.filter(row => !index.has(JSON.stringify(row[idColumn]))).length;
        changed[table] = rows.filter(row => { const next = index.get(JSON.stringify(row[idColumn])); return next && recordHash(next) !== recordHash(row); }).length;
        added[table] = current.length - rows.length;
      }
      const result = { mode: 'PRODUCTION_DATA_VERIFIED', ...summary(state), missing, changed, added };
      fs.writeFileSync(path.join(directory, 'after-summary.json'), JSON.stringify(result, null, 2));
      if (Object.values(missing).some(Boolean) || Object.values(changed).some(Boolean)) throw Error('Existing rows changed or missing; review the private after-summary before proceeding');
      console.log(JSON.stringify({ mode: result.mode, counts: result.counts, originalRowsChanged: 0, originalRowsMissing: 0, added }));
    } else console.log(JSON.stringify({ mode: 'READ_ONLY_REPORT', ...summary(state) }));
  }
} catch (error) {
  // Never log Prisma exception text, source rows, credentials, or connection strings.
  console.error(JSON.stringify({ mode, result: 'FAILED', type: error?.name, code: error?.code,
    reason: error instanceof Error && /^(Backup |Production target|Verified disposable|PXstudio tables|Migration must|Original table|Existing rows|Disposable restore)/.test(error.message) ? error.message : 'Operation failed. No automatic restore, reset or data deletion was attempted.' }));
  process.exitCode = 1;
} finally { await prisma.$disconnect(); }
