const db = require('./utils/database');
const fs = require('fs');
const path = require('path');

console.log('📦 Starting database backup...');

try {
    // Export all data
    const voiceActivity = db.prepare('SELECT * FROM voice_activity').all();
    const roleGrants = db.prepare('SELECT * FROM role_grants').all();
    const tagReminders = db.prepare('SELECT * FROM tag_reminders').all();
    const voiceSessions = db.prepare('SELECT * FROM voice_sessions ORDER BY created_at DESC LIMIT 1000').all();

    const backup = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        tables: {
            voiceActivity,
            roleGrants,
            tagReminders,
            voiceSessions
        },
        stats: {
            totalUsers: voiceActivity.length,
            totalRoleGrants: roleGrants.length,
            totalSessions: voiceSessions.length
        }
    };

    // Create backups directory if it doesn't exist
    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    // Save with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.json`;
    const filepath = path.join(backupDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(backup, null, 2));
    
    // Also save as latest.json for easy access
    fs.writeFileSync(path.join(backupDir, 'latest.json'), JSON.stringify(backup, null, 2));

    console.log('✅ Database backed up successfully!');
    console.log(`📁 File: ${filepath}`);
    console.log(`📊 Stats:`);
    console.log(`   - Users: ${backup.stats.totalUsers}`);
    console.log(`   - Role Grants: ${backup.stats.totalRoleGrants}`);
    console.log(`   - Sessions: ${backup.stats.totalSessions}`);
} catch (error) {
    console.error('❌ Backup failed:', error.message);
    process.exit(1);
}
