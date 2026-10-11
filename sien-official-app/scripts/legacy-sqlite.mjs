import { DatabaseSync } from 'node:sqlite';

// Compatibility for the existing read-only legacy import tools on Node 22.13+.
// No native sqlite3/node-gyp dependency and no writes to the legacy database.
class Database {
  constructor(filename, mode, onOpen) {
    if (mode !== 1) throw Error('Legacy database access must be read-only');
    this.database = new DatabaseSync(filename, { readOnly: true });
    if (onOpen) queueMicrotask(() => onOpen(null));
  }
  serialize(callback) { callback(); }
  all(sql, callback) {
    let rows;
    try { rows = this.database.prepare(sql).all(); }
    catch (error) { return callback(error); }
    return callback(null, rows);
  }
  get(sql, callback) {
    let row;
    try { row = this.database.prepare(sql).get(); }
    catch (error) { return callback(error); }
    return callback(null, row);
  }
  close() { this.database.close(); }
}
const legacySqlite = { Database, OPEN_READONLY: 1 };
export default legacySqlite;
