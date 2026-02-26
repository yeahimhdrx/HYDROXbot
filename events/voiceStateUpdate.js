const VoiceTracker = require('../utils/voiceTracker');
const RoleManager = require('../utils/roleManager');
const Logger = require('../utils/logger');
const config = require('../config');

module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState) {
        const member = newState.member || oldState.member;
        if (!member || member.user.bot) return;

        const user = member.user.tag;
        const userId = member.user.id;
        const userAvatar = member.user.displayAvatarURL({ dynamic: true });

        // User joined a voice channel
        if (!oldState.channelId && newState.channelId) {
            await VoiceTracker.joinVoice(userId, newState.channelId, newState.channel?.name);
            const stats = await VoiceTracker.getUserStats(userId);
            
            await Logger.log('VOICE_JOIN', null, {
                user,
                userId,
                userAvatar,
                channel: newState.channel?.name || 'Unknown',
                totalHours: stats.totalHours,
                hasTag: stats.hasTag
            });
        }

        // User left a voice channel
        if (oldState.channelId && !newState.channelId) {
            const sessionMinutes = await VoiceTracker.leaveVoice(userId);
            const stats = await VoiceTracker.getUserStats(userId);
            const hasTag = await VoiceTracker.hasTag(userId);
            
            // Find next role
            let nextRole = null;
            for (const roleConfig of config.roles) {
                if (stats.totalHours < roleConfig.hours) {
                    if (!roleConfig.requiresTag || hasTag) {
                        nextRole = roleConfig;
                        break;
                    }
                }
            }
            
            await Logger.log('VOICE_LEAVE', null, {
                user,
                userId,
                userAvatar,
                channel: oldState.channel?.name || 'Unknown',
                sessionMinutes: sessionMinutes,
                totalHours: stats.totalHours,
                nextRole: nextRole
            });

            // Check if user earned any roles
            await RoleManager.checkAndGrantRoles(member);
        }

        // User moved between voice channels
        if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
            // Try to get who moved the user from audit logs
            let executor = null;
            try {
                const auditLogs = await oldState.guild.fetchAuditLogs({
                    limit: 1,
                    type: 26 // MEMBER_MOVE
                });
                const moveLog = auditLogs.entries.first();
                if (moveLog && moveLog.target.id === userId && (Date.now() - moveLog.createdTimestamp) < 5000) {
                    executor = moveLog.executor.tag;
                }
            } catch (error) {
                // Ignore audit log errors
            }

            await Logger.log('VOICE_MOVE', null, {
                user,
                userId,
                userAvatar,
                oldChannel: oldState.channel?.name || 'Unknown',
                newChannel: newState.channel?.name || 'Unknown',
                executor: executor
            });
        }

        // Mute status changed
        if (oldState.channelId && newState.channelId) {
            // Server mute
            if (oldState.serverMute !== newState.serverMute) {
                // Try to get who muted/unmuted the user from audit logs
                let executor = null;
                try {
                    const auditLogs = await oldState.guild.fetchAuditLogs({
                        limit: 1,
                        type: 24 // MEMBER_UPDATE
                    });
                    const muteLog = auditLogs.entries.first();
                    if (muteLog && muteLog.target.id === userId && (Date.now() - muteLog.createdTimestamp) < 5000) {
                        executor = muteLog.executor.tag;
                    }
                } catch (error) {
                    // Ignore audit log errors
                }

                await Logger.log(newState.serverMute ? 'VOICE_MUTE' : 'VOICE_UNMUTE', null, {
                    user,
                    userId,
                    userAvatar,
                    channel: newState.channel?.name || 'Unknown',
                    selfMute: false,
                    executor: executor
                });
            }

            // Self mute
            if (oldState.selfMute !== newState.selfMute) {
                await Logger.log(newState.selfMute ? 'VOICE_MUTE' : 'VOICE_UNMUTE', null, {
                    user,
                    userId,
                    userAvatar,
                    channel: newState.channel?.name || 'Unknown',
                    selfMute: true
                });
            }

            // Server deafen
            if (oldState.serverDeaf !== newState.serverDeaf) {
                // Try to get who deafened/undeafened the user from audit logs
                let executor = null;
                try {
                    const auditLogs = await oldState.guild.fetchAuditLogs({
                        limit: 1,
                        type: 24 // MEMBER_UPDATE
                    });
                    const deafLog = auditLogs.entries.first();
                    if (deafLog && deafLog.target.id === userId && (Date.now() - deafLog.createdTimestamp) < 5000) {
                        executor = deafLog.executor.tag;
                    }
                } catch (error) {
                    // Ignore audit log errors
                }

                await Logger.log(newState.serverDeaf ? 'VOICE_DEAF' : 'VOICE_UNDEAF', null, {
                    user,
                    userId,
                    userAvatar,
                    channel: newState.channel?.name || 'Unknown',
                    selfDeaf: false,
                    executor: executor
                });
            }

            // Self deafen
            if (oldState.selfDeaf !== newState.selfDeaf) {
                await Logger.log(newState.selfDeaf ? 'VOICE_DEAF' : 'VOICE_UNDEAF', null, {
                    user,
                    userId,
                    userAvatar,
                    channel: newState.channel?.name || 'Unknown',
                    selfDeaf: true
                });
            }

            // Streaming status
            if (oldState.streaming !== newState.streaming) {
                await Logger.log(newState.streaming ? 'VOICE_STREAM_START' : 'VOICE_STREAM_STOP', null, {
                    user,
                    userId,
                    userAvatar,
                    channel: newState.channel?.name || 'Unknown'
                });
            }

            // Video status
            if (oldState.selfVideo !== newState.selfVideo) {
                await Logger.log(newState.selfVideo ? 'VOICE_VIDEO_START' : 'VOICE_VIDEO_STOP', null, {
                    user,
                    userId,
                    userAvatar,
                    channel: newState.channel?.name || 'Unknown'
                });
            }
        }
    },
};
