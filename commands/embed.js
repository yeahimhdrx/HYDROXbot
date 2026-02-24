const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embed')
        .setDescription('Send an embed message as the bot (Admin only)')
        .addStringOption(option =>
            option
                .setName('title')
                .setDescription('Embed title')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('description')
                .setDescription('Embed description')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('color')
                .setDescription('Embed color (hex code like #00d4ff or name like blue, red, green)')
                .setRequired(false)
        )
        .addStringOption(option =>
            option
                .setName('image')
                .setDescription('Image URL (optional)')
                .setRequired(false)
        )
        .addStringOption(option =>
            option
                .setName('thumbnail')
                .setDescription('Thumbnail URL (optional)')
                .setRequired(false)
        )
        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('Channel to send the embed in (optional, defaults to current channel)')
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
        const description = interaction.options.getString('description');
        const colorInput = interaction.options.getString('color');
        const imageUrl = interaction.options.getString('image');
        const thumbnailUrl = interaction.options.getString('thumbnail');
        const targetChannel = interaction.options.getChannel('channel') || interaction.channel;

        // Check if target channel is a text channel
        if (!targetChannel.isTextBased()) {
            return interaction.reply({
                content: '❌ The selected channel is not a text channel!',
                ephemeral: true
            });
        }

        // Check if bot has permission to send messages in target channel
        const permissions = targetChannel.permissionsFor(interaction.guild.members.me);
        if (!permissions.has([PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks])) {
            return interaction.reply({
                content: `❌ I don't have permission to send embeds in ${targetChannel}!`,
                ephemeral: true
            });
        }

        // Parse color
        let color = '#00d4ff'; // Default cyan
        if (colorInput) {
            const colorMap = {
                'blue': '#3498db',
                'red': '#e74c3c',
                'green': '#2ecc71',
                'yellow': '#f1c40f',
                'purple': '#9b59b6',
                'pink': '#e91e63',
                'orange': '#e67e22',
                'cyan': '#00d4ff',
                'gold': '#FFD700',
                'black': '#000000',
                'white': '#ffffff'
            };

            if (colorInput.startsWith('#')) {
                color = colorInput;
            } else {
                color = colorMap[colorInput.toLowerCase()] || '#00d4ff';
            }
        }

        try {
            // Create embed
            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(description)
                .setColor(color)
                .setTimestamp()
                .setFooter({ 
                    text: interaction.guild.name,
                    iconURL: interaction.guild.iconURL({ dynamic: true })
                });

            // Add optional fields
            if (imageUrl) {
                embed.setImage(imageUrl);
            }

            if (thumbnailUrl) {
                embed.setThumbnail(thumbnailUrl);
            }

            // Send the embed
            await targetChannel.send({ embeds: [embed] });

            // Confirm to the admin
            await interaction.reply({
                content: `✅ Embed sent to ${targetChannel}!`,
                ephemeral: true
            });

            console.log(`[Embed] ${interaction.user.tag} sent embed as bot in #${targetChannel.name}: "${title}"`);
        } catch (error) {
            console.error('[Embed] Error sending embed:', error);
            await interaction.reply({
                content: `❌ Failed to send embed: ${error.message}`,
                ephemeral: true
            });
        }
    },
};
