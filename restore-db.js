const db = require('./utils/database');
const fs = require('fs');
const path = require('path');

console.log('📥 Starting database restore...');

// Get backup file path from command line or use latest
const backupFile = process.argv[2] || path.join(__dirname, 'backups', 'latest.json');

if (!fs.existsSync(backupFile)) {
    console.error('❌ Backup file not found:', backupFile);
    console.log('Usage: node restore-db.js [backup-file.json]');
    console.log('Or place backup as: backups/latest.json');
    process.exit(1);
}

try {
    const backup = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
    
    console.log(`📦 Backup from: ${backup.timestamp}`);
    console.log(`📊 Contains:`);
    console.log(`   - Users: ${backup.stats.totalUsers}`);
    console.log(`   - Role Grants: ${backup.stats.totalRoleGrants}`);
    console.log(`   - Sessions: ${backup.stats.totalSessions}`);
    console.log('');
    console.log('⚠️  This will overwrite existing data!');
    console.log('Restoring in 3 seconds... (Ctrl+C to cancel)');
    
    // Wait 3 seconds
    setTimeout(() => {
        console.log('🔄 Restoring...');
        
        // Restore voice activity
        const voiceStmt = db.prepare(`
            INSERT OR REPLACE INTO voice_activity 
            (user_id, total_seconds, joined_at_ms, has_tag, last_updated_ms, session_count, last_session_seconds)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        let restored = 0;
        for (const row of backup.tables.voiceActivity) {
            voiceStmt.run(
                row.user_id,
                row.total_seconds || 0,
                row.joined_at_ms || null,
                row.has_tag || 0,
                row.last_updated_ms || null,
                row.session_count || 0,
                row.last_session_seconds || 0
            );
            restored++;
        }
        console.log(`✅ Restored ${restored} voice activity records`);

        // Restore role grants
        const roleStmt = db.prepare(`
            INSERT OR IGNORE INTO role_grants (user_id, role_name, granted_at)
            VALUES (?, ?, ?)
        `);

        restored = 0;
        for (const row of backup.tables.roleGrants) {
            roleStmt.run(row.user_id, row.role_name, row.granted_at);
            restored++;
        }
        console.log(`✅ Restored ${restored} role grants`);

        // Restore tag reminders
        const tagStmt = db.prepare(`
            INSERT OR IGNORE INTO tag_reminders (user_id, role_name, reminded_at)
            VALUES (?, ?, ?)
        `);

        restored = 0;
        for (const row of backup.tables.tagReminders) {
            tagStmt.run(row.user_id, row.role_name, row.reminded_at);
            restored++;
        }
        console.log(`✅ Restored ${restored} tag reminders`);

        // Restore voice sessions (optional, can be large)
        if (backup.tables.voiceSessions && backup.tables.voiceSessions.length > 0) {
            const sessionStmt = db.prepare(`
                INSERT OR IGNORE INTO voice_sessions 
                (user_id, channel_id, channel_name, joined_at_ms, left_at_ms, duration_seconds, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `);

            restored = 0;
            for (const row of backup.tables.voiceSessions) {
                sessionStmt.run(
                    row.user_id,
                    row.channel_id,
                    row.channel_name,
                    row.joined_at_ms,
                    row.left_at_ms,
                    row.duration_seconds,
                    row.created_at
                );
                restored++;
            }
            console.log(`✅ Restored ${restored} voice sessions`);
        }

        console.log('');
        console.log('🎉 Database restore completed successfully!');
    }, 3000);

} catch (error) {
    console.error('❌ Restore failed:', error.message);
    process.exit(1);
}
