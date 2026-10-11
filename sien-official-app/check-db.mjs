import sqlite3 from './scripts/legacy-sqlite.mjs';
const db = new sqlite3.Database('./prisma/dev.db', sqlite3.OPEN_READONLY);

db.serialize(() => {
  db.get('SELECT COUNT(*) as count FROM "Order"', (err, row) => console.log('Orders:', row ? row.count : 0));
  db.get('SELECT COUNT(*) as count FROM Message', (err, row) => console.log('Messages:', row ? row.count : 0));
  db.get('SELECT COUNT(*) as count FROM Contact', (err, row) => console.log('Contacts:', row ? row.count : 0));
  db.get('SELECT COUNT(*) as count FROM User', (err, row) => console.log('Users:', row ? row.count : 0));
});
