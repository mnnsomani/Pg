// database.js — SQLite setup
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'odyssey.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    email       TEXT UNIQUE NOT NULL,
    password    TEXT NOT NULL,
    created_at  TEXT DEFAULT (datetime('now','localtime'))
  );

  CREATE TABLE IF NOT EXISTS enquiries (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    email       TEXT NOT NULL,
    phone       TEXT,
    message     TEXT,
    created_at  TEXT DEFAULT (datetime('now','localtime'))
  );

  CREATE TABLE IF NOT EXISTS pg_listings (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_name  TEXT NOT NULL,
    email       TEXT NOT NULL,
    phone       TEXT NOT NULL,
    pg_name     TEXT NOT NULL,
    area        TEXT NOT NULL,
    address     TEXT NOT NULL,
    type        TEXT NOT NULL,
    price       INTEGER NOT NULL,
    amenities   TEXT,
    rooms       INTEGER,
    description TEXT,
    status      TEXT DEFAULT 'pending',
    created_at  TEXT DEFAULT (datetime('now','localtime'))
  );
`);

module.exports = db;
