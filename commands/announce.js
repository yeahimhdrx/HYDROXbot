const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('announce')
        .setDescription('Send a professional announcement (Admin only)')
        .addStringOption(option =>
            option
                .setName('title')
                .setDescription('Announcement title')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('message')
                .setDescription('Announcement message')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('type')
                .setDescription('Announcement type')
                .setRequired(false)
                .addChoices(
                    { name: '📢 General', value: 'general' },
                    { name: '🎉 Event', value: 'event' },
                    { name: '⚠️ Important', value: 'important' },
                    { name: '🔔 Update', value: 'update' },
                    { name: '🎮 Gaming', value: 'gaming' },
                    { name: '🎁 Giveaway', value: 'giveaway' }
                )
        )
        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('Channel to send announcement (optional, defaults to current channel)')
                .setRequired(false)
        )
        .addBooleanOption(option =>
            option
                .setName('ping_everyone')
                .setDescription('Ping @everyone (default: false)')
                .setRequired(false)
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

        const title = interaction.options.getString('title');
        const message = interaction.options.getString('message');
        const type = interaction.options.getString('type') || 'general';
        const targetChannel = interaction.options.getChannel('channel') || interaction.channel;
        const pingEveryone = interaction.options.getBoolean('ping_everyone') || false;

        // Check if target channel is a text channel
        if (!targetChannel.isTextBased()) {
            return interaction.reply({
                content: '❌ The selected channel is not a text channel!',
                ephemeral: true
            });
        }

        // Check permissions
        const permissions = targetChannel.permissionsFor(interaction.guild.members.me);
        if (!permissions.has([PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks])) {
            return interaction.reply({
                content: `❌ I don't have permission to send messages in ${targetChannel}!`,
                ephemeral: true
            });
        }

        if (pingEveryone && !permissions.has(PermissionFlagsBits.MentionEveryone)) {
            return interaction.reply({
                content: `❌ I don't have permission to mention @everyone in ${targetChannel}!`,
                ephemeral: true
            });
        }

        // Define announcement styles
        const styles = {
            general: {
                color: '#00d4ff',
                emoji: '📢',
                label: 'ANNOUNCEMENT'
            },
            event: {
                color: '#9b59b6',
                emoji: '🎉',
                label: 'EVENT ANNOUNCEMENT'
            },
            important: {
                color: '#e74c3c',
                emoji: '⚠️',
                label: 'IMPORTANT ANNOUNCEMENT'
            },
            update: {
                color: '#3498db',
                emoji: '🔔',
                label: 'UPDATE'
            },
            gaming: {
                color: '#2ecc71',
                emoji: '🎮',
                label: 'GAMING ANNOUNCEMENT'
            },
            giveaway: {
                color: '#f1c40f',
                emoji: '🎁',
                label: 'GIVEAWAY'
            }
        };

        const style = styles[type];

        try {
            // Create professional announcement embed
            const embed = new EmbedBuilder()
                .setColor(style.color)
                .setAuthor({ 
                    name: `${style.emoji} ${style.label}`,
                    iconURL: interaction.guild.iconURL({ dynamic: true })
                })
                .setTitle(title)
                .setDescription(message)
                .addFields({
                    name: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
                    value: '\u200b',
                    inline: false
                })
                .setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 256 }))
                .setFooter({ 
                    text: `${interaction.guild.name} • Posted by ${interaction.user.tag}`,
                    iconURL: interaction.user.displayAvatarURL({ dynamic: true })
                })
                .setTimestamp();

            // Send announcement
            const content = pingEveryone ? '@everyone' : null;
            await targetChannel.send({ 
                content: content,
                embeds: [embed] 
            });

            // Confirm to admin
            await interaction.reply({
                content: `✅ Announcement sent to ${targetChannel}!${pingEveryone ? ' (@everyone pinged)' : ''}`,
                ephemeral: true
            });

            console.log(`[Announce] ${interaction.user.tag} sent ${type} announcement in #${targetChannel.name}: "${title}"`);
        } catch (error) {
            console.error('[Announce] Error sending announcement:', error);
            await interaction.reply({
                content: `❌ Failed to send announcement: ${error.message}`,
                ephemeral: true
            });
        }
    },
};
