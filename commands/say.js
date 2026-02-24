const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Send a message as the bot (Admin only)')
        .addStringOption(option =>
            option
                .setName('message')
                .setDescription('The message to send')
                .setRequired(true)
        )
        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('Channel to send the message in (optional, defaults to current channel)')
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

        const message = interaction.options.getString('message');
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
        if (!permissions.has(PermissionFlagsBits.SendMessages)) {
            return interaction.reply({
                content: `❌ I don't have permission to send messages in ${targetChannel}!`,
                ephemeral: true
            });
        }

        try {
            // Send the message as the bot
            await targetChannel.send(message);

            // Confirm to the admin
            await interaction.reply({
                content: `✅ Message sent to ${targetChannel}!`,
                ephemeral: true
            });

            console.log(`[Say] ${interaction.user.tag} sent message as bot in #${targetChannel.name}: "${message.substring(0, 50)}..."`);
        } catch (error) {
            console.error('[Say] Error sending message:', error);
            await interaction.reply({
                content: `❌ Failed to send message: ${error.message}`,
                ephemeral: true
            });
        }
    },
};
