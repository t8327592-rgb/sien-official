import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';
import path from 'node:path';
import { createHash, randomBytes, createCipheriv, createDecipheriv } from 'node:crypto';
import { spawnSync } from 'node:child_process';

// Operational release checkpoint, not an automated restore tool.
// Load the existing deployment environment explicitly with node --env-file=.env.
const args = process.argv.slice(2);
const mode = args[0] || '--report';
if (!['--report', '--backup', '--verify'].includes(mode) || args.length > 1) throw Error('Select --report, --backup or --verify');
const expectedHost = process.env.RELEASE_DATABASE_HOST;
const databaseUrl = process.env.POSTGRES_URL_NON_POOLING;
if (!expectedHost || !databaseUrl || new URL(databaseUrl).hostname !== expectedHost || ['localhost', '127.0.0.1'].includes(expectedHost)) throw Error('Deployment database target does not match');
const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
const directory = path.resolve(import.meta.dirname, '../../audit/admin-release-2026-11-05');
const backupFile = path.join(directory, 'database-before.encrypted.json');
const tables = ['User', 'Order', 'BusinessContact', 'Expense', 'SiteSetting', 'SubmissionReceipt', 'NotificationJob', 'OrderFeedback', 'Post', 'Plan', 'Option', 'Portfolio', 'Review', 'Profile', 'FAQ', 'Service', 'Campaign', 'PaymentRecord'];
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
function protectKey(key, decrypt = false) {
  const script = `Add-Type -AssemblyName System.Security; $bytes=[Convert]::FromBase64String([Console]::In.ReadToEnd()); $result=[System.Security.Cryptography.ProtectedData]::${decrypt ? 'Unprotect' : 'Protect'}($bytes,$null,[System.Security.Cryptography.DataProtectionScope]::CurrentUser); [Console]::Out.Write([Convert]::ToBase64String($result));`;
  const child = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], { input: key.toString('base64'), encoding: 'utf8', windowsHide: true });
  if (child.status !== 0) throw Error('Windows current-user backup-key protection failed');
  return Buffer.from(child.stdout.trim(), 'base64');
}
async function snapshot() {
  return prisma.$transaction(async tx => {
    await tx.$executeRawUnsafe('SET TRANSACTION READ ONLY');
    const catalog = await tx.$queryRaw`SELECT table_name, column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema = current_schema() ORDER BY table_name, ordinal_position`;
    const present = new Set(catalog.map(c => c.table_name));
    const rows = {};
    for (const table of tables) if (present.has(table)) rows[table] = await tx.$queryRawUnsafe(`SELECT * FROM "${table}" ORDER BY 1`);
    return { createdAt: new Date().toISOString(), host: expectedHost, columns: catalog, rows };
  }, { isolationLevel: 'RepeatableRead', timeout: 60000 });
}
try {
  fs.mkdirSync(directory, { recursive: true });
  const state = await snapshot();
  const inventory = (state.rows.BusinessContact || []).map(c => ({ id: c.id, status: c.status, createdAt: c.createdAt, hasFinalAmount: c.finalPrice !== null }));
  const summary = { verifiedAt: state.createdAt, counts: Object.fromEntries(Object.entries(state.rows).map(([table, rows]) => [table, rows.length])), businessInventory: inventory };
  if (mode === '--backup') {
    if (fs.existsSync(backupFile)) throw Error('The pre-release backup already exists; refusing to overwrite');
    const key = randomBytes(32), iv = randomBytes(12);
    const serialized = Buffer.from(JSON.stringify(state));
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const data = Buffer.concat([cipher.update(serialized), cipher.final()]);
    const envelope = { version: 1, algorithm: 'AES-256-GCM', keyProtection: 'Windows DPAPI CurrentUser', wrappedKey: protectKey(key).toString('base64'), iv: iv.toString('base64'), tag: cipher.getAuthTag().toString('base64'), ciphertext: data.toString('base64'), contentHash: hash(state) };
    fs.writeFileSync(backupFile, JSON.stringify(envelope), { flag: 'wx' });
    const saved = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
    const decodedKey = protectKey(Buffer.from(saved.wrappedKey, 'base64'), true);
    const decipher = createDecipheriv('aes-256-gcm', decodedKey, Buffer.from(saved.iv, 'base64'));
    decipher.setAuthTag(Buffer.from(saved.tag, 'base64'));
    const decoded = JSON.parse(Buffer.concat([decipher.update(Buffer.from(saved.ciphertext, 'base64')), decipher.final()]).toString());
    if (hash(decoded) !== saved.contentHash) throw Error('Backup verification failed');
    fs.writeFileSync(path.join(directory, 'before-summary.json'), JSON.stringify(summary, null, 2));
    console.log(JSON.stringify({ mode: 'ENCRYPTED_BACKUP_VERIFIED', ...summary, backupPath: backupFile }, null, 2));
  } else if (mode === '--verify') {
    const saved = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
    const key = protectKey(Buffer.from(saved.wrappedKey, 'base64'), true);
    const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(saved.iv, 'base64'));
    decipher.setAuthTag(Buffer.from(saved.tag, 'base64'));
    const before = JSON.parse(Buffer.concat([decipher.update(Buffer.from(saved.ciphertext, 'base64')), decipher.final()]).toString());
    const changed = [], missing = [];
    for (const table of ['Order', 'BusinessContact']) for (const row of before.rows[table]) {
      const current = state.rows[table].find(r => r.id === row.id);
      if (!current) missing.push({ table, id: row.id });
      else if (hash(Object.fromEntries(Object.keys(row).map(k => [k, current[k]]))) !== hash(row)) changed.push({ table, id: row.id });
    }
    if (changed.length || missing.length) throw Error(JSON.stringify({ message: 'Original records changed or missing; stop release', changed, missing }));
    const expectedTests = new Set(before.rows.BusinessContact.filter(c => ['CANCELED', 'CANCELLED'].includes(c.status)).map(c => c.id));
    const links = state.rows.BusinessContact.map(c => {
      const orders = state.rows.Order.filter(o => o.businessContactId === c.id);
      return { sourceId: c.id, linked: orders.length, orderId: orders[0]?.id, isTest: orders[0]?.isTest, expectedTest: expectedTests.has(c.id) };
    });
    if (links.some(l => l.linked !== 1 || l.isTest !== l.expectedTest)) throw Error('Corporate mapping or explicit test classification differs');
    const result = { mode: 'VERIFIED', ...summary, originalOrdersPreserved: before.rows.Order.length, originalBusinessContactsPreserved: before.rows.BusinessContact.length, corporateMappings: links, originalRecordsChanged: 0, originalRecordsMissing: 0 };
    fs.writeFileSync(path.join(directory, 'after-summary.json'), JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result, null, 2));
  } else console.log(JSON.stringify({ mode: 'READ_ONLY', ...summary }, null, 2));
} catch (error) {
  // Do not print connection strings, customer content, or Prisma error metadata.
  console.error(error instanceof Error && /Original records|Corporate mapping|backup|Backup|overwrite|target does not match/.test(error.message) ? error.message : 'Release state operation failed. No automatic restore or reset was attempted.');
  console.error(JSON.stringify({ type: error?.name, code: error?.code, databaseCode: error?.meta?.code, location: error?.stack?.split('\n').find(line => line.includes('admin-release-state.mjs'))?.trim() }));
  process.exitCode = 1;
} finally { await prisma.$disconnect(); }
