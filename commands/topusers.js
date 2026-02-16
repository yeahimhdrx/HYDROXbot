const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../utils/database');
const { formatTime } = require('../utils/timeFormatter');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('topusers')
        .setDescription('View the top 30 most active members by voice time')
        .addIntegerOption(option =>
            option.setName('page')
                .setDescription('Page number (1-3)')
                .setMinValue(1)
                .setMaxValue(3)
                .setRequired(false)),
    async execute(interaction) {
        await interaction.deferReply();

        const page = interaction.options.getInteger('page') || 1;
        const itemsPerPage = 10;
        const offset = (page - 1) * itemsPerPage;

        // Get top users from database
        const stmt = db.prepare(`
            SELECT user_id, total_minutes, has_tag 
            FROM voice_activity 
            WHERE total_minutes > 0
            ORDER BY total_minutes DESC 
            LIMIT ? OFFSET ?
        `);
        const topUsers = stmt.all(itemsPerPage, offset);

        if (topUsers.length === 0) {
            return interaction.editReply({ 
                content: page === 1 
                    ? '📊 No voice activity recorded yet!' 
                    : '📊 No more users on this page. Try a lower page number.',
                ephemeral: true 
            });
        }

        // Get total count
        const countStmt = db.prepare('SELECT COUNT(*) as count FROM voice_activity WHERE total_minutes > 0');
        const totalCount = countStmt.get().count;
        const totalPages = Math.ceil(totalCount / itemsPerPage);

        // Build leaderboard entries
        const entries = [];
        for (let i = 0; i < topUsers.length; i++) {
            const rank = offset + i + 1;
            const userData = topUsers[i];
            const hours = userData.total_minutes / 60;
            const hasTag = userData.has_tag === 1;

            // Try to get user from guild
            let userMention = `<@${userData.user_id}>`;
            try {
                await interaction.guild.members.fetch(userData.user_id);
            } catch (error) {
                userMention = `*User Left Server*`;
            }

            // Medal for top 3
            let rankEmoji;
            if (rank === 1) rankEmoji = '🥇';
            else if (rank === 2) rankEmoji = '🥈';
            else if (rank === 3) rankEmoji = '🥉';
            else rankEmoji = `**#${rank}**`;

            // Tag emoji
            const tagEmoji = hasTag ? '🏷️' : '';

            entries.push({
                rank: rankEmoji,
                user: userMention,
                time: formatTime(hours),
                tag: tagEmoji
            });
        }

        // Create clean description
        let description = '';
        for (const entry of entries) {
            description += `${entry.rank} ${entry.user} ${entry.tag}\n`;
            description += `└ ⏱️ **${entry.time}**\n\n`;
        }

        // Create embed
        const embed = new EmbedBuilder()
            .setColor('#5865f2')
            .setTitle('🏆 HYDROX Voice Activity Leaderboard')
            .setDescription(description)
            .addFields(
                { 
                    name: '📊 Statistics', 
                    value: `**${totalCount}** Active Members`, 
                    inline: true 
                },
                { 
                    name: '📄 Page', 
                    value: `**${page}** / **${totalPages}**`, 
                    inline: true 
                },
                { 
                    name: '🏷️ Legend', 
                    value: `🏷️ = HDRX Tag`, 
                    inline: true 
                }
            )
            .setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 256 }))
            .setFooter({ 
                text: `Showing ranks ${offset + 1}-${offset + topUsers.length} • Page ${page}/${totalPages}`,
                iconURL: interaction.client.user.displayAvatarURL()
            })
            .setTimestamp();

        // Add navigation hint
        if (page < totalPages) {
            embed.addFields({
                name: '➡️ Next Page',
                value: `Use \`/topusers page:${page + 1}\` to see more`,
                inline: false
            });
        }

        await interaction.editReply({ embeds: [embed] });
    },
};
