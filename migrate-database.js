// Manual database migration script
// Run this once to migrate from old schema to new schema

const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'data', 'bot.db'));

console.log('Starting database migration...');

try {
    // Get current columns
    const columns = db.prepare("PRAGMA table_info(voice_activity)").all();
    const columnNames = columns.map(col => col.name);
    
    console.log('Current columns:', columnNames);
    
    // Check what we have
    const hasOldMinutes = columnNames.includes('total_minutes');
    const hasNewSeconds = columnNames.includes('total_seconds');
    const hasOldJoinedAt = columnNames.includes('joined_at');
    const hasNewJoinedAtMs = columnNames.includes('joined_at_ms');
    
    console.log('Has total_minutes:', hasOldMinutes);
    console.log('Has total_seconds:', hasNewSeconds);
    console.log('Has joined_at:', hasOldJoinedAt);
    console.log('Has joined_at_ms:', hasNewJoinedAtMs);
    
    // Add new columns if they don't exist
    if (!hasNewSeconds) {
        console.log('Adding total_seconds column...');
        db.exec('ALTER TABLE voice_activity ADD COLUMN total_seconds INTEGER DEFAULT 0');
    }
    
    if (!hasNewJoinedAtMs) {
        console.log('Adding joined_at_ms column...');
        db.exec('ALTER TABLE voice_activity ADD COLUMN joined_at_ms INTEGER');
    }
    
    if (!columnNames.includes('last_updated_ms')) {
        console.log('Adding last_updated_ms column...');
        db.exec("ALTER TABLE voice_activity ADD COLUMN last_updated_ms INTEGER");
        // Set default value in a separate UPDATE
        db.exec("UPDATE voice_activity SET last_updated_ms = strftime('%s', 'now') * 1000 WHERE last_updated_ms IS NULL");
    }
    
    if (!columnNames.includes('session_count')) {
        console.log('Adding session_count column...');
        db.exec('ALTER TABLE voice_activity ADD COLUMN session_count INTEGER DEFAULT 0');
    }
    
    if (!columnNames.includes('last_session_seconds')) {
        console.log('Adding last_session_seconds column...');
        db.exec('ALTER TABLE voice_activity ADD COLUMN last_session_seconds INTEGER DEFAULT 0');
    }
    
    // Migrate data if we have old columns
    if (hasOldMinutes && hasNewSeconds) {
        console.log('Migrating total_minutes to total_seconds...');
        const result = db.prepare('UPDATE voice_activity SET total_seconds = total_minutes * 60 WHERE total_seconds = 0 AND total_minutes > 0').run();
        console.log(`Migrated ${result.changes} records`);
    }
    
    if (hasOldJoinedAt && hasNewJoinedAtMs) {
        console.log('Migrating joined_at to joined_at_ms...');
        const result = db.prepare('UPDATE voice_activity SET joined_at_ms = joined_at * 1000 WHERE joined_at IS NOT NULL AND joined_at_ms IS NULL').run();
        console.log(`Migrated ${result.changes} records`);
    }
    
    // Create voice_sessions table if it doesn't exist
    console.log('Creating voice_sessions table...');
    db.exec(`
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
    `);
    
    // Create indexes
    console.log('Creating indexes...');
    db.exec(`
        CREATE INDEX IF NOT EXISTS idx_voice_sessions_user ON voice_sessions(user_id);
        CREATE INDEX IF NOT EXISTS idx_voice_sessions_date ON voice_sessions(created_at);
    `);
    
    // Show final schema
    const finalColumns = db.prepare("PRAGMA table_info(voice_activity)").all();
    console.log('\nFinal schema:');
    finalColumns.forEach(col => {
        console.log(`  - ${col.name} (${col.type})`);
    });
    
    console.log('\n✅ Migration completed successfully!');
    console.log('You can now start the bot with: npm start');
    
} catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
}

db.close();
