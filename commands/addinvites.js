const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const InviteTracker = require('../utils/inviteTracker');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addinvites')
        .setDescription('Add invites to a user (Admin only - for users who invited before this system)')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('User to add invites to')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('amount')
                .setDescription('Number of invites to add')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(1000)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),

    async execute(interaction) {
        // Double-check administrator permission
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                content: '❌ You must be an administrator to use this command!',
                ephemeral: true
            });
        }

        // Defer reply immediately to prevent timeout
        await interaction.deferReply({ ephemeral: true });

        const targetUser = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');
        const member = await interaction.guild.members.fetch(targetUser.id);

        // Get current stats
        const beforeStats = await InviteTracker.getInviteStats(targetUser.id);

        // Add invites
        const newTotal = await InviteTracker.addInvites(targetUser.id, amount);

        // Check and grant roles
        const grantedRoles = await InviteTracker.checkAndGrantRoles(member, newTotal);

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('✅ Invites Added Successfully')
            .setDescription(`Added **${amount}** invites to ${targetUser.tag}`)
            .addFields(
                { name: '👤 User', value: `<@${targetUser.id}>`, inline: true },
                { name: '➕ Added', value: `\`${amount}\``, inline: true },
                { name: '📊 New Total', value: `\`${newTotal}\``, inline: true },
                { name: '📈 Previous Total', value: `\`${beforeStats.validInvites}\``, inline: true },
                { name: '👮 Added By', value: `${interaction.user.tag}`, inline: true },
                { name: '\u200b', value: '\u200b', inline: true }
            )
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
            .setTimestamp()
            .setFooter({ text: 'Invite Management System' });

        // Show granted roles
        if (grantedRoles.length > 0) {
            const rolesList = grantedRoles.map(({ role, config }) => 
                `✅ **${config.name}** (${config.invites} invites required)`
            ).join('\n');
            
            embed.addFields({
                name: '🎭 Roles Granted',
                value: rolesList,
                inline: false
            });

            // Send celebration messages
            const celebrationChannelId = process.env.INVITE_CELEBRATION_CHANNEL_ID || '1409519478391181362';
            const celebrationChannel = interaction.guild.channels.cache.get(celebrationChannelId);
            
            if (celebrationChannel) {
                for (const { role, config } of grantedRoles) {
                    const nextRole = InviteTracker.getNextRole(newTotal);
                    
                    const celebrationData = {
                        userId: targetUser.id,
                        userAvatar: targetUser.displayAvatarURL({ dynamic: true }),
                        roleName: config.name,
                        roleId: role.id,
                        invites: newTotal,
                        required: config.invites,
                        nextRole: nextRole,
                        guildIcon: interaction.guild.iconURL({ dynamic: true })
                    };
                    
                    const Logger = require('../utils/logger');
                    await Logger.sendToChannel(celebrationChannelId, 'INVITE_ROLE_EARNED', null, celebrationData);
                    
                    // Tag everyone, member role, and the user
                    const memberRoleId = '587372813082689559'; // @𝐌𝐄𝐌𝐁𝐄𝐑 role ID
                    await celebrationChannel.send({
                        content: `@everyone <@&${memberRoleId}> <@${targetUser.id}> <@&${role.id}>`
                    });
                    
                    // Send DM to the user
                    try {
                        const dmEmbed = this.createCelebrationEmbed(celebrationData, interaction.guild);
                        await targetUser.send({ embeds: [dmEmbed] });
                        console.log(`[AddInvites] Sent celebration DM to ${targetUser.tag}`);
                    } catch (dmError) {
                        console.log(`[AddInvites] Could not send DM to ${targetUser.tag} (DMs might be closed)`);
                    }
                }
            }
        } else {
            embed.addFields({
                name: '🎭 Roles Granted',
                value: 'No new roles granted (user may already have them)',
                inline: false
            });
        }

        await interaction.editReply({ embeds: [embed] });

        console.log(`[AddInvites] ${interaction.user.tag} added ${amount} invites to ${targetUser.tag} (New total: ${newTotal})`);
    },

    // Helper function to create celebration embed for DM
    createCelebrationEmbed(data, guild) {
        const { EmbedBuilder } = require('discord.js');
        
        const roleEmojis = {
            '𝐒𝐂𝐎𝐔𝐓': '🔍',
            '𝐑𝐄𝐂𝐑𝐔𝐈𝐓𝐄𝐑': '📢',
            '𝐀𝐌𝐁𝐀𝐒𝐒𝐀𝐃𝐎𝐑': '🌟',
            '𝐈𝐍𝐅𝐋𝐔𝐄𝐍𝐂𝐄𝐑': '💎',
            '𝐏𝐀𝐑𝐓𝐍𝐄𝐑': '👑',
            '𝐒𝐎𝐕𝐄𝐑𝐄𝐈𝐆𝐍': '⚡'
        };

        const roleColors = {
            '𝐒𝐂𝐎𝐔𝐓': '#00d4ff',
            '𝐑𝐄𝐂𝐑𝐔𝐈𝐓𝐄𝐑': '#7c3aed',
            '𝐀𝐌𝐁𝐀𝐒𝐒𝐀𝐃𝐎𝐑': '#ec4899',
            '𝐈𝐍𝐅𝐋𝐔𝐄𝐍𝐂𝐄𝐑': '#f59e0b',
            '𝐏𝐀𝐑𝐓𝐍𝐄𝐑': '#ef4444',
            '𝐒𝐎𝐕𝐄𝐑𝐄𝐈𝐆𝐍': '#FFD700'
        };

        const emoji = roleEmojis[data.roleName] || '🎉';
        const color = roleColors[data.roleName] || '#00d4ff';

        // Create progress bar for next role
        let progressBar = '';
        if (data.nextRole) {
            const progress = (data.invites / data.nextRole.invites) * 100;
            const filled = Math.round(progress / 5);
            const empty = 20 - filled;
            progressBar = '▰'.repeat(filled) + '▱'.repeat(empty);
        }

        const embed = new EmbedBuilder()
            .setColor(color)
            .setAuthor({ 
                name: '🔔 NEW INVITE MILESTONE ACHIEVED!',
                iconURL: data.userAvatar
            })
            .setTitle(`${emoji} **CONGRATULATIONS!** ${emoji}`)
            .setDescription(
                `You have reached **${data.invites} invites** and earned\n` +
                `the prestigious **${data.roleName}** role!`
            )
            .addFields(
                {
                    name: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
                    value: '\u200b',
                    inline: false
                },
                {
                    name: `${emoji} Role Earned`,
                    value: `**${data.roleName}**`,
                    inline: true
                },
                {
                    name: '📊 Total Invites',
                    value: `\`${data.invites}\``,
                    inline: true
                },
                {
                    name: '🎯 Required',
                    value: `\`${data.required}\``,
                    inline: true
                },
                {
                    name: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
                    value: '\u200b',
                    inline: false
                }
            )
            .setThumbnail(data.userAvatar)
            .setImage('https://i.postimg.cc/ncKDwxkD/image.jpg')
            .setFooter({ 
                text: `⚡ ${guild.name} • Invite Rewards System • Today at ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`,
                iconURL: data.guildIcon 
            })
            .setTimestamp();

        // Add next milestone or max rank
        if (data.nextRole) {
            const remaining = data.nextRole.invites - data.invites;
            embed.addFields({
                name: `🎯 Next Milestone: ${data.nextRole.name}`,
                value: `${progressBar}\n\`${data.invites}\` / \`${data.nextRole.invites}\` invites • **${remaining}** more to go!`,
                inline: false
            });
        } else {
            embed.addFields({
                name: '👑 Maximum Rank Achieved!',
                value: 'You have reached the highest invite rank! You are a legend! 🔥',
                inline: false
            });
        }

        embed.addFields({
            name: '\u200b',
            value: 'Thank you for growing our community! 💪\nKeep inviting to unlock even more exclusive roles!',
            inline: false
        });

        return embed;
    }
};
