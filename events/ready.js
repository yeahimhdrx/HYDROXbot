const Logger = require('../utils/logger');
const { ActivityType } = require('discord.js');
const VoiceTracker = require('../utils/voiceTracker');

module.exports = {
    name: 'clientReady',
    once: true,
    async execute(client) {
        console.log(`✅ Bot is online as ${client.user.tag}`);
        client.user.setActivity('HYDROX Voice Tracking', { type: ActivityType.Watching });
        
        Logger.setClient(client);
        
        // Calculate total users across all guilds
        let totalUsers = 0;
        client.guilds.cache.forEach(guild => {
            totalUsers += guild.memberCount;
        });
        
        // Initialize tracking for users already in voice channels
        for (const [, guild] of client.guilds.cache) {
            for (const [, member] of guild.members.cache) {
                if (member.voice.channelId && !member.user.bot) {
                    VoiceTracker.joinVoice(member.user.id);
                    console.log(`📊 Started tracking ${member.user.tag} (already in voice)`);
                }
            }
        }
        
        await Logger.log('BOT_READY', null, {
            botTag: client.user.tag,
            guildCount: client.guilds.cache.size,
            userCount: totalUsers
        });
    },
};
