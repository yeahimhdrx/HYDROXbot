const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const VoiceTracker = require('../utils/voiceTracker');
const RoleManager = require('../utils/roleManager');
const config = require('../config');
const { formatTime } = require('../utils/timeFormatter');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Check your voice activity stats and role progress')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to check stats for (admin only)')
                .setRequired(false)),
    async execute(interaction) {
        // Defer reply to prevent timeout
        await interaction.deferReply({ ephemeral: true });
        
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const userId = targetUser.id;
        
        // Only allow checking other users if admin
        if (targetUser.id !== interaction.user.id && !interaction.member.permissions.has('Administrator')) {
            return interaction.editReply({ content: 'You can only check your own stats!' });
        }

        const voiceHours = VoiceTracker.getVoiceHours(userId);
        const hasTag = VoiceTracker.hasTag(userId);
        const eligibleRoles = RoleManager.getEligibleRoles(userId, hasTag);

        // Find next role
        let nextRole = null;
        for (const roleConfig of config.roles) {
            if (voiceHours < roleConfig.hours || (roleConfig.requiresTag && !hasTag)) {
                nextRole = roleConfig;
                break;
            }
        }

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle(`📊 HYDROX Stats for ${targetUser.username}`)
            .addFields(
                { name: '🎤 Voice Time', value: formatTime(voiceHours), inline: true },
                { name: '🏷️ Tag Status', value: hasTag ? '✅ Using HDRX' : '❌ No HDRX tag', inline: true },
                { name: '⭐ Eligible Roles', value: eligibleRoles.length > 0 ? eligibleRoles.map(r => r.name).join(', ') : 'None yet', inline: false }
            )
            .setTimestamp();

        if (nextRole) {
            const hoursNeeded = nextRole.hours - voiceHours;
            const tagNeeded = nextRole.requiresTag && !hasTag ? ' + HDRX tag required' : '';
            embed.addFields({
                name: '🎯 Next Role',
                value: `**${nextRole.name}** - ${formatTime(hoursNeeded)} remaining${tagNeeded}`,
                inline: false
            });
        } else {
            embed.addFields({
                name: '🏆 Status',
                value: 'You\'ve reached the maximum rank!',
                inline: false
            });
        }

        await interaction.editReply({ embeds: [embed] });
    },
};
