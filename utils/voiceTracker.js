const db = require('./database-adapter');

class VoiceTracker {
    // Get user's total voice time in hours (with decimal precision)
    static getVoiceHours(userId) {
        const stmt = db.prepare('SELECT total_seconds FROM voice_activity WHERE user_id = ?');
        const result = stmt.get(userId);
        return result ? result.total_seconds / 3600 : 0;
    }

    // Get user's total voice time in seconds
    static getVoiceSeconds(userId) {
        const stmt = db.prepare('SELECT total_seconds FROM voice_activity WHERE user_id = ?');
        const result = stmt.get(userId);
        return result ? result.total_seconds : 0;
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
            INSERT INTO voice_activity (user_id, has_tag, last_updated_ms) 
            VALUES (?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET has_tag = ?, last_updated_ms = ?
        `);
        const now = Date.now();
        stmt.run(userId, hasTag ? 1 : 0, now, hasTag ? 1 : 0, now);
    }

    // Get stored tag status from database
    static getStoredTagStatus(userId) {
        const stmt = db.prepare('SELECT has_tag FROM voice_activity WHERE user_id = ?');
        const result = stmt.get(userId);
        return result ? result.has_tag === 1 : false;
    }

    // User joined voice channel
    static joinVoice(userId, channelId = null, channelName = null) {
        const now = Date.now();
        console.log(`[VoiceTracker] User ${userId} joining voice at ${now} (${new Date(now).toISOString()})`);
        
        // Update or create voice_activity record
        const stmt = db.prepare(`
            INSERT INTO voice_activity (user_id, joined_at_ms, last_updated_ms) 
            VALUES (?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET joined_at_ms = ?, last_updated_ms = ?
        `);
        stmt.run(userId, now, now, now, now);

        // Create session record
        if (channelId && channelName) {
            const sessionStmt = db.prepare(`
                INSERT INTO voice_sessions (user_id, channel_id, channel_name, joined_at_ms)
                VALUES (?, ?, ?, ?)
            `);
            sessionStmt.run(userId, channelId, channelName, now);
        }
    }

    // User left voice channel
    static leaveVoice(userId) {
        const stmt = db.prepare('SELECT joined_at_ms, session_count FROM voice_activity WHERE user_id = ?');
        const result = stmt.get(userId);
        
        if (!result || !result.joined_at_ms) {
            console.log(`[VoiceTracker] No join time found for user ${userId}`);
            return 0;
        }

        const now = Date.now();
        const durationMs = now - result.joined_at_ms;
        const durationSeconds = Math.floor(durationMs / 1000);
        const durationMinutes = Math.floor(durationSeconds / 60);
        
        console.log(`[VoiceTracker] User ${userId} leaving voice`);
        console.log(`[VoiceTracker]   Joined at: ${result.joined_at_ms} (${new Date(result.joined_at_ms).toISOString()})`);
        console.log(`[VoiceTracker]   Left at: ${now} (${new Date(now).toISOString()})`);
        console.log(`[VoiceTracker]   Duration: ${durationSeconds}s (${durationMinutes}m ${durationSeconds % 60}s)`);
        
        // Update voice_activity with precise duration
        const updateStmt = db.prepare(`
            UPDATE voice_activity 
            SET total_seconds = total_seconds + ?, 
                joined_at_ms = NULL,
                last_updated_ms = ?,
                session_count = session_count + 1,
                last_session_seconds = ?
            WHERE user_id = ?
        `);
        updateStmt.run(durationSeconds, now, durationSeconds, userId);

        // Update session record
        const sessionStmt = db.prepare(`
            UPDATE voice_sessions 
            SET left_at_ms = ?, duration_seconds = ?
            WHERE user_id = ? AND left_at_ms IS NULL
            ORDER BY joined_at_ms DESC
            LIMIT 1
        `);
        sessionStmt.run(now, durationSeconds, userId);
        
        return durationMinutes;
    }

    // Update active users (called periodically for precision)
    static updateActiveUsers() {
        const now = Date.now();
        const stmt = db.prepare('SELECT user_id, joined_at_ms FROM voice_activity WHERE joined_at_ms IS NOT NULL');
        const activeUsers = stmt.all();

        if (activeUsers.length === 0) return;

        console.log(`[VoiceTracker] Updating ${activeUsers.length} active user(s) at ${new Date(now).toISOString()}`);

        const updateStmt = db.prepare(`
            UPDATE voice_activity 
            SET total_seconds = total_seconds + ?,
                joined_at_ms = ?,
                last_updated_ms = ?
            WHERE user_id = ?
        `);

        for (const user of activeUsers) {
            const durationMs = now - user.joined_at_ms;
            const secondsToAdd = Math.floor(durationMs / 1000);
            
            if (secondsToAdd > 0) {
                // Calculate new joined_at by adding the seconds we just counted
                const newJoinedAtMs = user.joined_at_ms + (secondsToAdd * 1000);
                
                console.log(`[VoiceTracker]   User ${user.user_id}: +${secondsToAdd}s (${Math.floor(secondsToAdd / 60)}m ${secondsToAdd % 60}s)`);
                
                updateStmt.run(secondsToAdd, newJoinedAtMs, now, user.user_id);
            }
        }
    }

    // Get current session duration for an active user (in seconds)
    static getCurrentSessionDuration(userId) {
        const stmt = db.prepare('SELECT joined_at_ms FROM voice_activity WHERE user_id = ? AND joined_at_ms IS NOT NULL');
        const result = stmt.get(userId);
        
        if (!result) return 0;
        
        const now = Date.now();
        const durationMs = now - result.joined_at_ms;
        return Math.floor(durationMs / 1000);
    }

    // Check if user is currently in voice
    static isInVoice(userId) {
        const stmt = db.prepare('SELECT joined_at_ms FROM voice_activity WHERE user_id = ? AND joined_at_ms IS NOT NULL');
        const result = stmt.get(userId);
        return result !== undefined;
    }

    // Get user statistics
    static getUserStats(userId) {
        const stmt = db.prepare(`
            SELECT 
                total_seconds,
                session_count,
                last_session_seconds,
                has_tag,
                joined_at_ms
            FROM voice_activity 
            WHERE user_id = ?
        `);
        const result = stmt.get(userId);
        
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

    // Get user's recent sessions
    static getRecentSessions(userId, limit = 10) {
        const stmt = db.prepare(`
            SELECT 
                channel_name,
                joined_at_ms,
                left_at_ms,
                duration_seconds,
                created_at
            FROM voice_sessions 
            WHERE user_id = ? AND left_at_ms IS NOT NULL
            ORDER BY joined_at_ms DESC
            LIMIT ?
        `);
        return stmt.all(userId, limit);
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
        const stmt = db.prepare(`
            SELECT 
                user_id, 
                total_seconds,
                session_count,
                has_tag,
                joined_at_ms
            FROM voice_activity
            ORDER BY total_seconds DESC
        `);
        return stmt.all();
    }

    // Get leaderboard
    static getLeaderboard(limit = 10) {
        const stmt = db.prepare(`
            SELECT 
                user_id,
                total_seconds,
                session_count,
                has_tag
            FROM voice_activity
            WHERE total_seconds > 0
            ORDER BY total_seconds DESC
            LIMIT ?
        `);
        return stmt.all(limit);
    }

    // Clean up orphaned sessions (sessions without end time older than 24 hours)
    static cleanupOrphanedSessions() {
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        const stmt = db.prepare(`
            DELETE FROM voice_sessions 
            WHERE left_at_ms IS NULL AND joined_at_ms < ?
        `);
        const result = stmt.run(oneDayAgo);
        if (result.changes > 0) {
            console.log(`[VoiceTracker] Cleaned up ${result.changes} orphaned session(s)`);
        }
    }
}

module.exports = VoiceTracker;