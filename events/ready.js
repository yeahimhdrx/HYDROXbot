const Logger = require('../utils/logger');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`✅ Bot is online as ${client.user.tag}`);
        client.user.setActivity('HYDROX Voice Tracking', { type: 'WATCHING' });
        
        Logger.setClient(client);
        await Logger.log('BOT_READY', 'HYDROX Bot is now online and tracking voice activity');
    },
};
