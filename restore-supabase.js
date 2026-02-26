require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not set in .env file!');
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

console.log('📥 Starting Supabase restore...\n');

// Get backup file from command line or use latest
const backupFile = process.argv[2] || path.join(__dirname, 'backups', 'supabase-latest.json');

if (!fs.existsSync(backupFile)) {
    console.error('❌ Backup file not found:', backupFile);
    console.log('Usage: node restore-supabase.js [backup-file.json]');
    console.log('Or place backup as: backups/supabase-latest.json');
    process.exit(1);
}

async function restoreSupabase() {
    const backup = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
    
    console.log(`📦 Backup from: ${backup.timestamp}`);
    console.log(`📊 Contains:`);
    console.log(`   - Users: ${backup.stats.totalUsers}`);
    console.log(`   - Inviters: ${backup.stats.totalInviters}`);
    console.log(`   - Role Grants: ${backup.stats.totalRoleGrants}`);
    console.log(`   - Sessions: ${backup.stats.totalSessions}`);
    console.log('');
    console.log('⚠️  This will overwrite existing data in Supabase!');
    console.log('Restoring in 3 seconds... (Ctrl+C to cancel)');
    
    await new Promise(resolve => setTimeout(resolve, 3000));

    const client = await pool.connect();

    try {
        console.log('🔄 Restoring...\n');
        
        await client.query('BEGIN');

        // Restore voice_activity
        console.log('📤 Restoring voice_activity...');
        let restored = 0;
        for (const row of backup.tables.voiceActivity) {
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
            restored++;
        }
        console.log(`   ✅ Restored ${restored} voice activity records`);

        // Restore invites
        console.log('📤 Restoring invites...');
        restored = 0;
        for (const row of backup.tables.invites) {
            await client.query(`
                INSERT INTO invites 
                (user_id, total_invites, valid_invites, left_invites, fake_invites, last_updated)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (user_id) DO UPDATE SET
                    total_invites = EXCLUDED.total_invites,
                    valid_invites = EXCLUDED.valid_invites,
                    left_invites = EXCLUDED.left_invites,
                    fake_invites = EXCLUDED.fake_invites,
                    last_updated = EXCLUDED.last_updated
            `, [
                row.user_id,
                row.total_invites || 0,
                row.valid_invites || 0,
                row.left_invites || 0,
                row.fake_invites || 0,
                row.last_updated || Math.floor(Date.now() / 1000)
            ]);
            restored++;
        }
        console.log(`   ✅ Restored ${restored} invite records`);

        // Restore role_grants
        console.log('📤 Restoring role_grants...');
        restored = 0;
        for (const row of backup.tables.roleGrants) {
            await client.query(`
                INSERT INTO role_grants (user_id, role_name, granted_at)
                VALUES ($1, $2, $3)
                ON CONFLICT (user_id, role_name) DO NOTHING
            `, [row.user_id, row.role_name, row.granted_at]);
            restored++;
        }
        console.log(`   ✅ Restored ${restored} role grants`);

        // Restore invite_roles_granted
        console.log('📤 Restoring invite_roles_granted...');
        restored = 0;
        for (const row of backup.tables.inviteRolesGranted) {
            await client.query(`
                INSERT INTO invite_roles_granted (user_id, role_name, invites_required, granted_at)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (user_id, role_name) DO NOTHING
            `, [row.user_id, row.role_name, row.invites_required, row.granted_at]);
            restored++;
        }
        console.log(`   ✅ Restored ${restored} invite role grants`);

        // Restore tag_reminders
        console.log('📤 Restoring tag_reminders...');
        restored = 0;
        for (const row of backup.tables.tagReminders) {
            await client.query(`
                INSERT INTO tag_reminders (user_id, role_name, reminded_at)
                VALUES ($1, $2, $3)
                ON CONFLICT (user_id, role_name) DO NOTHING
            `, [row.user_id, row.role_name, row.reminded_at]);
            restored++;
        }
        console.log(`   ✅ Restored ${restored} tag reminders`);

        await client.query('COMMIT');

        console.log('\n🎉 Supabase restore completed successfully!');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('\n❌ Restore failed:', error.message);
        console.error(error);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

restoreSupabase();
