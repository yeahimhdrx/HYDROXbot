const { EmbedBuilder } = require('discord.js');

class Logger {
    static client = null;
    static logChannelId = process.env.LOG_CHANNEL_ID;

    static setClient(client) {
        this.client = client;
    }

    static async log(type, message, data = {}) {
        console.log(`[${type}] ${message}`);
        
        if (!this.client || !this.logChannelId) return;

        try {
            const channel = await this.client.channels.fetch(this.logChannelId);
            if (!channel || !channel.isTextBased()) return;

            const embed = new EmbedBuilder()
                .setTimestamp();

            switch (type) {
                case 'ROLE_GRANTED':
                    embed.setColor('#00ff00')
                        .setTitle('🎉 Role Granted')
                        .setDescription(`**${data.user}** earned the **${data.role}** role!`)
                        .addFields(
                            { name: '⏱️ Voice Time', value: `${data.hours} hours`, inline: true },
                            { name: '🏷️ Tag Status', value: data.hasTag ? '✅ Using HDRX' : '❌ No tag', inline: true }
                        );
                    break;

                case 'VOICE_JOIN':
                    embed.setColor('#3498db')
                        .setTitle('🎤 Voice Channel Joined')
                        .setDescription(`**${data.user}** joined voice chat`);
                    break;

                case 'VOICE_LEAVE':
                    embed.setColor('#95a5a6')
                        .setTitle('🔇 Voice Channel Left')
                        .setDescription(`**${data.user}** left voice chat`)
                        .addFields(
                            { name: '⏱️ Session Time', value: `${data.sessionMinutes} minutes`, inline: true },
                            { name: '📊 Total Time', value: `${data.totalHours} hours`, inline: true }
                        );
                    break;

                case 'TAG_UPDATE':
                    embed.setColor('#f39c12')
                        .setTitle('🏷️ Tag Status Updated')
                        .setDescription(`**${data.user}** ${data.hasTag ? 'is now using' : 'removed'} the HDRX tag`)
                        .addFields({ name: 'Updated by', value: data.admin, inline: true });
                    break;

                case 'ADMIN_ACTION':
                    embed.setColor('#e74c3c')
                        .setTitle('⚙️ Admin Action')
                        .setDescription(message)
                        .addFields(
                            { name: 'Admin', value: data.admin, inline: true },
                            { name: 'Target', value: data.target, inline: true }
                        );
                    break;

                case 'BOT_READY':
                    embed.setColor('#2ecc71')
                        .setTitle('✅ HYDROX Bot Online')
                        .setDescription('Voice tracking system is now active!');
                    break;

                default:
                    embed.setColor('#95a5a6')
                        .setTitle('📝 Log')
                        .setDescription(message);
            }

            await channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error sending log to channel:', error);
        }
    }
}

module.exports = Logger;
