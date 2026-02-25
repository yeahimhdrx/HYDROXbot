require('dotenv').config();
const sqliteDb = require('./utils/database');
const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not set in .env file!');
    console.log('Add your PostgreSQL connection string to .env:');
    console.log('DATABASE_URL=postgresql://user:pass@host:5432/dbname');
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function migrate() {
    console.log('🔄 Starting migration from SQLite to PostgreSQL...\n');

    const client = await pool.connect();

    try {
        // First, create tables in PostgreSQL
        console.log('📋 Creating tables in PostgreSQL...');
        
        await client.query('BEGIN');

        // Create voice_activity table
        await client.query(`
            CREATE TABLE IF NOT EXISTS voice_activity (
                user_id TEXT PRIMARY KEY,
                total_seconds INTEGER DEFAULT 0,
                joined_at_ms BIGINT,
                has_tag INTEGER DEFAULT 0,
                last_updated_ms BIGINT,
                session_count INTEGER DEFAULT 0,
                last_session_seconds INTEGER DEFAULT 0
            )
        `);

        // Create role_grants table
        await client.query(`
            CREATE TABLE IF NOT EXISTS role_grants (
                id SERIAL PRIMARY KEY,
                user_id TEXT NOT NULL,
                role_name TEXT NOT NULL,
                granted_at INTEGER DEFAULT EXTRACT(EPOCH FROM NOW()),
                UNIQUE(user_id, role_name)
            )
        `);

        // Create tag_reminders table
        await client.query(`
            CREATE TABLE IF NOT EXISTS tag_reminders (
                id SERIAL PRIMARY KEY,
                user_id TEXT NOT NULL,
                role_name TEXT NOT NULL,
                reminded_at INTEGER DEFAULT EXTRACT(EPOCH FROM NOW()),
                UNIQUE(user_id, role_name)
            )
        `);

        // Create voice_sessions table
        await client.query(`
            CREATE TABLE IF NOT EXISTS voice_sessions (
                id SERIAL PRIMARY KEY,
                user_id TEXT NOT NULL,
                channel_id TEXT,
                channel_name TEXT,
                joined_at_ms BIGINT NOT NULL,
                left_at_ms BIGINT,
                duration_seconds INTEGER,
                created_at INTEGER DEFAULT EXTRACT(EPOCH FROM NOW())
            )
        `);

        // Create message_cache table
        await client.query(`
            CREATE TABLE IF NOT EXISTS message_cache (
                message_id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                user_tag TEXT NOT NULL,
                channel_id TEXT NOT NULL,
                content TEXT,
                has_attachments INTEGER DEFAULT 0,
                attachment_data TEXT,
                embed_count INTEGER DEFAULT 0,
                created_at BIGINT NOT NULL,
                cached_at INTEGER DEFAULT EXTRACT(EPOCH FROM NOW())
            )
        `);

        // Create indexes
        await client.query('CREATE INDEX IF NOT EXISTS idx_voice_sessions_user ON voice_sessions(user_id)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_voice_sessions_date ON voice_sessions(created_at)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_message_cache_user ON message_cache(user_id)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_message_cache_channel ON message_cache(channel_id)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_message_cache_created ON message_cache(created_at)');

        await client.query('COMMIT');
        console.log('   ✅ Tables created successfully\n');

        // Get data from SQLite
        console.log('📥 Reading data from SQLite...');
        const voiceActivity = sqliteDb.prepare('SELECT * FROM voice_activity').all();
        const roleGrants = sqliteDb.prepare('SELECT * FROM role_grants').all();
        const tagReminders = sqliteDb.prepare('SELECT * FROM tag_reminders').all();
        const voiceSessions = sqliteDb.prepare('SELECT * FROM voice_sessions ORDER BY created_at DESC LIMIT 1000').all();

        console.log(`   - Voice Activity: ${voiceActivity.length} records`);
        console.log(`   - Role Grants: ${roleGrants.length} records`);
        console.log(`   - Tag Reminders: ${tagReminders.length} records`);
        console.log(`   - Voice Sessions: ${voiceSessions.length} records\n`);

        await client.query('BEGIN');

        // Migrate voice_activity
        console.log('📤 Migrating voice_activity...');
        for (const row of voiceActivity) {
            await client.query(`
                INSERT INTO voice_activity 
                (user_id, total_seconds, joined_at_ms, has_tag, last_updated_ms, session_count, last_session_seconds)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (user_id) DO UPDATE SET
                    total_seconds = EXCLUDED.total_seconds,
                    joined_at_ms = EXCLUDED.joined_at_ms,
                    has_tag = EXCLUDED.has_tag,
                    last_updated_ms = EXCLUDED.last_updated_ms,
                    session_count = EXCLUDED.session_count,
                    last_session_seconds = EXCLUDED.last_session_seconds
            `, [
                row.user_id,
                row.total_seconds || 0,
                row.joined_at_ms || null,
                row.has_tag || 0,
                row.last_updated_ms || null,
                row.session_count || 0,
                row.last_session_seconds || 0
            ]);
        }
        console.log(`   ✅ Migrated ${voiceActivity.length} voice activity records`);

        // Migrate role_grants
        console.log('📤 Migrating role_grants...');
        for (const row of roleGrants) {
            await client.query(`
                INSERT INTO role_grants (user_id, role_name, granted_at)
                VALUES ($1, $2, $3)
                ON CONFLICT (user_id, role_name) DO NOTHING
            `, [row.user_id, row.role_name, row.granted_at]);
        }
        console.log(`   ✅ Migrated ${roleGrants.length} role grants`);

        // Migrate tag_reminders
        console.log('📤 Migrating tag_reminders...');
        for (const row of tagReminders) {
            await client.query(`
                INSERT INTO tag_reminders (user_id, role_name, reminded_at)
                VALUES ($1, $2, $3)
                ON CONFLICT (user_id, role_name) DO NOTHING
            `, [row.user_id, row.role_name, row.reminded_at]);
        }
        console.log(`   ✅ Migrated ${tagReminders.length} tag reminders`);

        // Migrate voice_sessions
        console.log('📤 Migrating voice_sessions...');
        for (const row of voiceSessions) {
            await client.query(`
                INSERT INTO voice_sessions 
                (user_id, channel_id, channel_name, joined_at_ms, left_at_ms, duration_seconds, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [
                row.user_id,
                row.channel_id,
                row.channel_name,
                row.joined_at_ms,
                row.left_at_ms,
                row.duration_seconds,
                row.created_at
            ]);
        }
        console.log(`   ✅ Migrated ${voiceSessions.length} voice sessions`);

        await client.query('COMMIT');

        console.log('\n🎉 Migration completed successfully!');
        console.log('\nNext steps:');
        console.log('1. Update all files to use database-adapter.js');
        console.log('2. Test the bot locally');
        console.log('3. Deploy to Railway');
        console.log('4. Your data will now be accessible from anywhere!');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('\n❌ Migration failed:', error.message);
        console.error(error);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
