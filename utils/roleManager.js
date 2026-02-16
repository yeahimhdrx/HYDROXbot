const config = require('../config');
const VoiceTracker = require('./voiceTracker');
const db = require('./database');
const { EmbedBuilder } = require('discord.js');
const { formatTime } = require('./timeFormatter');

class RoleManager {
    // Check if user was already reminded about a specific role
    static wasReminded(userId, roleName) {
        const stmt = db.prepare('SELECT * FROM tag_reminders WHERE user_id = ? AND role_name = ?');
        return stmt.get(userId, roleName) !== undefined;
    }

    // Mark that user was reminded about a role
    static markReminded(userId, roleName) {
        const stmt = db.prepare('INSERT OR IGNORE INTO tag_reminders (user_id, role_name) VALUES (?, ?)');
        stmt.run(userId, roleName);
    }

    // Send tag reminder DM for roles that require tag
    static async sendTagReminder(member, roleConfig, voiceHours) {
        const userId = member.user.id;
        
        // Check if already reminded for this role
        if (this.wasReminded(userId, roleConfig.name)) {
            return;
        }

        const embed = new EmbedBuilder()
            .setColor('#f39c12')
            .setTitle('🏷️ HYDROX Tag Required!')
            .setDescription(`Hey ${member.user.username}! Great news! 🎉`)
            .addFields(
                { name: '✨ Achievement Unlocked', value: `You've reached **${formatTime(voiceHours)}** of voice activity!`, inline: false },
                { name: '🎭 Role Available', value: `**${roleConfig.name}**`, inline: true },
                { name: '⏱️ Required Time', value: `${roleConfig.hours}h ✅`, inline: true },
                { name: '\u200B', value: '\u200B', inline: false },
                { name: '🏷️ Next Step', value: `To unlock the **${roleConfig.name}** role, please add the **[HDRX]** tag to your Discord username!`, inline: false },
                { name: '📝 How to Add Tag', value: '1. Click on the server name\n2. Select "Edit Server Profile"\n3. Add **[HDRX]** to your nickname\n4. Let staff know you\'ve added it!', inline: false }
            )
            .setFooter({ text: 'HYDROX Community • Keep being awesome!' })
            .setTimestamp();

        try {
            await member.send({ embeds: [embed] });
            this.markReminded(userId, roleConfig.name);
            console.log(`📨 Sent tag reminder to ${member.user.tag} for ${roleConfig.name}`);
            
            // Log to channel
            const Logger = require('./logger');
            await Logger.log('TAG_REMINDER_SENT', null, {
                user: member.user.tag,
                userId: member.user.id,
                userAvatar: member.user.displayAvatarURL({ dynamic: true }),
                role: roleConfig.name,
                hours: voiceHours
            });
        } catch (error) {
            console.log(`Could not send tag reminder DM to ${member.user.tag}`);
        }
    }

