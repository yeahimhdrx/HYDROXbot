const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dm')
        .setDescription('Send a DM to a specific user as the bot (Owner only)')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to send the DM to')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('message')
                .setDescription('The message to send')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),

    async execute(interaction) {
        // Restrict to bot owner only
        if (interaction.user.id !== process.env.OWNER_ID) {
            return interaction.reply({
                content: '❌ Only the bot owner can use this command!',
                ephemeral: true
            });
        }

        const targetUser = interaction.options.getUser('user');
        const message = interaction.options.getString('message');

        try {
            await targetUser.send(message);

            await interaction.reply({
                content: `✅ DM sent to **${targetUser.tag}**!`,
                ephemeral: true
            });

            console.log(`[DM] ${interaction.user.tag} sent DM to ${targetUser.tag}: "${message.substring(0, 50)}"`);
        } catch (error) {
            console.error('[DM] Error sending DM:', error);
            await interaction.reply({
                content: `❌ Failed to send DM to **${targetUser.tag}**: ${error.message}\n*(They may have DMs disabled)*`,
                ephemeral: true
            });
        }
    },
};
