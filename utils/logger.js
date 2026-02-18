const { EmbedBuilder } = require('discord.js');
const { formatTime, formatMinutes } = require('./timeFormatter');

class Logger {
    static client = null;
    static logChannelId = process.env.LOG_CHANNEL_ID;
    static roleLogChannelId = process.env.ROLE_LOG_CHANNEL_ID;
    static deletedMessagesLogChannelId = process.env.DELETED_MESSAGES_LOG_CHANNEL_ID;

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
        const logMessage = `[${type}] ${message || JSON.stringify(data)}`;
        console.log(logMessage);
        
        if (!this.client) {
            console.warn('[Logger] Client not set, cannot send to Discord');
            return;
        }

        // Determine which channel to use based on log type
        const isRoleLog = ['ROLE_ADD', 'ROLE_REMOVE', 'ROLE_GRANTED'].includes(type);
        const isDeletedMessageLog = ['MESSAGE_DELETE', 'MESSAGE_BULK_DELETE'].includes(type);
        
        let channelId;
        if (isDeletedMessageLog) {
            channelId = this.deletedMessagesLogChannelId;
        } else if (isRoleLog) {
            channelId = this.roleLogChannelId;
        } else {
            channelId = this.logChannelId;
        }
        
        if (!channelId) {
            if (isRoleLog && !this.roleLogChannelId) {
                // Fallback to main log channel if role log channel not set
                const fallbackChannelId = this.logChannelId;
                if (!fallbackChannelId) {
                    console.warn('[Logger] No log channel configured');
                    return;
                }
                return this.sendToChannel(fallbackChannelId, type, message, data);
            }
            if (isDeletedMessageLog && !this.deletedMessagesLogChannelId) {
                // Fallback to main log channel if deleted messages channel not set
                const fallbackChannelId = this.logChannelId;
                if (!fallbackChannelId) {
                    console.warn('[Logger] No log channel configured');
                    return;
                }
                return this.sendToChannel(fallbackChannelId, type, message, data);
            }
            console.warn(`[Logger] No channel configured for ${type}`);
            return;
        }

