const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('testdeletelog')
        .setDescription('Test if bot can send to deleted messages log channel (Admin only)')
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

        const channelId = process.env.DELETED_MESSAGES_LOG_CHANNEL_ID;

        if (!channelId) {
            return interaction.reply({
                content: '❌ DELETED_MESSAGES_LOG_CHANNEL_ID is not set in .env file!',
                ephemeral: true
            });
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            // Try to fetch the channel
            const channel = await interaction.client.channels.fetch(channelId);

            if (!channel) {
                return interaction.editReply({
                    content: `❌ Could not find channel with ID: ${channelId}\nMake sure the bot is in the server and the channel exists.`
                });
            }

            if (!channel.isTextBased()) {
                return interaction.editReply({
                    content: `❌ Channel ${channelId} is not a text channel!`
                });
            }

            // Check permissions
            const permissions = channel.permissionsFor(interaction.guild.members.me);
            const hasViewChannel = permissions.has(PermissionFlagsBits.ViewChannel);
            const hasSendMessages = permissions.has(PermissionFlagsBits.SendMessages);
            const hasEmbedLinks = permissions.has(PermissionFlagsBits.EmbedLinks);

            if (!hasViewChannel || !hasSendMessages || !hasEmbedLinks) {
                return interaction.editReply({
                    content: `❌ Bot is missing permissions in <#${channelId}>:\n` +
                        `View Channel: ${hasViewChannel ? '✅' : '❌'}\n` +
                        `Send Messages: ${hasSendMessages ? '✅' : '❌'}\n` +
                        `Embed Links: ${hasEmbedLinks ? '✅' : '❌'}`
                });
            }

            // Try to send a test message
            const testEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('✅ Test Message - Delete Log System')
                .setDescription('This is a test message to verify the bot can send deletion logs to this channel.')
                .addFields(
                    { name: '📍 Channel ID', value: `\`${channelId}\``, inline: true },
                    { name: '🤖 Bot', value: `${interaction.client.user.tag}`, inline: true },
                    { name: '👤 Tested By', value: `${interaction.user.tag}`, inline: true },
                    { name: '✅ Status', value: 'All permissions verified!', inline: false }
                )
                .setTimestamp()
                .setFooter({ text: 'Message Deletion Logging Test' });

            await channel.send({ embeds: [testEmbed] });

            return interaction.editReply({
                content: `✅ Success! Bot can send messages to <#${channelId}>\n\n` +
                    `**Next Steps:**\n` +
                    `1. Delete a message in any channel\n` +
                    `2. Check <#${channelId}> for the deletion log\n` +
                    `3. If it doesn't appear, check bot console for errors\n\n` +
                    `**Note:** The bot can only log messages that:\n` +
                    `- Were sent after the bot started (for full details)\n` +
                    `- Are in channels the bot can see\n` +
                    `- Are not from other bots (bot messages are cached but logged)`
            });

        } catch (error) {
            console.error('[TestDeleteLog] Error:', error);
            return interaction.editReply({
                content: `❌ Error testing delete log channel:\n\`\`\`${error.message}\`\`\``
            });
        }
    },
};
