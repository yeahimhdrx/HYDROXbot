const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const InviteTracker = require('../utils/inviteTracker');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invites')
        .setDescription('Check invite statistics')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('User to check invites for (optional)')
                .setRequired(false)
        ),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const member = await interaction.guild.members.fetch(targetUser.id);

        const stats = InviteTracker.getInviteStats(targetUser.id);
        const nextRole = InviteTracker.getNextRole(stats.validInvites);
        const earnedRoles = InviteTracker.getRolesForInvites(stats.validInvites);

        const embed = new EmbedBuilder()
            .setColor('#00d4ff')
            .setAuthor({ 
                name: `${targetUser.tag}'s Invite Statistics`,
                iconURL: targetUser.displayAvatarURL({ dynamic: true })
            })
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
                { 
                    name: '📊 Total Invites', 
                    value: `\`${stats.totalInvites}\``, 
                    inline: true 
                },
                { 
                    name: '✅ Valid Invites', 
                    value: `\`${stats.validInvites}\``, 
                    inline: true 
                },
                { 
                    name: '📤 Left Server', 
                    value: `\`${stats.leftInvites}\``, 
                    inline: true 
                }
            );

        // Show earned roles
        if (earnedRoles.length > 0) {
            const rolesList = earnedRoles.map(r => `✅ **${r.name}** (${r.invites} invites)`).join('\n');
            embed.addFields({
                name: '🎭 Earned Roles',
                value: rolesList,
                inline: false
            });
        }

        // Show next role
        if (nextRole) {
            const progress = (stats.validInvites / nextRole.invites) * 100;
            const remaining = nextRole.invites - stats.validInvites;
            const progressBar = this.createProgressBar(progress);
            
            embed.addFields({
                name: `🎯 Next Role: ${nextRole.name}`,
                value: `${progressBar} **${progress.toFixed(1)}%**\n\`${stats.validInvites}\` / \`${nextRole.invites}\` invites • **${remaining}** more needed`,
                inline: false
            });
        } else {
            embed.addFields({
                name: '👑 Maximum Rank',
                value: 'You have achieved the highest invite rank! 🔥',
                inline: false
            });
        }

        // Show all available roles
        const allRoles = InviteTracker.roles.map(r => {
            const hasRole = stats.validInvites >= r.invites;
            const emoji = hasRole ? '✅' : '🔒';
            return `${emoji} **${r.name}** - ${r.invites} invites`;
        }).join('\n');

        embed.addFields({
            name: '📋 All Invite Roles',
            value: allRoles,
            inline: false
        });

        embed.setFooter({ 
            text: 'Keep inviting to unlock more roles!',
            iconURL: interaction.guild.iconURL({ dynamic: true })
        })
        .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    createProgressBar(percentage) {
        const filled = Math.round(percentage / 10);
        const empty = 10 - filled;
        const filledBar = '█'.repeat(filled);
        const emptyBar = '░'.repeat(empty);
        return `${filledBar}${emptyBar}`;
    }
};
