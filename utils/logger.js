const { EmbedBuilder } = require('discord.js');
const { formatTime, formatMinutes } = require('./timeFormatter');

class Logger {
    static client = null;
    static logChannelId = process.env.LOG_CHANNEL_ID;

    static setClient(client) {
        this.client = client;
    }

    static createProgressBar(percentage) {
        const filled = Math.round(percentage / 10);
        const empty = 10 - filled;
        const filledBar = '█'.repeat(filled);
        const emptyBar = '░'.repeat(empty);
        return `${filledBar}${emptyBar}`;
    }

    static async log(type, message, data = {}) {
        console.log(`[${type}] ${message || ''}`);
        
        if (!this.client || !this.logChannelId) return;

        try {
            const channel = await this.client.channels.fetch(this.logChannelId);
            if (!channel || !channel.isTextBased()) return;

            const embed = new EmbedBuilder()
                .setTimestamp()
                .setFooter({ text: 'HYDROX Logging System' });

            switch (type) {
                // ===== ROLE EVENTS =====
                case 'ROLE_GRANTED':
                    embed.setColor('#00ff00')
                        .setAuthor({ name: '🎉 Role Granted', iconURL: data.userAvatar })
                        .setDescription(`<@${data.userId}> earned the **${data.role}** role!`)
                        .addFields(
                            { name: '⏱️ Voice Time', value: formatTime(data.hours), inline: true },
                            { name: '🏷️ Tag Status', value: data.hasTag ? '✅ Using HDRX' : '❌ No tag', inline: true }
                        )
                        .setThumbnail(data.userAvatar);
                    break;

                case 'ROLE_ADD':
                    embed.setColor('#57f287')
                        .setAuthor({ name: '➕ Role Added', iconURL: data.userAvatar })
                        .setDescription(`<@${data.userId}> received a role`)
                        .addFields(
                            { name: '🎭 Role', value: data.roleName, inline: true },
                            { name: '👤 Added By', value: data.executor || 'System', inline: true },
                            { name: '👥 User ID', value: `\`${data.userId}\``, inline: true }
                        );
                    break;

                case 'ROLE_REMOVE':
                    embed.setColor('#ed4245')
                        .setAuthor({ name: '➖ Role Removed', iconURL: data.userAvatar })
                        .setDescription(`<@${data.userId}> lost a role`)
                        .addFields(
                            { name: '🎭 Role', value: data.roleName, inline: true },
                            { name: '👤 Removed By', value: data.executor || 'System', inline: true },
                            { name: '👥 User ID', value: `\`${data.userId}\``, inline: true }
                        );
                    break;

                // ===== VOICE EVENTS =====
                case 'VOICE_JOIN':
                    embed.setColor('#57f287')
                        .setAuthor({ name: '🎤 Voice Channel Joined', iconURL: data.userAvatar })
                        .setDescription(`<@${data.userId}> joined a voice channel`)
                        .addFields(
                            { name: '📢 Channel', value: `\`${data.channel}\``, inline: true },
                            { name: '📊 Total Voice Time', value: formatTime(data.totalHours || 0), inline: true },
                            { name: '🏷️ Tag Status', value: data.hasTag ? '✅ Has HDRX' : '❌ No Tag', inline: true }
                        )
                        .setThumbnail(data.userAvatar)
                        .setFooter({ text: `User ID: ${data.userId}` });
                    break;

                case 'VOICE_LEAVE':
                    const sessionColor = data.sessionMinutes >= 60 ? '#5865f2' : data.sessionMinutes >= 30 ? '#57f287' : '#99aab5';
                    embed.setColor(sessionColor)
                        .setAuthor({ name: '🔇 Voice Channel Left', iconURL: data.userAvatar })
                        .setDescription(`<@${data.userId}> left a voice channel`)
                        .addFields(
                            { name: '📢 Channel', value: `\`${data.channel}\``, inline: true },
                            { name: '⏱️ Session Duration', value: `**${formatMinutes(data.sessionMinutes)}**`, inline: true },
                            { name: '📊 Total Voice Time', value: `**${formatTime(data.totalHours)}**`, inline: true }
                        )
                        .setThumbnail(data.userAvatar)
                        .setFooter({ text: `User ID: ${data.userId} • Keep up the great activity!` });
                    
                    // Add progress bar for next role
                    if (data.nextRole) {
                        const progress = Math.min((data.totalHours / data.nextRole.hours) * 100, 100);
                        const progressBar = this.createProgressBar(progress);
                        embed.addFields({
                            name: `🎯 Progress to ${data.nextRole.name}`,
                            value: `${progressBar} ${progress.toFixed(0)}%\n${formatTime(data.totalHours)} / ${data.nextRole.hours}h`,
                            inline: false
                        });
                    }
                    break;

                case 'VOICE_MOVE':
                    embed.setColor('#fee75c')
                        .setAuthor({ name: '🔄 Voice Channel Switched', iconURL: data.userAvatar })
                        .setDescription(`<@${data.userId}> ${data.executor ? `was moved by **${data.executor}**` : 'moved between voice channels'}`)
                        .addFields(
                            { name: '📤 From', value: `\`${data.oldChannel}\``, inline: true },
                            { name: '📥 To', value: `\`${data.newChannel}\``, inline: true }
                        );
                    
                    if (data.executor) {
                        embed.addFields({ name: '👤 Moved By', value: data.executor, inline: true });
                    }
                    
                    embed.setThumbnail(data.userAvatar)
                        .setFooter({ text: `User ID: ${data.userId}` });
                    break;

                case 'VOICE_MUTE':
                    const muteDesc = data.selfMute 
                        ? `<@${data.userId}> muted themselves`
                        : data.executor 
                            ? `<@${data.userId}> was muted by **${data.executor}**`
                            : `<@${data.userId}> was server muted`;
                    
                    embed.setColor('#ed4245')
                        .setAuthor({ name: '🔇 Voice Muted', iconURL: data.userAvatar })
                        .setDescription(muteDesc)
                        .addFields(
                            { name: '📢 Channel', value: `\`${data.channel}\``, inline: true },
                            { name: '🎯 Type', value: data.selfMute ? '🔇 Self Mute' : '⚠️ Server Mute', inline: true }
                        );
                    
                    if (data.executor && !data.selfMute) {
                        embed.addFields({ name: '👤 Muted By', value: data.executor, inline: true });
                    }
                    
                    embed.setThumbnail(data.userAvatar)
                        .setFooter({ text: `User ID: ${data.userId}` });
                    break;

                case 'VOICE_UNMUTE':
                    const unmuteDesc = data.selfMute 
                        ? `<@${data.userId}> unmuted themselves`
                        : data.executor 
                            ? `<@${data.userId}> was unmuted by **${data.executor}**`
                            : `<@${data.userId}> was server unmuted`;
                    
                    embed.setColor('#57f287')
                        .setAuthor({ name: '🔊 Voice Unmuted', iconURL: data.userAvatar })
                        .setDescription(unmuteDesc)
                        .addFields(
                            { name: '📢 Channel', value: `\`${data.channel}\``, inline: true },
                            { name: '🎯 Type', value: data.selfMute ? '🔊 Self Unmute' : '✅ Server Unmute', inline: true }
                        );
                    
                    if (data.executor && !data.selfMute) {
                        embed.addFields({ name: '👤 Unmuted By', value: data.executor, inline: true });
                    }
                    
                    embed.setThumbnail(data.userAvatar)
                        .setFooter({ text: `User ID: ${data.userId}` });
                    break;

                case 'VOICE_DEAF':
                    const deafDesc = data.selfDeaf 
                        ? `<@${data.userId}> deafened themselves`
                        : data.executor 
                            ? `<@${data.userId}> was deafened by **${data.executor}**`
                            : `<@${data.userId}> was server deafened`;
                    
                    embed.setColor('#ed4245')
                        .setAuthor({ name: '🔇 Voice Deafened', iconURL: data.userAvatar })
                        .setDescription(deafDesc)
                        .addFields(
                            { name: '📢 Channel', value: `\`${data.channel}\``, inline: true },
                            { name: '🎯 Type', value: data.selfDeaf ? '🔇 Self Deafen' : '⚠️ Server Deafen', inline: true }
                        );
                    
                    if (data.executor && !data.selfDeaf) {
                        embed.addFields({ name: '👤 Deafened By', value: data.executor, inline: true });
                    }
                    
                    embed.setThumbnail(data.userAvatar)
                        .setFooter({ text: `User ID: ${data.userId}` });
                    break;

                case 'VOICE_UNDEAF':
                    const undeafDesc = data.selfDeaf 
                        ? `<@${data.userId}> undeafened themselves`
                        : data.executor 
                            ? `<@${data.userId}> was undeafened by **${data.executor}**`
                            : `<@${data.userId}> was server undeafened`;
                    
                    embed.setColor('#57f287')
                        .setAuthor({ name: '🔊 Voice Undeafened', iconURL: data.userAvatar })
                        .setDescription(undeafDesc)
                        .addFields(
                            { name: '📢 Channel', value: `\`${data.channel}\``, inline: true },
                            { name: '🎯 Type', value: data.selfDeaf ? '🔊 Self Undeafen' : '✅ Server Undeafen', inline: true }
                        );
                    
                    if (data.executor && !data.selfDeaf) {
                        embed.addFields({ name: '👤 Undeafened By', value: data.executor, inline: true });
                    }
                    
                    embed.setThumbnail(data.userAvatar)
                        .setFooter({ text: `User ID: ${data.userId}` });
                    break;

                case 'VOICE_STREAM_START':
                    embed.setColor('#9b59b6')
                        .setAuthor({ name: '📹 Started Streaming', iconURL: data.userAvatar })
                        .setDescription(`<@${data.userId}> started streaming their screen`)
                        .addFields(
                            { name: '📢 Channel', value: `\`${data.channel}\``, inline: true },
                            { name: '🎥 Status', value: '🔴 Live', inline: true }
                        )
                        .setThumbnail(data.userAvatar)
                        .setFooter({ text: `User ID: ${data.userId}` });
                    break;

                case 'VOICE_STREAM_STOP':
                    embed.setColor('#95a5a6')
                        .setAuthor({ name: '📹 Stopped Streaming', iconURL: data.userAvatar })
                        .setDescription(`<@${data.userId}> stopped streaming`)
                        .addFields(
                            { name: '📢 Channel', value: `\`${data.channel}\``, inline: true },
                            { name: '🎥 Status', value: '⚫ Offline', inline: true }
                        )
                        .setThumbnail(data.userAvatar)
                        .setFooter({ text: `User ID: ${data.userId}` });
                    break;

                case 'VOICE_VIDEO_START':
                    embed.setColor('#3498db')
                        .setAuthor({ name: '📷 Camera Enabled', iconURL: data.userAvatar })
                        .setDescription(`<@${data.userId}> turned on their camera`)
                        .addFields(
                            { name: '📢 Channel', value: `\`${data.channel}\``, inline: true },
                            { name: '📷 Status', value: '🟢 Camera On', inline: true }
                        )
                        .setThumbnail(data.userAvatar)
                        .setFooter({ text: `User ID: ${data.userId}` });
                    break;

                case 'VOICE_VIDEO_STOP':
                    embed.setColor('#95a5a6')
                        .setAuthor({ name: '📷 Camera Disabled', iconURL: data.userAvatar })
                        .setDescription(`<@${data.userId}> turned off their camera`)
                        .addFields(
                            { name: '📢 Channel', value: `\`${data.channel}\``, inline: true },
                            { name: '📷 Status', value: '⚫ Camera Off', inline: true }
                        )
                        .setThumbnail(data.userAvatar)
                        .setFooter({ text: `User ID: ${data.userId}` });
                    break;

                // ===== ADMIN ACTIONS =====
                case 'TAG_UPDATE':
                    embed.setColor('#f39c12')
                        .setAuthor({ name: '🏷️ Tag Status Updated', iconURL: data.userAvatar })
                        .setDescription(`<@${data.userId}> ${data.hasTag ? 'is now using' : 'removed'} the HDRX tag`)
                        .addFields(
                            { name: '👤 Updated By', value: data.admin, inline: true },
                            { name: '✅ Status', value: data.hasTag ? 'Has Tag' : 'No Tag', inline: true }
                        );
                    break;

                case 'TAG_REMINDER_SENT':
                    embed.setColor('#e67e22')
                        .setAuthor({ name: '📨 Tag Reminder Sent', iconURL: data.userAvatar })
                        .setDescription(`<@${data.userId}> was reminded to add the HDRX tag`)
                        .addFields(
                            { name: '🎭 Eligible Role', value: data.role, inline: true },
                            { name: '⏱️ Voice Time', value: formatTime(data.hours), inline: true },
                            { name: '📝 Status', value: 'Waiting for tag', inline: true }
                        );
                    break;

                case 'ADMIN_ACTION':
                    embed.setColor('#e74c3c')
                        .setAuthor({ name: '⚙️ Admin Action' })
                        .setDescription(message)
                        .addFields(
                            { name: '👤 Admin', value: data.admin, inline: true },
                            { name: '🎯 Target', value: data.target, inline: true }
                        );
                    if (data.details) {
                        embed.addFields({ name: '📝 Details', value: data.details });
                    }
                    break;

                // ===== SYSTEM EVENTS =====
                case 'BOT_READY':
                    embed.setColor('#2ecc71')
                        .setAuthor({ name: '✅ HYDROX Bot Online' })
                        .setDescription('🎯 Voice tracking system is now active!\n📊 All events are being monitored')
                        .addFields(
                            { name: '🤖 Bot', value: data.botTag || 'HYDROX Bot', inline: true },
                            { name: '🌐 Servers', value: `${data.guildCount || 1}`, inline: true },
                            { name: '👥 Users', value: `${data.userCount || 'N/A'}`, inline: true }
                        );
                    break;

                default:
                    embed.setColor('#95a5a6')
                        .setAuthor({ name: '📝 System Log' })
                        .setDescription(message || 'No description provided');
            }

            await channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error sending log to channel:', error);
        }
    }
}

module.exports = Logger;
