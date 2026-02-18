const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purgeuser')
        .setDescription('Delete all messages from a specific user within a time range (Admin only)')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user whose messages to delete')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('minutes')
                .setDescription('Delete messages from the last X minutes (1-1440)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(1440) // Max 24 hours
        )
        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('Specific channel to purge from (optional, leave empty for all channels)')
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

        const targetUser = interaction.options.getUser('user');
        const minutes = interaction.options.getInteger('minutes');
        const specificChannel = interaction.options.getChannel('channel');

        // Prevent purging bot's own messages
        if (targetUser.id === interaction.client.user.id) {
            return interaction.reply({
                content: '❌ Cannot purge bot\'s own messages!',
                ephemeral: true
            });
        }

        // Defer reply as this might take a while
        await interaction.deferReply({ ephemeral: true });

        try {
            const cutoffTime = Date.now() - (minutes * 60 * 1000);
            let totalDeleted = 0;
            let channelsProcessed = 0;
            const errors = [];

            // Get channels to process
            const channelsToProcess = specificChannel 
                ? [specificChannel]
                : interaction.guild.channels.cache.filter(ch => ch.isTextBased() && !ch.isThread());

            const statusEmbed = new EmbedBuilder()
                .setColor('#ffa500')
                .setTitle('🔄 Purging Messages...')
                .setDescription(`Scanning channels for messages from ${targetUser.tag}...`)
                .addFields(
                    { name: '👤 Target User', value: `${targetUser.tag}`, inline: true },
                    { name: '⏱️ Time Range', value: `Last ${minutes} minute(s)`, inline: true },
                    { name: '📊 Progress', value: '0 channels processed', inline: true }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [statusEmbed] });

            // Process each channel
            for (const [channelId, channel] of channelsToProcess) {
                try {
                    // Skip if bot doesn't have permissions
                    if (!channel.permissionsFor(interaction.guild.members.me).has([
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.ManageMessages
                    ])) {
                        errors.push(`Missing permissions in ${channel.name}`);
                        continue;
                    }

                    let deletedInChannel = 0;
                    let lastMessageId = null;
                    let hasMore = true;

                    // Fetch and delete messages in batches
                    while (hasMore) {
                        const options = { limit: 100 };
                        if (lastMessageId) {
                            options.before = lastMessageId;
                        }

                        const messages = await channel.messages.fetch(options);
                        
                        if (messages.size === 0) {
                            hasMore = false;
                            break;
                        }

                        // Filter messages by user and time
                        const messagesToDelete = messages.filter(msg => 
                            msg.author.id === targetUser.id && 
                            msg.createdTimestamp >= cutoffTime
                        );

                        if (messagesToDelete.size === 0) {
                            // Check if we've gone past the cutoff time
                            const oldestMessage = messages.last();
                            if (oldestMessage && oldestMessage.createdTimestamp < cutoffTime) {
                                hasMore = false;
                                break;
                            }
                            
                            lastMessageId = messages.last()?.id;
                            continue;
                        }

                        // Delete messages
                        // Messages older than 14 days must be deleted individually
                        const twoWeeksAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);
                        const recentMessages = messagesToDelete.filter(msg => msg.createdTimestamp > twoWeeksAgo);
                        const oldMessages = messagesToDelete.filter(msg => msg.createdTimestamp <= twoWeeksAgo);

                        // Bulk delete recent messages (up to 100 at a time)
                        if (recentMessages.size > 0) {
                            try {
                                await channel.bulkDelete(recentMessages, true);
                                deletedInChannel += recentMessages.size;
                            } catch (error) {
                                console.error(`Error bulk deleting in ${channel.name}:`, error.message);
                                errors.push(`Bulk delete failed in ${channel.name}`);
                            }
                        }

                        // Delete old messages individually
                        for (const [, message] of oldMessages) {
                            try {
                                await message.delete();
                                deletedInChannel++;
                                // Rate limit: wait 1 second between individual deletes
                                await new Promise(resolve => setTimeout(resolve, 1000));
                            } catch (error) {
                                console.error(`Error deleting message ${message.id}:`, error.message);
                            }
                        }

                        lastMessageId = messages.last()?.id;

                        // Check if we've processed all messages in time range
                        if (messages.size < 100) {
                            hasMore = false;
                        }
                    }

                    if (deletedInChannel > 0) {
                        totalDeleted += deletedInChannel;
                        console.log(`[PurgeUser] Deleted ${deletedInChannel} messages from ${targetUser.tag} in #${channel.name}`);
                    }

                    channelsProcessed++;

                    // Update progress every 5 channels
                    if (channelsProcessed % 5 === 0) {
                        statusEmbed.setFields(
                            { name: '👤 Target User', value: `${targetUser.tag}`, inline: true },
                            { name: '⏱️ Time Range', value: `Last ${minutes} minute(s)`, inline: true },
                            { name: '📊 Progress', value: `${channelsProcessed}/${channelsToProcess.size} channels`, inline: true },
                            { name: '🗑️ Deleted So Far', value: `${totalDeleted} messages`, inline: true }
                        );
                        await interaction.editReply({ embeds: [statusEmbed] });
                    }

                } catch (error) {
                    console.error(`Error processing channel ${channel.name}:`, error);
                    errors.push(`Error in ${channel.name}: ${error.message}`);
                }
            }

            // Final result embed
            const resultEmbed = new EmbedBuilder()
                .setColor(totalDeleted > 0 ? '#00ff00' : '#ff0000')
                .setTitle(totalDeleted > 0 ? '✅ Purge Complete' : '⚠️ Purge Complete - No Messages Found')
                .setDescription(`Purge operation completed for ${targetUser.tag}`)
                .addFields(
                    { name: '👤 Target User', value: `${targetUser.tag} (<@${targetUser.id}>)`, inline: true },
                    { name: '⏱️ Time Range', value: `Last ${minutes} minute(s)`, inline: true },
                    { name: '📍 Scope', value: specificChannel ? `#${specificChannel.name}` : 'All channels', inline: true },
                    { name: '🗑️ Messages Deleted', value: `**${totalDeleted}**`, inline: true },
                    { name: '📊 Channels Processed', value: `${channelsProcessed}`, inline: true },
                    { name: '👮 Executed By', value: `${interaction.user.tag}`, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Purge User Command' });

            if (errors.length > 0) {
                const errorList = errors.slice(0, 5).join('\n');
                resultEmbed.addFields({
                    name: '⚠️ Errors Encountered',
                    value: `\`\`\`${errorList}${errors.length > 5 ? `\n... and ${errors.length - 5} more` : ''}\`\`\``,
                    inline: false
                });
            }

            await interaction.editReply({ embeds: [resultEmbed] });

            // Log to console
            console.log(`[PurgeUser] ${interaction.user.tag} purged ${totalDeleted} messages from ${targetUser.tag} (last ${minutes} minutes)`);

        } catch (error) {
            console.error('[PurgeUser] Error:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Purge Failed')
                .setDescription('An error occurred while purging messages')
                .addFields(
                    { name: 'Error', value: `\`\`\`${error.message}\`\`\``, inline: false }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    },
};
