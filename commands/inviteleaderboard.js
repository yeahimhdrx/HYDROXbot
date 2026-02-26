const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const InviteTracker = require('../utils/inviteTracker');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inviteleaderboard')
        .setDescription('View the top inviters in the server')
        .addIntegerOption(option =>
            option
                .setName('limit')
                .setDescription('Number of users to show (default: 10)')
                .setRequired(false)
                .setMinValue(5)
                .setMaxValue(25)
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const limit = interaction.options.getInteger('limit') || 10;
        const leaderboard = await InviteTracker.getLeaderboard(limit);

        if (leaderboard.length === 0) {
            return interaction.editReply({
                content: '📊 No invite data available yet. Start inviting members to appear on the leaderboard!'
            });
        }

        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('🏆 Invite Leaderboard')
            .setDescription('Top inviters in the server!')
            .setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 256 }))
            .setTimestamp()
            .setFooter({ 
                text: `${interaction.guild.name} • Invite System`,
                iconURL: interaction.guild.iconURL({ dynamic: true })
            });

        // Build leaderboard
        let description = '';
        const medals = ['🥇', '🥈', '🥉'];

        for (let i = 0; i < leaderboard.length; i++) {
            const entry = leaderboard[i];
            const medal = i < 3 ? medals[i] : `**${i + 1}.**`;
            
            try {
                const user = await interaction.client.users.fetch(entry.user_id);
                const earnedRoles = InviteTracker.getRolesForInvites(entry.valid_invites);
                const highestRole = earnedRoles.length > 0 ? earnedRoles[earnedRoles.length - 1].name : 'None';
                
                description += `${medal} **${user.tag}**\n`;
                description += `   └ ✅ ${entry.valid_invites} valid • 📊 ${entry.total_invites} total • 🎭 ${highestRole}\n\n`;
            } catch (error) {
                description += `${medal} Unknown User (${entry.user_id})\n`;
                description += `   └ ✅ ${entry.valid_invites} valid • 📊 ${entry.total_invites} total\n\n`;
            }
        }

        embed.setDescription(description);

        // Add role milestones
        const milestones = InviteTracker.roles.map(r => `**${r.name}** - ${r.invites} invites`).join('\n');
        embed.addFields({
            name: '🎯 Role Milestones',
            value: milestones,
            inline: false
        });

        await interaction.editReply({ embeds: [embed] });
    },
};