    // Create beautiful celebration embed for role grant
    static createRoleCelebrationEmbed(member, roleConfig, voiceHours) {
        const { EmbedBuilder } = require('discord.js');
        const { formatTime } = require('./timeFormatter');
        
        // Role-specific colors and themes
        const roleThemes = {
            '𝐅𝐑𝐈𝐄𝐍𝐃𝐒': { color: '#57f287', emoji: '🎉', tier: 'Bronze' },
            '𝐀𝐒𝐂𝐄𝐍𝐃𝐀𝐍𝐓': { color: '#5865f2', emoji: '🌟', tier: 'Silver' },
            '𝐄𝐏𝐈𝐂': { color: '#9b59b6', emoji: '⚡', tier: 'Gold' },
            '𝐋𝐄𝐆𝐄𝐍𝐃': { color: '#f1c40f', emoji: '🏆', tier: 'Platinum' },
            '𝐄𝐋𝐈𝐓𝐄': { color: '#e91e63', emoji: '💎', tier: 'Diamond' },
            '𝐂𝐇𝐀𝐌𝐏𝐈𝐎𝐍': { color: '#ff6b6b', emoji: '👑', tier: 'Master' },
            '𝐌𝐘𝐓𝐇𝐈𝐂': { color: '#ff0000', emoji: '🔥', tier: 'Mythic' }
        };

        const theme = roleThemes[roleConfig.name] || { color: '#5865f2', emoji: '🎊', tier: 'Special' };
        
        const embed = new EmbedBuilder()
            .setColor(theme.color)
            .setTitle(`${theme.emoji} CONGRATULATIONS ${theme.emoji}`)
            .setDescription(
                `**${member.user.username}**, you've achieved something incredible!\n\n` +
                `You've earned the **${roleConfig.name}** role in **HYDROX Community**!`
            )
            .addFields(
                {
                    name: '🎯 Your Achievement',
                    value: 
                        `You've spent **${formatTime(voiceHours)}** with us!\n` +
                        `That's **${roleConfig.hours} hours** of dedication and friendship.`,
                    inline: false
                },
                {
                    name: '⭐ Tier',
                    value: `**${theme.tier}**`,
                    inline: true
                },
                {
                    name: '📊 Voice Time',
                    value: `**${formatTime(voiceHours)}**`,
                    inline: true
                },
                {
                    name: '🏅 Role',
                    value: `**${roleConfig.name}**`,
                    inline: true
                }
            )
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
            .setImage(member.guild.iconURL({ dynamic: true, size: 512 }))
            .setFooter({ 
                text: `HYDROX Community • You're awesome!`,
                iconURL: member.guild.iconURL({ dynamic: true })
            })
            .setTimestamp();

        // Add thank you message
        embed.addFields({
            name: '💬 Thank You!',
            value: 
                `Thank you for being an **amazing part** of our community!\n\n` +
                `Every moment you've spent with us has made HYDROX better.\n` +
                `Your presence and energy make this community special.\n\n` +
                `We're grateful for your time and can't wait to see you reach even greater heights!`,
            inline: false
        });

        // Add special message for tag-required roles
        if (roleConfig.requiresTag) {
            embed.addFields({
                name: '🏷️ HDRX Tag Holder',
                value: 
                    `You're proudly representing HYDROX with the **[HDRX]** tag!\n` +
                    `This shows your dedication to our community.\n` +
                    `Thank you for being a true HYDROX member!`,
                inline: false
            });
        }

        return embed;
    }

    // Check and grant roles for a user
    static async checkAndGrantRoles(member) {
        const userId = member.user.id;
        const voiceHours = VoiceTracker.getVoiceHours(userId);
        const hasTag = VoiceTracker.hasTag(userId);
        
        const rolesToGrant = [];
        const tagRequiredRoles = [];

        for (const roleConfig of config.roles) {
            // Check if user meets requirements
            if (voiceHours >= roleConfig.hours) {
                if (roleConfig.requiresTag && !hasTag) {
                    // User has the hours but not the tag - send reminder
                    tagRequiredRoles.push(roleConfig);
                    continue;
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

        // Send tag reminders for eligible roles that require tag
        for (const roleConfig of tagRequiredRoles) {
            await this.sendTagReminder(member, roleConfig, voiceHours);
        }

        // Grant roles and send DMs
        const Logger = require('./logger');
        for (const { role, config: roleConfig } of rolesToGrant) {
            try {
                await member.roles.add(role);
                VoiceTracker.markRoleGranted(userId, roleConfig.name);
                
                // Send beautiful celebration DM
                try {
                    const celebrationEmbed = this.createRoleCelebrationEmbed(member, roleConfig, voiceHours);
                    await member.send({ embeds: [celebrationEmbed] });
                } catch (dmError) {
                    console.log(`Could not send DM to ${member.user.tag}`);
                }
                
                // Log to channel
                await Logger.log('ROLE_GRANTED', null, {
                    user: member.user.tag,
                    userId: member.user.id,
                    userAvatar: member.user.displayAvatarURL({ dynamic: true }),
                    role: roleConfig.name,
                    hours: voiceHours,
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
