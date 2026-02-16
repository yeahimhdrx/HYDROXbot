const config = require('../config');
const VoiceTracker = require('./voiceTracker');

class RoleManager {
    // Check and grant roles for a user
    static async checkAndGrantRoles(member) {
        const userId = member.user.id;
        const voiceHours = VoiceTracker.getVoiceHours(userId);
        const hasTag = VoiceTracker.hasTag(userId);
        
        const rolesToGrant = [];

        for (const roleConfig of config.roles) {
            // Check if user meets requirements
            if (voiceHours >= roleConfig.hours) {
                if (roleConfig.requiresTag && !hasTag) {
                    continue; // Skip if tag is required but user doesn't have it
                }

                // Find the role in the guild
                const role = member.guild.roles.cache.find(r => r.name === roleConfig.name);
                
                if (role && !member.roles.cache.has(role.id)) {
                    // Check if we already granted this role before
                    if (!VoiceTracker.wasRoleGranted(userId, roleConfig.name)) {
                        rolesToGrant.push({ role, config: roleConfig });
                    }
                }
            }
        }

        // Grant roles and send DMs
        const Logger = require('./logger');
        for (const { role, config: roleConfig } of rolesToGrant) {
            try {
                await member.roles.add(role);
                VoiceTracker.markRoleGranted(userId, roleConfig.name);
                
                // Send congratulations DM
                try {
                    await member.send(roleConfig.message);
                } catch (dmError) {
                    console.log(`Could not send DM to ${member.user.tag}`);
                }
                
                // Log to channel
                await Logger.log('ROLE_GRANTED', null, {
                    user: member.user.tag,
                    role: roleConfig.name,
                    hours: voiceHours.toFixed(1),
                    hasTag: hasTag
                });
                
                console.log(`✅ Granted ${roleConfig.name} to ${member.user.tag}`);
            } catch (error) {
                console.error(`Error granting role ${roleConfig.name} to ${member.user.tag}:`, error);
            }
        }

        return rolesToGrant.length;
    }

    // Check all members in guild
    static async checkAllMembers(guild) {
        const members = await guild.members.fetch();
        let totalGranted = 0;

        for (const [, member] of members) {
            if (member.user.bot) continue;
            const granted = await this.checkAndGrantRoles(member);
            totalGranted += granted;
        }

        return totalGranted;
    }

    // Get user's eligible roles
    static getEligibleRoles(userId, hasTag) {
        const voiceHours = VoiceTracker.getVoiceHours(userId);
        
        return config.roles.filter(roleConfig => {
            if (voiceHours < roleConfig.hours) return false;
            if (roleConfig.requiresTag && !hasTag) return false;
            return true;
        });
    }
}

module.exports = RoleManager;
