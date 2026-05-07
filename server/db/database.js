const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'sws.db');
const db = new Database(dbPath);

function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS files (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL,
      size        INTEGER NOT NULL,
      type        TEXT NOT NULL,
      path        TEXT NOT NULL,
      status      TEXT NOT NULL DEFAULT 'complete',
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      message    TEXT NOT NULL,
      type       TEXT NOT NULL CHECK(type IN ('success', 'error', 'info')),
      is_read    INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('Database initialized successfully.');
}

module.exports = {
  db,
  initDB
};
