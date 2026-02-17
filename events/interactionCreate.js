const { MessageFlags } = require('discord.js');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        // Rate limiting for non-admin commands
        const rateLimiter = require('../utils/rateLimiter');
        const isAdmin = interaction.member?.permissions?.has('Administrator');
        
        if (!isAdmin && rateLimiter.isRateLimited(interaction.user.id, interaction.commandName)) {
            return interaction.reply({ 
                content: '⏱️ You\'re using commands too quickly! Please wait a moment.',
                flags: MessageFlags.Ephemeral 
            });
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error('❌ Command execution error:', error);
            const errorMessage = { 
                content: 'There was an error executing this command!', 
                flags: MessageFlags.Ephemeral 
            };
            
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(errorMessage);
            } else {
                await interaction.reply(errorMessage);
            }
        }
    },
};
