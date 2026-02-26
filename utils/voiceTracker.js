const db = require('./database-async');

class VoiceTracker {
    // Get user's total voice time in hours (with decimal precision)
    static async getVoiceHours(userId) {
        const result = await db.get('SELECT total_seconds FROM voice_activity WHERE user_id = ?', [userId]);
        return result ? result.total_seconds / 3600 : 0;
    }

    // Get user's total voice time in seconds
    static async getVoiceSeconds(userId) {
        const result = await db.get('SELECT total_seconds FROM voice_activity WHERE user_id = ?', [userId]);
        return result ? result.total_seconds : 0;
    }

    // Check if user has tag (from database)
    static async hasTag(userId) {
        const result = await db.get('SELECT has_tag FROM voice_activity WHERE user_id = ?', [userId]);
        return result ? result.has_tag === 1 : false;
    }

    // Set user tag status
    static async setTagStatus(userId, hasTag) {
        const now = Date.now();
        await db.run(`
            INSERT INTO voice_activity (user_id, has_tag, last_updated_ms) 
            VALUES (?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET has_tag = ?, last_updated_ms = ?
        `, [userId, hasTag ? 1 : 0, now, hasTag ? 1 : 0, now]);
    }

    // Get stored tag status from database
    static async getStoredTagStatus(userId) {
        const result = await db.get('SELECT has_tag FROM voice_activity WHERE user_id = ?', [userId]);
        return result ? result.has_tag === 1 : false;
    }

    // User joined voice channel
    static async joinVoice(userId, channelId = null, channelName = null) {
        const now = Date.now();
        console.log(`[VoiceTracker] User ${userId} joining voice at ${now} (${new Date(now).toISOString()})`);
        
        // Update or create voice_activity record
        await db.run(`
            INSERT INTO voice_activity (user_id, joined_at_ms, last_updated_ms) 
            VALUES (?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET joined_at_ms = ?, last_updated_ms = ?
        `, [userId, now, now, now, now]);

        // Create session record
        if (channelId && channelName) {
            await db.run(`
                INSERT INTO voice_sessions (user_id, channel_id, channel_name, joined_at_ms)
                VALUES (?, ?, ?, ?)
            `, [userId, channelId, channelName, now]);
        }
    }

    // User left voice channel
    static async leaveVoice(userId) {
        const result = await db.get('SELECT joined_at_ms, session_count FROM voice_activity WHERE user_id = ?', [userId]);
        
        if (!result || !result.joined_at_ms) {
            console.log(`[VoiceTracker] No join time found for user ${userId}`);
            return 0;
        }

        const now = Date.now();
        const durationMs = now - result.joined_at_ms;
        const durationSeconds = Math.floor(durationMs / 1000);
        const durationMinutes = Math.floor(durationSeconds / 60);
        
        console.log(`[VoiceTracker] User ${userId} leaving voice`);
        console.log(`[VoiceTracker]   Duration: ${durationSeconds}s (${durationMinutes}m ${durationSeconds % 60}s)`);
        
        // Update voice_activity with precise duration
        await db.run(`
            UPDATE voice_activity 
            SET total_seconds = total_seconds + ?, 
                joined_at_ms = NULL,
                last_updated_ms = ?,
                session_count = session_count + 1,
                last_session_seconds = ?
            WHERE user_id = ?
        `, [durationSeconds, now, durationSeconds, userId]);

        // Update session record
        await db.run(`
            UPDATE voice_sessions 
            SET left_at_ms = ?, duration_seconds = ?
            WHERE user_id = ? AND left_at_ms IS NULL
        `, [now, durationSeconds, userId]);
        
        return durationMinutes;
    }

    // Get user statistics
    static async getUserStats(userId) {
        const result = await db.get(`
            SELECT 
                total_seconds,
                session_count,
                last_session_seconds,
                has_tag,
                joined_at_ms
            FROM voice_activity 
            WHERE user_id = ?
        `, [userId]);
        
        if (!result) {
            return {
                totalSeconds: 0,
                totalHours: 0,
                sessionCount: 0,
                lastSessionSeconds: 0,
                hasTag: false,
                isInVoice: false,
                currentSessionSeconds: 0
            };
        }

        const currentSessionSeconds = result.joined_at_ms 
            ? Math.floor((Date.now() - result.joined_at_ms) / 1000)
            : 0;

        return {
            totalSeconds: result.total_seconds || 0,
            totalHours: (result.total_seconds || 0) / 3600,
            sessionCount: result.session_count || 0,
            lastSessionSeconds: result.last_session_seconds || 0,
            hasTag: result.has_tag === 1,
            isInVoice: result.joined_at_ms !== null,
            currentSessionSeconds: currentSessionSeconds
        };
    }

    // Check if role was already granted
    static async wasRoleGranted(userId, roleName) {
        const result = await db.get('SELECT 1 FROM role_grants WHERE user_id = ? AND role_name = ?', [userId, roleName]);
        return result !== undefined;
    }

    // Mark role as granted
    static async markRoleGranted(userId, roleName) {
        await db.run('INSERT OR IGNORE INTO role_grants (user_id, role_name) VALUES (?, ?)', [userId, roleName]);
    }

    // Get all users with their stats
    static async getAllUsers() {
        return await db.all(`
            SELECT 
                user_id, 
                total_seconds,
                session_count,
                has_tag,
                joined_at_ms
            FROM voice_activity
            ORDER BY total_seconds DESC
        `);
    }

    // Get leaderboard
    static async getLeaderboard(limit = 10) {
        return await db.all(`
            SELECT 
                user_id,
                total_seconds,
                session_count,
                has_tag
            FROM voice_activity
            WHERE total_seconds > 0
            ORDER BY total_seconds DESC
            LIMIT ?
        `, [limit]);
    }

    /**
     * Clean up orphaned sessions (sessions without end time older than 24 hours)
     */
    static async cleanupOrphanedSessions() {
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        const result = await db.run(`
            DELETE FROM voice_sessions 
            WHERE left_at_ms IS NULL AND joined_at_ms < ?
        `, [oneDayAgo]);
        
        if (result.changes > 0) {
            console.log(`[VoiceTracker] Cleaned up ${result.changes} orphaned session(s)`);
        }
    }
}

module.exports = VoiceTracker;
