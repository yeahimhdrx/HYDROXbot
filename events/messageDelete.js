const Logger = require('../utils/logger');
const MessageCache = require('../utils/messageCache');

module.exports = {
    name: 'messageDelete',
    async execute(message) {
        // Skip if message is not from a guild (DMs)
        if (!message.guild) return;

        // Try to get message details from cache first
        let user, userId, userAvatar, isBot, content, attachments, embedCount, createdAt;
        
        // Check if message is partial (not cached by Discord.js)
        if (message.partial) {
            console.log(`[MessageDelete] Partial message ${message.id}, checking database cache...`);
            const cached = MessageCache.getCachedMessage(message.id);
            
            if (cached) {
                user = cached.user_tag;
                userId = cached.user_id;
                userAvatar = `https://cdn.discordapp.com/embed/avatars/0.png`; // Default avatar
                isBot = false;
                content = cached.content || '';
                attachments = cached.attachments || [];
                embedCount = cached.embed_count || 0;
                createdAt = cached.created_at * 1000;
                console.log(`[MessageDelete] ✅ Found in cache: ${user} - Content: "${content.substring(0, 50)}..."`);
            } else {
                // No cache available
                user = 'Unknown User';
                userId = 'Unknown';
                userAvatar = null;
                isBot = false;
                content = '';
                attachments = [];
                embedCount = 0;
                createdAt = null;
                console.log(`[MessageDelete] ❌ Message ${message.id} not found in cache`);
            }
        } else {
            // Message is fully cached by Discord.js
            user = message.author ? message.author.tag : 'Unknown User';
            userId = message.author ? message.author.id : 'Unknown';
            userAvatar = message.author ? message.author.displayAvatarURL({ dynamic: true }) : null;
            isBot = message.author ? message.author.bot : false;
            content = message.content || '';
            attachments = message.attachments ? Array.from(message.attachments.values()).map(att => ({
                name: att.name,
                url: att.url,
                proxyURL: att.proxyURL,
                size: att.size,
                contentType: att.contentType
            })) : [];
            embedCount = message.embeds ? message.embeds.length : 0;
            createdAt = message.createdTimestamp;
            console.log(`[MessageDelete] ✅ Message in Discord cache: ${user} - Content: "${content.substring(0, 50)}..."`);
        }
        
        // Try to get who deleted the message from audit logs
        let deletedBy = null;
        let deletedById = null;
        let deletedByAvatar = null;
        try {
            const auditLogs = await message.guild.fetchAuditLogs({
                limit: 5,
                type: 72 // MESSAGE_DELETE
            });
            
            // Look for a recent deletion log entry
            for (const entry of auditLogs.entries.values()) {
                // Check if this entry is for our message and is recent (within 3 seconds)
                if (entry.target.id === userId && (Date.now() - entry.createdTimestamp) < 3000) {
                    // Check if the executor is different from the message author (someone else deleted it)
                    if (entry.executor.id !== userId) {
                        deletedBy = entry.executor.tag;
                        deletedById = entry.executor.id;
                        deletedByAvatar = entry.executor.displayAvatarURL({ dynamic: true });
                        console.log(`[MessageDelete] Message deleted by ${deletedBy} (moderator action)`);
                        break;
                    }
                }
            }
        } catch (error) {
            console.error('[MessageDelete] Failed to fetch audit logs:', error.message);
        }
        
        console.log(`[MessageDelete] Message ${message.id} deleted in #${message.channel.name} by ${user}${deletedBy ? ` (deleted by ${deletedBy})` : ' (self-deleted)'}`);
        
        await Logger.log('MESSAGE_DELETE', null, {
            user,
            userId,
            userAvatar,
            isBot,
            messageId: message.id,
            channelId: message.channel.id,
            channelName: message.channel.name,
            content: content,
            attachments: attachments,
            embeds: embedCount,
            createdAt: createdAt,
            deletedBy: deletedBy,
            deletedById: deletedById,
            deletedByAvatar: deletedByAvatar
        });
    },
};
