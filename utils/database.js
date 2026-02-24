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

// Initialize database tables with enhanced precision
db.exec(`
    CREATE TABLE IF NOT EXISTS voice_activity (
        user_id TEXT PRIMARY KEY,
        total_seconds INTEGER DEFAULT 0,
        joined_at_ms INTEGER,
        has_tag INTEGER DEFAULT 0,
        last_updated_ms INTEGER,
        session_count INTEGER DEFAULT 0,
        last_session_seconds INTEGER DEFAULT 0
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

    CREATE TABLE IF NOT EXISTS voice_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        channel_id TEXT,
        channel_name TEXT,
        joined_at_ms INTEGER NOT NULL,
        left_at_ms INTEGER,
        duration_seconds INTEGER,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
    );

    CREATE TABLE IF NOT EXISTS message_cache (
        message_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        user_tag TEXT NOT NULL,
        channel_id TEXT NOT NULL,
        content TEXT,
        has_attachments INTEGER DEFAULT 0,
        attachment_data TEXT,
        embed_count INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL,
        cached_at INTEGER DEFAULT (strftime('%s', 'now'))
    );

    CREATE TABLE IF NOT EXISTS invites (
        user_id TEXT PRIMARY KEY,
        total_invites INTEGER DEFAULT 0,
        valid_invites INTEGER DEFAULT 0,
        left_invites INTEGER DEFAULT 0,
        fake_invites INTEGER DEFAULT 0,
        last_updated INTEGER DEFAULT (strftime('%s', 'now'))
    );

    CREATE TABLE IF NOT EXISTS invite_roles_granted (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        role_name TEXT NOT NULL,
        invites_required INTEGER NOT NULL,
        granted_at INTEGER DEFAULT (strftime('%s', 'now')),
        UNIQUE(user_id, role_name)
    );

    CREATE INDEX IF NOT EXISTS idx_voice_sessions_user ON voice_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_voice_sessions_date ON voice_sessions(created_at);
    CREATE INDEX IF NOT EXISTS idx_message_cache_user ON message_cache(user_id);
    CREATE INDEX IF NOT EXISTS idx_message_cache_channel ON message_cache(channel_id);
    CREATE INDEX IF NOT EXISTS idx_message_cache_created ON message_cache(created_at);
    CREATE INDEX IF NOT EXISTS idx_invites_user ON invites(user_id);
    CREATE INDEX IF NOT EXISTS idx_invites_valid ON invites(valid_invites);
`);

// Migrate existing data from minutes to seconds if needed
try {
    // Check if we need to migrate
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='voice_activity'").all();
    
    if (tables.length > 0) {
        // Get current columns
        const columns = db.prepare("PRAGMA table_info(voice_activity)").all();
        const columnNames = columns.map(col => col.name);
        
        const hasOldMinutes = columnNames.includes('total_minutes');
        const hasNewSeconds = columnNames.includes('total_seconds');
        const hasOldJoinedAt = columnNames.includes('joined_at');
        const hasNewJoinedAtMs = columnNames.includes('joined_at_ms');
        
        if (hasOldMinutes && !hasNewSeconds) {
            console.log('[Database] Migrating voice_activity from minutes to seconds...');
            
            // Add new columns if they don't exist
            if (!hasNewSeconds) {
                db.exec('ALTER TABLE voice_activity ADD COLUMN total_seconds INTEGER DEFAULT 0');
            }
            if (!hasNewJoinedAtMs) {
                db.exec('ALTER TABLE voice_activity ADD COLUMN joined_at_ms INTEGER');
            }
            if (!columnNames.includes('last_updated_ms')) {
                db.exec('ALTER TABLE voice_activity ADD COLUMN last_updated_ms INTEGER DEFAULT (strftime(\'%s\', \'now\') * 1000)');
            }
            if (!columnNames.includes('session_count')) {
                db.exec('ALTER TABLE voice_activity ADD COLUMN session_count INTEGER DEFAULT 0');
            }
            if (!columnNames.includes('last_session_seconds')) {
                db.exec('ALTER TABLE voice_activity ADD COLUMN last_session_seconds INTEGER DEFAULT 0');
            }
            
            // Migrate data
            db.exec('UPDATE voice_activity SET total_seconds = total_minutes * 60 WHERE total_seconds = 0 AND total_minutes > 0');
            
            if (hasOldJoinedAt) {
                db.exec('UPDATE voice_activity SET joined_at_ms = joined_at * 1000 WHERE joined_at IS NOT NULL AND joined_at_ms IS NULL');
            }
            
            console.log('[Database] Migration completed');
        } else if (!hasOldMinutes && !hasNewSeconds) {
            // Fresh install, columns will be created by the CREATE TABLE IF NOT EXISTS above
            console.log('[Database] Fresh installation detected');
        } else {
            console.log('[Database] Database schema is up to date');
        }
    }
} catch (e) {
    console.error('[Database] Migration error:', e.message);
    console.log('[Database] Continuing with existing schema...');
}

module.exports = db;
