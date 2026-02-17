const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const WelcomeCard = require('../utils/welcomeCard');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('testwelcome')
        .setDescription('Test the welcome message (Admin only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to test welcome for (defaults to you)')
                .setRequired(false)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const targetUser = interaction.options.getUser('user') || interaction.user;
            const member = await interaction.guild.members.fetch(targetUser.id);

            // Create welcome card
            const welcomeCardGenerator = new WelcomeCard();
            const welcomeCard = await welcomeCardGenerator.create(member);

            if (welcomeCard) {
                await interaction.editReply({
                    content: `✅ Here's how the welcome message will look for ${targetUser.tag}:`,
                    files: [welcomeCard]
                });
            } else {
                // Fallback embed
                const fallbackEmbed = welcomeCardGenerator.createFallbackEmbed(member);
                await interaction.editReply({
                    content: `✅ Here's the fallback welcome message for ${targetUser.tag}:`,
                    embeds: [fallbackEmbed]
                });
            }
        } catch (error) {
            console.error('Error testing welcome:', error);
            await interaction.editReply({
                content: `❌ Error generating welcome message: ${error.message}`
            });
        }
    },
};
