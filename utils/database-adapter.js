// Auto-detect which database to use based on environment
// If DATABASE_URL exists → Use PostgreSQL (cloud)
// If not → Use SQLite (local file)

let db;

if (process.env.DATABASE_URL) {
    console.log('[Database] Using PostgreSQL (cloud database)');
    db = require('./database-pg');
} else {
    console.log('[Database] Using SQLite (local file)');
    db = require('./database');
}

module.exports = db;
