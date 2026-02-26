require('dotenv').config();
const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not set in .env file!');
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function createInviteTables() {
    console.log('📋 Creating invite tables in Supabase...\n');

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Create invites table
        console.log('Creating invites table...');
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
        console.log('   ✅ invites table created');

        // Create invite_roles_granted table
        console.log('Creating invite_roles_granted table...');
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
        console.log('   ✅ invite_roles_granted table created');

        // Create indexes
        console.log('Creating indexes...');
        await client.query('CREATE INDEX IF NOT EXISTS idx_invites_valid ON invites(valid_invites DESC)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_invite_roles_user ON invite_roles_granted(user_id)');
        console.log('   ✅ indexes created');

        await client.query('COMMIT');

        console.log('\n🎉 Invite tables created successfully!');
        console.log('\nYou can now:');
        console.log('1. Run: node backup-supabase.js');
        console.log('2. Deploy your bot');
        console.log('3. Invite tracking will work!\n');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('\n❌ Failed to create tables:', error.message);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

createInviteTables();
