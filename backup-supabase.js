require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not set in .env file!');
    console.log('This script backs up data from Supabase PostgreSQL.');
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function backupSupabase() {
    console.log('📦 Starting Supabase backup...\n');

    const client = await pool.connect();

    try {
        // Export all data from PostgreSQL
        console.log('📥 Reading data from Supabase...');
        
        const voiceActivity = await client.query('SELECT * FROM voice_activity ORDER BY total_seconds DESC');
        const roleGrants = await client.query('SELECT * FROM role_grants ORDER BY granted_at DESC');
        const tagReminders = await client.query('SELECT * FROM tag_reminders ORDER BY reminded_at DESC');
        const voiceSessions = await client.query('SELECT * FROM voice_sessions ORDER BY created_at DESC LIMIT 1000');
        const invites = await client.query('SELECT * FROM invites ORDER BY valid_invites DESC');
        const inviteRolesGranted = await client.query('SELECT * FROM invite_roles_granted ORDER BY granted_at DESC');
        const messageCache = await client.query('SELECT * FROM message_cache ORDER BY created_at DESC LIMIT 1000');

        console.log(`   - Voice Activity: ${voiceActivity.rows.length} records`);
        console.log(`   - Role Grants: ${roleGrants.rows.length} records`);
        console.log(`   - Tag Reminders: ${tagReminders.rows.length} records`);
        console.log(`   - Voice Sessions: ${voiceSessions.rows.length} records`);
        console.log(`   - Invites: ${invites.rows.length} records`);
        console.log(`   - Invite Roles Granted: ${inviteRolesGranted.rows.length} records`);
        console.log(`   - Message Cache: ${messageCache.rows.length} records\n`);

        const backup = {
            timestamp: new Date().toISOString(),
            version: '2.0',
            source: 'supabase',
            tables: {
                voiceActivity: voiceActivity.rows,
                roleGrants: roleGrants.rows,
                tagReminders: tagReminders.rows,
                voiceSessions: voiceSessions.rows,
                invites: invites.rows,
                inviteRolesGranted: inviteRolesGranted.rows,
                messageCache: messageCache.rows
            },
            stats: {
                totalUsers: voiceActivity.rows.length,
                totalInviters: invites.rows.length,
                totalRoleGrants: roleGrants.rows.length,
                totalSessions: voiceSessions.rows.length
            }
        };

        // Create backups directory
        const backupDir = path.join(__dirname, 'backups');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        // Save with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        const filename = `supabase-backup-${timestamp}.json`;
        const filepath = path.join(backupDir, filename);

        fs.writeFileSync(filepath, JSON.stringify(backup, null, 2));
        
        // Also save as latest.json
        fs.writeFileSync(path.join(backupDir, 'supabase-latest.json'), JSON.stringify(backup, null, 2));

        console.log('✅ Supabase backup completed successfully!');
        console.log(`📁 File: ${filepath}`);
        console.log(`📊 Stats:`);
        console.log(`   - Users: ${backup.stats.totalUsers}`);
        console.log(`   - Inviters: ${backup.stats.totalInviters}`);
        console.log(`   - Role Grants: ${backup.stats.totalRoleGrants}`);
        console.log(`   - Sessions: ${backup.stats.totalSessions}`);
        console.log('\n💡 Tip: Keep this backup file safe! You can restore from it anytime.');

    } catch (error) {
        console.error('❌ Backup failed:', error.message);
        console.error(error);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

backupSupabase();
