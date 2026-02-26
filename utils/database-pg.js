const { Pool } = require('pg');

// Create PostgreSQL connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize database tables
async function initDatabase() {
    const client = await pool.connect();
    
    try {
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
        console.log('[Database] PostgreSQL schema initialized');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('[Database] Error initializing PostgreSQL:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Wrapper to make PostgreSQL work like better-sqlite3 (synchronous)
class PostgreSQLAdapter {
    constructor() {
        this.pool = pool;
    }

    prepare(sql) {
        const self = this;
        
        // Convert SQLite syntax to PostgreSQL
        let paramCount = 0;
        const pgSql = sql
            .replace(/\?/g, () => `$${++paramCount}`)
            .replace(/INSERT OR REPLACE/gi, 'INSERT')
            .replace(/INSERT OR IGNORE/gi, 'INSERT')
            .replace(/ON CONFLICT\((\w+)\) DO UPDATE SET/gi, 'ON CONFLICT ($1) DO UPDATE SET');

        // Return synchronous-like interface using deasync
        const deasync = require('deasync');

        return {
            get: (...params) => {
                let result;
                let done = false;
                let error;

                pool.query(pgSql, params)
                    .then(res => {
                        result = res.rows[0];
                        done = true;
                    })
                    .catch(err => {
                        error = err;
                        done = true;
                    });

                deasync.loopWhile(() => !done);
                
                if (error) throw error;
                return result;
            },
            all: (...params) => {
                let result;
                let done = false;
                let error;

                pool.query(pgSql, params)
                    .then(res => {
                        result = res.rows;
                        done = true;
                    })
                    .catch(err => {
                        error = err;
                        done = true;
                    });

                deasync.loopWhile(() => !done);
                
                if (error) throw error;
                return result;
            },
            run: (...params) => {
                let result;
                let done = false;
                let error;

                pool.query(pgSql, params)
                    .then(res => {
                        result = { changes: res.rowCount };
                        done = true;
                    })
                    .catch(err => {
                        error = err;
                        done = true;
                    });

                deasync.loopWhile(() => !done);
                
                if (error) throw error;
                return result;
            }
        };
    }

    exec(sql) {
        const deasync = require('deasync');
        let done = false;
        let error;

        pool.query(sql)
            .then(() => { done = true; })
            .catch(err => {
                error = err;
                done = true;
            });

        deasync.loopWhile(() => !done);
        
        if (error) throw error;
        return this;
    }

    pragma() {
        // PostgreSQL doesn't use pragma, return this for chaining
        return this;
    }
}

// Initialize on load
initDatabase().catch(console.error);

module.exports = new PostgreSQLAdapter();
