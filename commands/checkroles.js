const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const RoleManager = require('../utils/roleManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('checkroles')
        .setDescription('Manually check and grant roles for all members (Admin only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        
        const totalGranted = await RoleManager.checkAllMembers(interaction.guild);
        
        await interaction.editReply(`✅ Role check complete! Granted ${totalGranted} new roles.`);
    },
};
