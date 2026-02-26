// Unified async database interface for both SQLite and PostgreSQL
const { Pool } = require('pg');

class AsyncDatabase {
    constructor() {
        if (process.env.DATABASE_URL) {
            console.log('[Database] Using PostgreSQL (cloud database)');
            this.type = 'postgresql';
            this.pool = new Pool({
                connectionString: process.env.DATABASE_URL,
                ssl: { rejectUnauthorized: false }
            });
            this.initPostgreSQL();
        } else {
            console.log('[Database] Using SQLite (local file)');
            this.type = 'sqlite';
            this.db = require('./database');
        }
    }

    async initPostgreSQL() {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');

            // Create all tables
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

            await client.query(`
                CREATE TABLE IF NOT EXISTS role_grants (
                    id SERIAL PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    role_name TEXT NOT NULL,
                    granted_at INTEGER DEFAULT EXTRACT(EPOCH FROM NOW()),
                    UNIQUE(user_id, role_name)
                )
            `);

            await client.query(`
                CREATE TABLE IF NOT EXISTS tag_reminders (
                    id SERIAL PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    role_name TEXT NOT NULL,
                    reminded_at INTEGER DEFAULT EXTRACT(EPOCH FROM NOW()),
                    UNIQUE(user_id, role_name)
                )
            `);

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

            await client.query(`
                CREATE TABLE IF NOT EXISTS invites (
                    user_id TEXT PRIMARY KEY,
                    total_invites INTEGER DEFAULT 0,
                    valid_invites INTEGER DEFAULT 0,
                    left_invites INTEGER DEFAULT 0,
                    fake_invites INTEGER DEFAULT 0,
                    last_updated INTEGER DEFAULT EXTRACT(EPOCH FROM NOW())
                )
            `);

            await client.query(`
                CREATE TABLE IF NOT EXISTS invite_roles_granted (
                    id SERIAL PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    role_name TEXT NOT NULL,
                    invites_required INTEGER NOT NULL,
                    granted_at INTEGER DEFAULT EXTRACT(EPOCH FROM NOW()),
                    UNIQUE(user_id, role_name)
                )
            `);

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

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('[Database] Error initializing PostgreSQL:', error);
        } finally {
            client.release();
        }
    }

    // Generic query method
    async query(sql, params = []) {
        if (this.type === 'postgresql') {
            // Convert ? placeholders to $1, $2, etc.
            let paramCount = 0;
            const pgSql = sql.replace(/\?/g, () => `$${++paramCount}`);
            const result = await this.pool.query(pgSql, params);
            return result.rows;
        } else {
            // SQLite
            const stmt = this.db.prepare(sql);
            if (sql.trim().toUpperCase().startsWith('SELECT')) {
                return stmt.all(...params);
            } else {
                return stmt.run(...params);
            }
        }
    }

    // Get single row
    async get(sql, params = []) {
        if (this.type === 'postgresql') {
            let paramCount = 0;
            const pgSql = sql.replace(/\?/g, () => `$${++paramCount}`);
            const result = await this.pool.query(pgSql, params);
            return result.rows[0];
        } else {
            const stmt = this.db.prepare(sql);
            return stmt.get(...params);
        }
    }

    // Get all rows
    async all(sql, params = []) {
        if (this.type === 'postgresql') {
            let paramCount = 0;
            const pgSql = sql.replace(/\?/g, () => `$${++paramCount}`);
            const result = await this.pool.query(pgSql, params);
            return result.rows;
        } else {
            const stmt = this.db.prepare(sql);
            return stmt.all(...params);
        }
    }

    // Run insert/update/delete
    async run(sql, params = []) {
        if (this.type === 'postgresql') {
            let paramCount = 0;
            let pgSql = sql
                .replace(/\?/g, () => `$${++paramCount}`)
                .replace(/INSERT OR REPLACE/gi, 'INSERT')
                .replace(/INSERT OR IGNORE/gi, 'INSERT');
            
            const result = await this.pool.query(pgSql, params);
            return { changes: result.rowCount };
        } else {
            const stmt = this.db.prepare(sql);
            return stmt.run(...params);
        }
    }
}

// Export singleton instance
const dbInstance = new AsyncDatabase();
module.exports = dbInstance;
