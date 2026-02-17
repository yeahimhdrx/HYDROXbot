const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'bot.db'));

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database tables
db.exec(`
    CREATE TABLE IF NOT EXISTS voice_activity (
        user_id TEXT PRIMARY KEY,
        total_minutes INTEGER DEFAULT 0,
        joined_at INTEGER,
        has_tag INTEGER DEFAULT 0,
        last_updated INTEGER DEFAULT (strftime('%s', 'now'))
    );

    CREATE TABLE IF NOT EXISTS role_grants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        role_name TEXT,
        granted_at INTEGER DEFAULT (strftime('%s', 'now')),
        UNIQUE(user_id, role_name)
    );

    CREATE TABLE IF NOT EXISTS tag_reminders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        role_name TEXT,
        reminded_at INTEGER DEFAULT (strftime('%s', 'now')),
        UNIQUE(user_id, role_name)
    );
`);

module.exports = db;
