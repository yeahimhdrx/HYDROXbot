const db = require('./database');

class VoiceTracker {
    // Get user's total voice time in hours
    static getVoiceHours(userId) {
        const stmt = db.prepare('SELECT total_minutes FROM voice_activity WHERE user_id = ?');
        const result = stmt.get(userId);
        return result ? result.total_minutes / 60 : 0;
    }

    // Check if user has tag (from database)
    static hasTag(userId) {
        const stmt = db.prepare('SELECT has_tag FROM voice_activity WHERE user_id = ?');
        const result = stmt.get(userId);
        return result ? result.has_tag === 1 : false;
    }

    // Set user tag status
    static setTagStatus(userId, hasTag) {
        const stmt = db.prepare(`
            INSERT INTO voice_activity (user_id, has_tag) 
            VALUES (?, ?)
            ON CONFLICT(user_id) DO UPDATE SET has_tag = ?
        `);
        stmt.run(userId, hasTag ? 1 : 0, hasTag ? 1 : 0);
    }

    // Get stored tag status from database
    static getStoredTagStatus(userId) {
        const stmt = db.prepare('SELECT has_tag FROM voice_activity WHERE user_id = ?');
        const result = stmt.get(userId);
        return result ? result.has_tag === 1 : false;
    }

    // Set user tag status
    static setTagStatus(userId, hasTag) {
        const stmt = db.prepare(`
            INSERT INTO voice_activity (user_id, has_tag) 
            VALUES (?, ?)
            ON CONFLICT(user_id) DO UPDATE SET has_tag = ?
        `);
        stmt.run(userId, hasTag ? 1 : 0, hasTag ? 1 : 0);
    }

    // User joined voice channel
    static joinVoice(userId) {
        const now = Math.floor(Date.now() / 1000);
        const stmt = db.prepare(`
            INSERT INTO voice_activity (user_id, joined_at) 
            VALUES (?, ?)
            ON CONFLICT(user_id) DO UPDATE SET joined_at = ?
        `);
        stmt.run(userId, now, now);
    }

    // User left voice channel
    static leaveVoice(userId) {
        const stmt = db.prepare('SELECT joined_at FROM voice_activity WHERE user_id = ?');
        const result = stmt.get(userId);
        
        if (result && result.joined_at) {
            const now = Math.floor(Date.now() / 1000);
            const minutesSpent = Math.floor((now - result.joined_at) / 60);
            
            const updateStmt = db.prepare(`
                UPDATE voice_activity 
                SET total_minutes = total_minutes + ?, joined_at = NULL 
                WHERE user_id = ?
            `);
            updateStmt.run(minutesSpent, userId);
            
            return minutesSpent;
        }
        return 0;
    }

    // Update active users (called periodically)
    static updateActiveUsers() {
        const now = Math.floor(Date.now() / 1000);
        const stmt = db.prepare('SELECT user_id, joined_at FROM voice_activity WHERE joined_at IS NOT NULL');
        const activeUsers = stmt.all();

        for (const user of activeUsers) {
            const minutesSpent = Math.floor((now - user.joined_at) / 60);
            if (minutesSpent > 0) {
                const updateStmt = db.prepare(`
                    UPDATE voice_activity 
                    SET total_minutes = total_minutes + ?, joined_at = ? 
                    WHERE user_id = ?
                `);
                updateStmt.run(minutesSpent, now, user.user_id);
            }
        }
    }

    // Check if role was already granted
    static wasRoleGranted(userId, roleName) {
        const stmt = db.prepare('SELECT 1 FROM role_grants WHERE user_id = ? AND role_name = ?');
        return stmt.get(userId, roleName) !== undefined;
    }

    // Mark role as granted
    static markRoleGranted(userId, roleName) {
        const stmt = db.prepare('INSERT OR IGNORE INTO role_grants (user_id, role_name) VALUES (?, ?)');
        stmt.run(userId, roleName);
    }

    // Get all users with their stats
    static getAllUsers() {
        const stmt = db.prepare('SELECT user_id, total_minutes, has_tag FROM voice_activity');
        return stmt.all();
    }
}

module.exports = VoiceTracker;
