const db = require('./database-async');

class MessageCache {
    // Cache a message
    static async cacheMessage(message) {
        if (!message.author) {
            console.log('[MessageCache] Skipping message without author');
            return;
        }
        if (message.author.bot) {
            // Don't cache bot messages to save space
            return;
        }
        if (!message.guild) {
            // Only cache guild messages
            return;
        }

        try {
            const attachmentData = message.attachments.size > 0 
                ? JSON.stringify(Array.from(message.attachments.values()).map(att => ({
                    name: att.name,
                    url: att.url,
                    proxyURL: att.proxyURL,
                    size: att.size,
                    contentType: att.contentType
                })))
                : null;

            await db.run(`
                INSERT OR REPLACE INTO message_cache 
                (message_id, user_id, user_tag, channel_id, content, has_attachments, attachment_data, embed_count, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                message.id,
                message.author.id,
                message.author.tag,
                message.channel.id,
                message.content || '',
                message.attachments.size > 0 ? 1 : 0,
                attachmentData,
                message.embeds.length,
                Math.floor(message.createdTimestamp / 1000)
            ]);
            
            // Log successful cache (only for messages with content or attachments)
            if (message.content || message.attachments.size > 0) {
                console.log(`[MessageCache] Cached message from ${message.author.tag}`);
            }
        } catch (error) {
            console.error('[MessageCache] Error caching message:', error.message);
        }
    }

    // Get cached message data
    static async getCachedMessage(messageId) {
        try {
            const result = await db.get(`
                SELECT * FROM message_cache WHERE message_id = ?
            `, [messageId]);
            
            if (result && result.attachment_data) {
                result.attachments = JSON.parse(result.attachment_data);
            }
            
            return result;
        } catch (error) {
            console.error('[MessageCache] Error retrieving cached message:', error.message);
            return null;
        }
    }

    // Clean old messages (older than 7 days)
    static async cleanOldMessages() {
        try {
            const sevenDaysAgo = Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60);
            const result = await db.run('DELETE FROM message_cache WHERE created_at < ?', [sevenDaysAgo]);
            
            if (result.changes > 0) {
                console.log(`[MessageCache] Cleaned up ${result.changes} old message(s)`);
            }
        } catch (error) {
            console.error('[MessageCache] Error cleaning old messages:', error.message);
        }
    }

    // Get cache statistics
    static async getStats() {
        try {
            const countResult = await db.get('SELECT COUNT(*) as count FROM message_cache');
            const sizeResult = await db.get('SELECT COUNT(*) as count FROM message_cache WHERE length(content) > 0');
            const attachResult = await db.get('SELECT COUNT(*) as count FROM message_cache WHERE has_attachments = 1');
            
            return {
                totalMessages: countResult.count,
                messagesWithContent: sizeResult.count,
                messagesWithAttachments: attachResult.count
            };
        } catch (error) {
            console.error('[MessageCache] Error getting stats:', error.message);
            return { totalMessages: 0, messagesWithContent: 0, messagesWithAttachments: 0 };
        }
    }
}

module.exports = MessageCache;
