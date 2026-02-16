const VoiceTracker = require('../utils/voiceTracker');
const RoleManager = require('../utils/roleManager');
const Logger = require('../utils/logger');

module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState) {
        const userId = newState.member.user.id;
        
        // User joined a voice channel
        if (!oldState.channelId && newState.channelId) {
            VoiceTracker.joinVoice(userId);
            
            await Logger.log('VOICE_JOIN', null, {
                user: newState.member.user.tag
            });
        }
        
        // User left a voice channel
        if (oldState.channelId && !newState.channelId) {
            const sessionMinutes = VoiceTracker.leaveVoice(userId);
            const totalHours = VoiceTracker.getVoiceHours(userId);
            
            await Logger.log('VOICE_LEAVE', null, {
                user: newState.member.user.tag,
                sessionMinutes: sessionMinutes,
                totalHours: totalHours.toFixed(1)
            });
            
            // Check for role eligibility after leaving
            await RoleManager.checkAndGrantRoles(newState.member);
        }
        
        // User switched channels
        if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
            // Update time for old channel and start tracking new channel
            VoiceTracker.leaveVoice(userId);
            VoiceTracker.joinVoice(userId);
        }
    },
};
