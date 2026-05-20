// backend/db/database.js
// Uses sql.js (pure JS SQLite — no native bindings needed)
// Provides a synchronous API compatible with how routes use it.

const path = require('path');
const fs   = require('fs');

const DB_PATH     = path.join(__dirname, 'sparkclub.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

let SQL   = null;  // sql.js module
let _db   = null;  // sql.js Database instance
let ready = false;

// ── Persist helper ───────────────────────────────────────────
function persist() {
  const data = _db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

// ── Statement wrapper (mimics better-sqlite3) ────────────────
function makeStmt(sql) {
  return {
    get(...params) {
      const flat = params.flat();
      const stmt = _db.prepare(sql);
      stmt.bind(flat.length ? flat : []);
      if (stmt.step()) {
        const row = stmt.getAsObject();
        stmt.free();
        return row;
      }
      stmt.free();
      return undefined;
    },
    all(...params) {
      const flat = params.flat();
      const stmt = _db.prepare(sql);
      stmt.bind(flat.length ? flat : []);
      const rows = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      stmt.free();
      return rows;
    },
    run(...params) {
      const flat = params.flat();
      const stmt = _db.prepare(sql);
      stmt.bind(flat.length ? flat : []);
      stmt.step();
      stmt.free();
      const lastIdRow = _db.exec('SELECT last_insert_rowid()');
      const lastId = lastIdRow[0]?.values[0]?.[0] ?? 0;
      persist();
      return { lastInsertRowid: lastId, changes: _db.getRowsModified() };
    },
  };
}

// ── DB proxy ─────────────────────────────────────────────────
function getDb() {
  if (!_db) throw new Error('DB not ready — await initializeDb() at startup');
  return {
    prepare: (sql) => makeStmt(sql),
    exec:    (sql) => { _db.run(sql); persist(); },
    pragma:  () => {},  // no-op
  };
}

// ── Async init (call once at startup) ────────────────────────
async function initializeDb() {
  if (ready) return getDb();

  const initSqlJs = require('sql.js');
  SQL = await initSqlJs();

  // Load from disk or create fresh
  if (fs.existsSync(DB_PATH)) {
    _db = new SQL.Database(fs.readFileSync(DB_PATH));
  } else {
    _db = new SQL.Database();
  }

  // Run schema using sql.js exec which handles multiple statements
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
  _db.run('PRAGMA foreign_keys=ON;');
  _db.exec(schema);
  persist();

  ready = true;
  console.log('✅ Database initialized from schema.sql');
  return getDb();
}

module.exports = { getDb, initializeDb };
