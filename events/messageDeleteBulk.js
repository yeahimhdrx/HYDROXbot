const Logger = require('../utils/logger');

module.exports = {
    name: 'messageDeleteBulk',
    async execute(messages, channel) {
        // Skip if not in a guild
        if (!channel.guild) return;

        const messageArray = Array.from(messages.values());
        const count = messageArray.length;
        
        console.log(`[MessageDeleteBulk] ${count} messages deleted in #${channel.name}`);
        
        // Try to get who deleted the messages from audit logs
        let executor = null;
        let executorId = null;
        let executorAvatar = null;
        try {
            const auditLogs = await channel.guild.fetchAuditLogs({
                limit: 1,
                type: 72 // MESSAGE_BULK_DELETE
            });
            const deleteLog = auditLogs.entries.first();
            if (deleteLog && (Date.now() - deleteLog.createdTimestamp) < 5000) {
                executor = deleteLog.executor.tag;
                executorId = deleteLog.executor.id;
                executorAvatar = deleteLog.executor.displayAvatarURL({ dynamic: true });
            }
        } catch (error) {
            console.error('[MessageDeleteBulk] Failed to fetch audit logs:', error.message);
        }
        
        // Get timestamp range
        let oldestMessage = null;
        let newestMessage = null;
        if (messageArray.length > 0) {
            const timestamps = messageArray
                .filter(m => m.createdTimestamp)
                .map(m => m.createdTimestamp)
                .sort((a, b) => a - b);
            
            if (timestamps.length > 0) {
                oldestMessage = timestamps[0];
                newestMessage = timestamps[timestamps.length - 1];
            }
        }
        
        await Logger.log('MESSAGE_BULK_DELETE', null, {
            channelId: channel.id,
            channelName: channel.name,
            count: count,
            executor: executor,
            executorId: executorId,
            executorAvatar: executorAvatar,
            oldestMessage: oldestMessage,
            newestMessage: newestMessage
        });
        
        // Optionally log individual messages (if you want detailed logs)
        // This can be a lot of logs, so it's commented out by default
        /*
        for (const message of messageArray) {
            if (message.author) {
                await Logger.log('MESSAGE_DELETE', null, {
                    user: message.author.tag,
                    userId: message.author.id,
                    userAvatar: message.author.displayAvatarURL({ dynamic: true }),
                    isBot: message.author.bot,
                    messageId: message.id,
                    channelId: channel.id,
                    channelName: channel.name,
                    content: message.content || '',
                    attachments: message.attachments ? Array.from(message.attachments.values()) : [],
                    embeds: message.embeds ? message.embeds.length : 0,
                    createdAt: message.createdTimestamp
                });
            }
        }
        */
    },
};
