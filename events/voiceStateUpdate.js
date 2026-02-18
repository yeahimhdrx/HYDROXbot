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
            VoiceTracker.joinVoice(userId, newState.channelId, newState.channel.name);
            const stats = VoiceTracker.getUserStats(userId);
            
            await Logger.log('VOICE_JOIN', null, {
                user,
                userId,
                userAvatar,
                channel: newState.channel.name,
                channelId: newState.channelId,
                totalHours: stats.totalHours,
                totalSeconds: stats.totalSeconds,
                sessionCount: stats.sessionCount,
                hasTag: stats.hasTag
            });
        }

        // User left a voice channel
        if (oldState.channelId && !newState.channelId) {
            const sessionMinutes = VoiceTracker.leaveVoice(userId);
            const stats = VoiceTracker.getUserStats(userId);
            
            // Find next role
            let nextRole = null;
            for (const roleConfig of config.roles) {
                if (stats.totalHours < roleConfig.hours) {
                    if (!roleConfig.requiresTag || stats.hasTag) {
                        nextRole = roleConfig;
                        break;
                    }
                }
            }
            
            await Logger.log('VOICE_LEAVE', null, {
                user,
                userId,
                userAvatar,
                channel: oldState.channel.name,
                channelId: oldState.channelId,
                sessionMinutes: sessionMinutes,
                sessionSeconds: stats.lastSessionSeconds,
                totalHours: stats.totalHours,
                totalSeconds: stats.totalSeconds,
                sessionCount: stats.sessionCount,
                nextRole: nextRole
            });

            // Check if user earned any roles
            await RoleManager.checkAndGrantRoles(member);
        }

        // User moved between voice channels
        if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
            // Try to get who moved the user from audit logs
            let executor = null;
            let executorId = null;
            let executorAvatar = null;
            try {
                const auditLogs = await oldState.guild.fetchAuditLogs({
                    limit: 1,
                    type: 26 // MEMBER_MOVE
                });
                const moveLog = auditLogs.entries.first();
                if (moveLog && moveLog.target.id === userId && (Date.now() - moveLog.createdTimestamp) < 5000) {
                    executor = moveLog.executor.tag;
                    executorId = moveLog.executor.id;
                    executorAvatar = moveLog.executor.displayAvatarURL({ dynamic: true });
                }
            } catch (error) {
                // Ignore audit log errors
            }

            await Logger.log('VOICE_MOVE', null, {
                user,
                userId,
                userAvatar,
                oldChannel: oldState.channel.name,
                newChannel: newState.channel.name,
                executor: executor,
                executorId: executorId,
                executorAvatar: executorAvatar
            });
        }

        // Mute status changed
        if (oldState.channelId && newState.channelId) {
            // Server mute (only log if done by another user)
            if (oldState.serverMute !== newState.serverMute) {
                // Try to get who muted/unmuted the user from audit logs
                let executor = null;
                let executorId = null;
                let executorAvatar = null;
                try {
                    const auditLogs = await oldState.guild.fetchAuditLogs({
                        limit: 1,
                        type: 24 // MEMBER_UPDATE
                    });
                    const muteLog = auditLogs.entries.first();
                    if (muteLog && muteLog.target.id === userId && (Date.now() - muteLog.createdTimestamp) < 5000) {
                        executor = muteLog.executor.tag;
                        executorId = muteLog.executor.id;
                        executorAvatar = muteLog.executor.displayAvatarURL({ dynamic: true });
                    }
                } catch (error) {
                    // Ignore audit log errors
                }

                // Only log if there's an executor (someone else muted them)
                if (executor) {
                    await Logger.log(newState.serverMute ? 'VOICE_MUTE' : 'VOICE_UNMUTE', null, {
                        user,
                        userId,
                        userAvatar,
                        channel: newState.channel.name,
                        executor: executor,
                        executorId: executorId,
                        executorAvatar: executorAvatar
                    });
                }
            }

            // Self mute - SKIP LOGGING (as requested)
            // if (oldState.selfMute !== newState.selfMute) {
            //     // Not logged per user request
            // }

            // Server deafen (only log if done by another user)
            if (oldState.serverDeaf !== newState.serverDeaf) {
                // Try to get who deafened/undeafened the user from audit logs
                let executor = null;
                let executorId = null;
                let executorAvatar = null;
                try {
                    const auditLogs = await oldState.guild.fetchAuditLogs({
                        limit: 1,
                        type: 24 // MEMBER_UPDATE
                    });
                    const deafLog = auditLogs.entries.first();
                    if (deafLog && deafLog.target.id === userId && (Date.now() - deafLog.createdTimestamp) < 5000) {
                        executor = deafLog.executor.tag;
                        executorId = deafLog.executor.id;
                        executorAvatar = deafLog.executor.displayAvatarURL({ dynamic: true });
                    }
                } catch (error) {
                    // Ignore audit log errors
                }

                // Only log if there's an executor (someone else deafened them)
                if (executor) {
                    await Logger.log(newState.serverDeaf ? 'VOICE_DEAF' : 'VOICE_UNDEAF', null, {
                        user,
                        userId,
                        userAvatar,
                        channel: newState.channel.name,
                        executor: executor,
                        executorId: executorId,
                        executorAvatar: executorAvatar
                    });
                }
            }

            // Self deafen - SKIP LOGGING (as requested)
            // if (oldState.selfDeaf !== newState.selfDeaf) {
            //     // Not logged per user request
            // }

            // Streaming status
            if (oldState.streaming !== newState.streaming) {
                await Logger.log(newState.streaming ? 'VOICE_STREAM_START' : 'VOICE_STREAM_STOP', null, {
                    user,
                    userId,
                    userAvatar,
                    channel: newState.channel.name
                });
            }

            // Video status
            if (oldState.selfVideo !== newState.selfVideo) {
                await Logger.log(newState.selfVideo ? 'VOICE_VIDEO_START' : 'VOICE_VIDEO_STOP', null, {
                    user,
                    userId,
                    userAvatar,
                    channel: newState.channel.name
                });
            }
        }
    },
};