        return this.sendToChannel(channelId, type, message, data);
    }

    static async sendToChannel(channelId, type, message, data = {}) {
        try {
            const channel = await this.client.channels.fetch(channelId);
            if (!channel) {
                console.error(`[Logger] Channel ${channelId} not found`);
                return;
            }
            if (!channel.isTextBased()) {
                console.error(`[Logger] Channel ${channelId} is not a text channel`);
                return;
            }

            const embed = new EmbedBuilder()
                .setTimestamp()
                .setFooter({ text: 'HYDROX Logging System' });

            switch (type) {
                // ===== MEMBER EVENTS =====
                case 'MEMBER_JOIN':
                    const accountAgeDays = data.accountAge || 0;
                    const accountAgeColor = accountAgeDays < 7 ? '🔴' : accountAgeDays < 30 ? '🟡' : '🟢';
                    
                    embed.setColor('#57f287')
                        .setAuthor({ name: '👋 Member Joined', iconURL: data.userAvatar })
                        .setDescription(`${accountAgeColor} <@${data.userId}> joined the server!`)
                        .addFields(
                            { name: '👤 Username', value: data.user, inline: true },
                            { name: '🆔 User ID', value: `\`${data.userId}\``, inline: true },
                            { name: '👥 Member Count', value: `${data.memberCount}`, inline: true },
                            { name: '📅 Account Created', value: `${accountAgeDays} days ago`, inline: true },
                            { name: '⏰ Joined At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
                        )
                        .setThumbnail(data.userAvatar)
                        .setFooter({ text: `User ID: ${data.userId}` });
                    break;

                case 'MEMBER_LEAVE':
                    embed.setColor('#ed4245')
                        .setAuthor({ name: '👋 Member Left', iconURL: data.userAvatar })
                        .setDescription(`<@${data.userId}> left the server`)
                        .addFields(
                            { name: '👤 Username', value: data.user, inline: true },
                            { name: '👥 Member Count', value: `${data.memberCount}`, inline: true },
                            { name: '⏱️ Time in Server', value: data.timeInServer || 'Unknown', inline: true }
                        )
                        .setThumbnail(data.userAvatar);
                    break;

                // ===== ROLE EVENTS =====
                case 'ROLE_GRANTED':
                    embed.setColor('#00d9ff')
                        .setAuthor({ name: '🎉 Role Automatically Granted', iconURL: data.userAvatar })
                        .setDescription(`<@${data.userId}> earned a role through voice activity!`)
                        .addFields(
                            { name: '🎭 Role Earned', value: `**${data.role}**`, inline: true },
                            { name: '👤 User', value: `<@${data.userId}>`, inline: true },
                            { name: '\u200b', value: '\u200b', inline: true },
                            { name: '⏱️ Voice Time Required', value: `\`${formatTime(data.hours)}\``, inline: true },
                            { name: '🏷️ Tag Requirement', value: data.hasTag ? '✅ `HDRX Tag Required`' : '❌ `No Tag Required`', inline: true },
                            { name: '🤖 Granted By', value: '`HYDROX Bot`', inline: true },
                            { name: '🕐 Granted At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false },
                            { name: '📋 Achievement', value: '```User met all requirements for this role```', inline: false }
                        )
                        .setThumbnail(data.userAvatar)
                        .setFooter({ text: `User ID: ${data.userId} • Automatic Role Grant` });
                    break;

                case 'ROLE_ADD':
                    embed.setColor('#57f287')
                        .setAuthor({ name: '➕ Role Added', iconURL: data.userAvatar })
                        .setDescription(`<@${data.userId}> received a new role`)
                        .addFields(
                            { name: '🎭 Role Added', value: `**${data.roleName}**`, inline: true },
                            { name: '👤 Target User', value: `<@${data.userId}>`, inline: true },
                            { name: '\u200b', value: '\u200b', inline: true },
                            { name: '👮 Added By', value: data.executorId ? `<@${data.executorId}>` : '`System`', inline: true },
                            { name: '🏷️ Executor Tag', value: `\`${data.executor}\``, inline: true },
                            { name: '🔧 Action Type', value: data.executorId ? '`Manual Assignment`' : '`System Assignment`', inline: true },
                            { name: '🕐 Added At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false },
                            { name: '📋 Details', value: `\`\`\`Role: ${data.roleName}\nUser: ${data.user}\nExecutor: ${data.executor}\`\`\``, inline: false }
                        )
                        .setThumbnail(data.executorAvatar || data.userAvatar)
                        .setFooter({ text: `User ID: ${data.userId} • Role Management` });
                    break;

                case 'ROLE_REMOVE':
                    embed.setColor('#ed4245')
                        .setAuthor({ name: '➖ Role Removed', iconURL: data.userAvatar })
                        .setDescription(`<@${data.userId}> lost a role`)
                        .addFields(
                            { name: '🎭 Role Removed', value: `**${data.roleName}**`, inline: true },
                            { name: '👤 Target User', value: `<@${data.userId}>`, inline: true },
                            { name: '\u200b', value: '\u200b', inline: true },
                            { name: '👮 Removed By', value: data.executorId ? `<@${data.executorId}>` : '`System`', inline: true },
                            { name: '🏷️ Executor Tag', value: `\`${data.executor}\``, inline: true },
                            { name: '🔧 Action Type', value: data.executorId ? '`Manual Removal`' : '`System Removal`', inline: true },
                            { name: '🕐 Removed At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false },
                            { name: '📋 Details', value: `\`\`\`Role: ${data.roleName}\nUser: ${data.user}\nExecutor: ${data.executor}\`\`\``, inline: false }
                        )
                        .setThumbnail(data.executorAvatar || data.userAvatar)
                        .setFooter({ text: `User ID: ${data.userId} • Role Management` });
                    break;

                // ===== VOICE EVENTS =====
                case 'VOICE_JOIN':
                    const joinSessionInfo = data.sessionCount > 0 
                        ? `Session #${data.sessionCount + 1}` 
                        : 'First Session';
                    
                    embed.setColor('#57f287')
                        .setAuthor({ name: '🎤 Voice Channel Joined', iconURL: data.userAvatar })
                        .setDescription(`<@${data.userId}> joined a voice channel`)
                        .addFields(
                            { name: '📢 Voice Channel', value: `\`${data.channel}\``, inline: true },
                            { name: '🏷️ Tag Status', value: data.hasTag ? '✅ `Has HDRX Tag`' : '❌ `No Tag`', inline: true },
                            { name: '\u200b', value: '\u200b', inline: true },
                            { name: '📊 Total Voice Time', value: `**${formatTime(data.totalHours || 0)}**`, inline: true },
                            { name: '🔢 Session Number', value: `**${joinSessionInfo}**`, inline: true },
                            { name: '🕐 Join Time', value: `<t:${Math.floor(Date.now() / 1000)}:T>`, inline: true }
                        )
                        .setThumbnail(data.userAvatar)
                        .setFooter({ text: `User ID: ${data.userId} • Voice Activity Tracking` });
                    break;

                case 'VOICE_LEAVE':
                    const sessionColor = data.sessionMinutes >= 60 ? '#5865f2' : data.sessionMinutes >= 30 ? '#57f287' : '#99aab5';
                    const sessionEmoji = data.sessionMinutes >= 60 ? '🏆' : data.sessionMinutes >= 30 ? '⭐' : '📊';
                    
                    // Format session duration with seconds precision
                    const sessionDurationText = data.sessionSeconds 
                        ? `${Math.floor(data.sessionSeconds / 60)}m ${data.sessionSeconds % 60}s`
                        : formatMinutes(data.sessionMinutes);
                    
                    embed.setColor(sessionColor)
                        .setAuthor({ name: '🔇 Voice Channel Left', iconURL: data.userAvatar })
                        .setDescription(`<@${data.userId}> left a voice channel`)
                        .addFields(
                            { name: '📢 Voice Channel', value: `\`${data.channel}\``, inline: true },
                            { name: `${sessionEmoji} Session Duration`, value: `**${sessionDurationText}**`, inline: true },
                            { name: '\u200b', value: '\u200b', inline: true },
                            { name: '📊 Total Voice Time', value: `**${formatTime(data.totalHours)}**`, inline: true },
                            { name: '🔢 Total Sessions', value: `**${data.sessionCount || 0}**`, inline: true },
                            { name: '🕐 Leave Time', value: `<t:${Math.floor(Date.now() / 1000)}:T>`, inline: true }
                        )
                        .setThumbnail(data.userAvatar)
                        .setFooter({ text: `User ID: ${data.userId} • Voice Activity Tracking` });
                    
                    // Add progress bar for next role
                    if (data.nextRole) {
                        const progress = Math.min((data.totalHours / data.nextRole.hours) * 100, 100);
                        const progressBar = this.createProgressBar(progress);
                        const remaining = Math.max(0, data.nextRole.hours - data.totalHours);
                        embed.addFields({
                            name: `🎯 Progress to ${data.nextRole.name}`,
                            value: `${progressBar} **${progress.toFixed(1)}%**\n\`${formatTime(data.totalHours)}\` / \`${data.nextRole.hours}h\` • **${formatTime(remaining)}** remaining`,
                            inline: false
                        });
                    }
                    break;

                case 'VOICE_MOVE':
                    embed.setColor('#fee75c')
                        .setAuthor({ name: '🔄 Voice Channel Move', iconURL: data.userAvatar })
                        .setDescription(data.executor 
                            ? `<@${data.userId}> was moved by <@${data.executorId}>`
                            : `<@${data.userId}> switched voice channels`)
                        .addFields(
                            { name: '📤 Previous Channel', value: `\`${data.oldChannel}\``, inline: true },
                            { name: '📥 New Channel', value: `\`${data.newChannel}\``, inline: true },
                            { name: '\u200b', value: '\u200b', inline: true }
                        );
                    
                    if (data.executor) {
                        embed.addFields(
                            { name: '👤 Moderator', value: `<@${data.executorId}>`, inline: true },
                            { name: '🏷️ Moderator Tag', value: `\`${data.executor}\``, inline: true },
                            { name: '⚡ Action Type', value: '`Forced Move`', inline: true }
                        );
                        embed.setThumbnail(data.executorAvatar);
                    } else {
                        embed.addFields(
                            { name: '⚡ Action Type', value: '`Self Move`', inline: true },
                            { name: '🕐 Timestamp', value: `<t:${Math.floor(Date.now() / 1000)}:T>`, inline: true },
                            { name: '\u200b', value: '\u200b', inline: true }
                        );
                        embed.setThumbnail(data.userAvatar);
                    }
                    
                    embed.setFooter({ text: `User ID: ${data.userId} • ${data.executor ? 'Moderator Action' : 'User Action'}` });
                    break;

                case 'VOICE_MUTE':
                    embed.setColor('#ed4245')
                        .setAuthor({ name: '🔇 Voice Mute Applied', iconURL: data.executorAvatar || data.userAvatar })
                        .setDescription(`<@${data.userId}> was server muted by <@${data.executorId}>`)
                        .addFields(
                            { name: '🎯 Target User', value: `<@${data.userId}>`, inline: true },
                            { name: '📢 Voice Channel', value: `\`${data.channel}\``, inline: true },
                            { name: '\u200b', value: '\u200b', inline: true },
                            { name: '👤 Moderator', value: `<@${data.executorId}>`, inline: true },
                            { name: '🏷️ Moderator Tag', value: `\`${data.executor}\``, inline: true },
                            { name: '⚠️ Action Type', value: '`Server Mute`', inline: true },
                            { name: '🕐 Timestamp', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false },
                            { name: '📋 Details', value: '```User cannot speak in voice channels```', inline: false }
                        )
                        .setThumbnail(data.executorAvatar)
                        .setFooter({ text: `Target ID: ${data.userId} • Moderator Action` });
                    break;

                case 'VOICE_UNMUTE':
                    embed.setColor('#57f287')
                        .setAuthor({ name: '🔊 Voice Mute Removed', iconURL: data.executorAvatar || data.userAvatar })
                        .setDescription(`<@${data.userId}> was unmuted by <@${data.executorId}>`)
                        .addFields(
                            { name: '🎯 Target User', value: `<@${data.userId}>`, inline: true },
                            { name: '📢 Voice Channel', value: `\`${data.channel}\``, inline: true },
                            { name: '\u200b', value: '\u200b', inline: true },
                            { name: '👤 Moderator', value: `<@${data.executorId}>`, inline: true },
                            { name: '🏷️ Moderator Tag', value: `\`${data.executor}\``, inline: true },
                            { name: '✅ Action Type', value: '`Server Unmute`', inline: true },
                            { name: '🕐 Timestamp', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false },
                            { name: '📋 Details', value: '```User can now speak in voice channels```', inline: false }
                        )
                        .setThumbnail(data.executorAvatar)
                        .setFooter({ text: `Target ID: ${data.userId} • Moderator Action` });
                    break;

                case 'VOICE_DEAF':
                    embed.setColor('#ed4245')
                        .setAuthor({ name: '🔇 Voice Deafen Applied', iconURL: data.executorAvatar || data.userAvatar })
                        .setDescription(`<@${data.userId}> was server deafened by <@${data.executorId}>`)
                        .addFields(
                            { name: '🎯 Target User', value: `<@${data.userId}>`, inline: true },
                            { name: '📢 Voice Channel', value: `\`${data.channel}\``, inline: true },
                            { name: '\u200b', value: '\u200b', inline: true },
                            { name: '👤 Moderator', value: `<@${data.executorId}>`, inline: true },
                            { name: '🏷️ Moderator Tag', value: `\`${data.executor}\``, inline: true },
                            { name: '⚠️ Action Type', value: '`Server Deafen`', inline: true },
                            { name: '🕐 Timestamp', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false },
                            { name: '📋 Details', value: '```User cannot hear or speak in voice channels```', inline: false }
                        )
                        .setThumbnail(data.executorAvatar)
                        .setFooter({ text: `Target ID: ${data.userId} • Moderator Action` });
                    break;

                case 'VOICE_UNDEAF':
                    embed.setColor('#57f287')
                        .setAuthor({ name: '🔊 Voice Deafen Removed', iconURL: data.executorAvatar || data.userAvatar })
                        .setDescription(`<@${data.userId}> was undeafened by <@${data.executorId}>`)
                        .addFields(
                            { name: '🎯 Target User', value: `<@${data.userId}>`, inline: true },
                            { name: '📢 Voice Channel', value: `\`${data.channel}\``, inline: true },
                            { name: '\u200b', value: '\u200b', inline: true },
                            { name: '👤 Moderator', value: `<@${data.executorId}>`, inline: true },
                            { name: '🏷️ Moderator Tag', value: `\`${data.executor}\``, inline: true },
                            { name: '✅ Action Type', value: '`Server Undeafen`', inline: true },
                            { name: '🕐 Timestamp', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false },
                            { name: '📋 Details', value: '```User can now hear and speak in voice channels```', inline: false }
                        )
                        .setThumbnail(data.executorAvatar)
                        .setFooter({ text: `Target ID: ${data.userId} • Moderator Action` });
                    break;

                case 'VOICE_STREAM_START':
                    embed.setColor('#9b59b6')
                        .setAuthor({ name: '📹 Screen Share Started', iconURL: data.userAvatar })
                        .setDescription(`<@${data.userId}> started streaming their screen`)
                        .addFields(
                            { name: '📢 Voice Channel', value: `\`${data.channel}\``, inline: true },
                            { name: '🎥 Stream Status', value: '🔴 `Live Now`', inline: true },
                            { name: '\u200b', value: '\u200b', inline: true },
                            { name: '🕐 Started At', value: `<t:${Math.floor(Date.now() / 1000)}:T>`, inline: true },
                            { name: '📅 Date', value: `<t:${Math.floor(Date.now() / 1000)}:D>`, inline: true },
                            { name: '\u200b', value: '\u200b', inline: true },
                            { name: '📋 Activity', value: '```User is sharing their screen with the channel```', inline: false }
                        )
                        .setThumbnail(data.userAvatar)
                        .setFooter({ text: `User ID: ${data.userId} • Screen Share Activity` });
                    break;

                case 'VOICE_STREAM_STOP':
                    embed.setColor('#95a5a6')
                        .setAuthor({ name: '📹 Screen Share Ended', iconURL: data.userAvatar })
                        .setDescription(`<@${data.userId}> stopped streaming`)
                        .addFields(
                            { name: '📢 Voice Channel', value: `\`${data.channel}\``, inline: true },
                            { name: '🎥 Stream Status', value: '⚫ `Offline`', inline: true },
                            { name: '\u200b', value: '\u200b', inline: true },
                            { name: '🕐 Stopped At', value: `<t:${Math.floor(Date.now() / 1000)}:T>`, inline: true },
                            { name: '📅 Date', value: `<t:${Math.floor(Date.now() / 1000)}:D>`, inline: true },
                            { name: '\u200b', value: '\u200b', inline: true }
                        )
                        .setThumbnail(data.userAvatar)
                        .setFooter({ text: `User ID: ${data.userId} • Screen Share Activity` });
                    break;

                case 'VOICE_VIDEO_START':
                    embed.setColor('#3498db')
                        .setAuthor({ name: '📷 Camera Enabled', iconURL: data.userAvatar })
                        .setDescription(`<@${data.userId}> turned on their camera`)
                        .addFields(
                            { name: '📢 Voice Channel', value: `\`${data.channel}\``, inline: true },
                            { name: '📷 Camera Status', value: '🟢 `Camera On`', inline: true },
                            { name: '\u200b', value: '\u200b', inline: true },
                            { name: '🕐 Enabled At', value: `<t:${Math.floor(Date.now() / 1000)}:T>`, inline: true },
                            { name: '📅 Date', value: `<t:${Math.floor(Date.now() / 1000)}:D>`, inline: true },
                            { name: '\u200b', value: '\u200b', inline: true },
                            { name: '📋 Activity', value: '```User is now visible on camera```', inline: false }
                        )
                        .setThumbnail(data.userAvatar)
                        .setFooter({ text: `User ID: ${data.userId} • Video Activity` });
                    break;

                case 'VOICE_VIDEO_STOP':
                    embed.setColor('#95a5a6')
                        .setAuthor({ name: '📷 Camera Disabled', iconURL: data.userAvatar })
                        .setDescription(`<@${data.userId}> turned off their camera`)
                        .addFields(
                            { name: '📢 Voice Channel', value: `\`${data.channel}\``, inline: true },
                            { name: '📷 Camera Status', value: '⚫ `Camera Off`', inline: true },
                            { name: '\u200b', value: '\u200b', inline: true },
                            { name: '🕐 Disabled At', value: `<t:${Math.floor(Date.now() / 1000)}:T>`, inline: true },
                            { name: '📅 Date', value: `<t:${Math.floor(Date.now() / 1000)}:D>`, inline: true },
                            { name: '\u200b', value: '\u200b', inline: true }
                        )
                        .setThumbnail(data.userAvatar)
                        .setFooter({ text: `User ID: ${data.userId} • Video Activity` });
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

                // ===== MESSAGE EVENTS =====
                case 'MESSAGE_DELETE':
                    const deleteColor = data.isBot ? '#95a5a6' : '#e74c3c';
                    const isUnknown = data.userId === 'Unknown' || data.user === 'Unknown User';
                    const wasDeletedByModerator = data.deletedBy && data.deletedById !== data.userId;
                    
                    // ALWAYS show content field - this is critical
                    let contentDisplay;
                    if (data.content && data.content.trim().length > 0) {
                        // Has content - show it
                        const contentPreview = data.content.length > 1024 
                            ? data.content.substring(0, 1021) + '...' 
                            : data.content;
                        contentDisplay = `\`\`\`${contentPreview}\`\`\``;
                    } else if (isUnknown) {
                        // Unknown user - message not cached
                        contentDisplay = '```⚠️ Message was sent before bot started\nContent not available - message not in cache```';
                    } else if (data.attachments && data.attachments.length > 0) {
                        // No text but has attachments
                        contentDisplay = '```[Message contained only attachments, no text]```';
                    } else {
                        // Empty message
                        contentDisplay = '```[Empty message or content not available]```';
                    }
                    
                    embed.setColor(deleteColor)
                        .setAuthor({ 
                            name: wasDeletedByModerator ? '🗑️ Message Deleted by Moderator' : '🗑️ Message Deleted', 
                            iconURL: wasDeletedByModerator ? data.deletedByAvatar : (data.userAvatar || 'https://cdn.discordapp.com/embed/avatars/0.png')
                        });
                    
                    if (wasDeletedByModerator) {
                        embed.setDescription(
                            `Message by <@${data.userId}> was deleted by <@${data.deletedById}> in <#${data.channelId}>`
                        );
                    } else if (isUnknown) {
                        embed.setDescription(
                            `Message deleted in <#${data.channelId}>\n⚠️ *Message was not in cache - author unknown*`
                        );
                    } else {
                        embed.setDescription(
                            `Message by <@${data.userId}> was deleted in <#${data.channelId}>`
                        );
                    }
                    
                    // Message Author Section
                    if (!isUnknown) {
                        embed.addFields(
                            { name: '👤 Message Author', value: `<@${data.userId}>`, inline: true },
                            { name: '🏷️ Author Tag', value: `\`${data.user}\``, inline: true },
                            { name: '📍 Channel', value: `<#${data.channelId}>`, inline: true }
                        );
                    } else {
                        embed.addFields(
                            { name: '👤 Message Author', value: '`Unknown`', inline: true },
                            { name: '🏷️ Author Tag', value: '`Unknown User`', inline: true },
                            { name: '📍 Channel', value: `<#${data.channelId}>`, inline: true }
                        );
                    }
                    
                    // Deleted By Section (if moderator action)
                    if (wasDeletedByModerator) {
                        embed.addFields(
                            { name: '👮 Deleted By', value: `<@${data.deletedById}>`, inline: true },
                            { name: '🏷️ Moderator Tag', value: `\`${data.deletedBy}\``, inline: true },
                            { name: '⚡ Action Type', value: '`Moderator Delete`', inline: true }
                        );
                    } else {
                        embed.addFields(
                            { name: '⚡ Action Type', value: '`Self Delete`', inline: true },
                            { name: '\u200b', value: '\u200b', inline: true },
                            { name: '\u200b', value: '\u200b', inline: true }
                        );
                    }
                    
                    embed.addFields(
                        { name: '🆔 Message ID', value: `\`${data.messageId}\``, inline: true },
                        { name: '🕐 Deleted At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                        { name: '📅 Created At', value: data.createdAt ? `<t:${Math.floor(data.createdAt / 1000)}:F>` : 'Unknown', inline: true }
                    );
                    
                    // ALWAYS show message content field - this is the most important part!
                    embed.addFields({
                        name: '📝 Message Content',
                        value: contentDisplay,
                        inline: false
                    });
                    
                    if (data.attachments && data.attachments.length > 0) {
                        const attachmentList = data.attachments.map((att, i) => 
                            `${i + 1}. [${att.name}](${att.url}) (${(att.size / 1024).toFixed(2)} KB)`
                        ).join('\n');
                        embed.addFields({
                            name: `📎 Attachments (${data.attachments.length})`,
                            value: attachmentList.length > 1024 ? attachmentList.substring(0, 1021) + '...' : attachmentList,
                            inline: false
                        });
                    }
                    
                    if (data.embeds && data.embeds > 0) {
                        embed.addFields({
                            name: '📊 Embeds',
                            value: `Message contained ${data.embeds} embed(s)`,
                            inline: true
                        });
                    }
                    
                    if (wasDeletedByModerator) {
                        embed.setThumbnail(data.deletedByAvatar)
                            .setFooter({ text: `Author ID: ${data.userId} • Deleted by: ${data.deletedById} • Moderator Action` });
                    } else if (data.isBot) {
                        embed.setFooter({ text: `User ID: ${data.userId} • Bot Message` });
                    } else if (!isUnknown) {
                        embed.setThumbnail(data.userAvatar)
                            .setFooter({ text: `User ID: ${data.userId} • Self Deleted` });
                    } else {
                        embed.setFooter({ text: `Message ID: ${data.messageId} • Message Deletion Log` });
                    }
                    break;

                case 'MESSAGE_BULK_DELETE':
                    embed.setColor('#e74c3c')
                        .setAuthor({ name: '🗑️ Bulk Message Deletion' })
                        .setDescription(`**${data.count}** messages were deleted in <#${data.channelId}>`)
                        .addFields(
                            { name: '📍 Channel', value: `<#${data.channelId}>`, inline: true },
                            { name: '🔢 Messages Deleted', value: `**${data.count}**`, inline: true },
                            { name: '🕐 Deleted At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                        );
                    
                    if (data.executor) {
                        embed.addFields(
                            { name: '👤 Deleted By', value: `<@${data.executorId}>`, inline: true },
                            { name: '🏷️ Executor Tag', value: `\`${data.executor}\``, inline: true },
                            { name: '\u200b', value: '\u200b', inline: true }
                        );
                        if (data.executorAvatar) {
                            embed.setThumbnail(data.executorAvatar);
                        }
                    }
                    
                    if (data.oldestMessage && data.newestMessage) {
                        embed.addFields({
                            name: '📅 Message Range',
                            value: `From: <t:${Math.floor(data.oldestMessage / 1000)}:F>\nTo: <t:${Math.floor(data.newestMessage / 1000)}:F>`,
                            inline: false
                        });
                    }
                    
                    embed.setFooter({ text: `Channel ID: ${data.channelId} • Bulk Deletion` });
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
            console.error(`[Logger] Error sending ${type} log to channel ${channelId}:`, error.message);
            console.error('[Logger] Data:', JSON.stringify(data, null, 2));
        }
    }
}

module.exports = Logger;
