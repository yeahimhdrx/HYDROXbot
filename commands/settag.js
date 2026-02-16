const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const VoiceTracker = require('../utils/voiceTracker');
const RoleManager = require('../utils/roleManager');
const Logger = require('../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('settag')
        .setDescription('Manage HDRX tag status for users')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Mark user as using HDRX tag')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User who is using the HDRX tag')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Mark user as not using HDRX tag')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User who removed the HDRX tag')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('check')
                .setDescription('Check if user has HDRX tag status')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User to check')
                        .setRequired(true))),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const targetUser = interaction.options.getUser('user');
        const userId = targetUser.id;

        if (subcommand === 'add') {
            VoiceTracker.setTagStatus(userId, true);
            
            await Logger.log('TAG_UPDATE', null, {
                user: targetUser.tag,
                userId: targetUser.id,
                userAvatar: targetUser.displayAvatarURL({ dynamic: true }),
                hasTag: true,
                admin: interaction.user.tag
            });
            
            await interaction.reply({ 
                content: `✅ ${targetUser.tag} is now marked as using the HDRX tag. Checking for new roles...`,
                ephemeral: true 
            });

            // Check for new roles (this will grant any eligible roles now that they have the tag)
            const member = await interaction.guild.members.fetch(userId);
            const rolesGranted = await RoleManager.checkAndGrantRoles(member);
            
            if (rolesGranted > 0) {
                await interaction.followUp({
                    content: `🎉 Granted ${rolesGranted} new role(s) to ${targetUser.tag}!`,
                    ephemeral: true
                });
            }

        } else if (subcommand === 'remove') {
            VoiceTracker.setTagStatus(userId, false);
            
            await Logger.log('TAG_UPDATE', null, {
                user: targetUser.tag,
                userId: targetUser.id,
                userAvatar: targetUser.displayAvatarURL({ dynamic: true }),
                hasTag: false,
                admin: interaction.user.tag
            });
            
            await interaction.reply({ 
                content: `✅ ${targetUser.tag} is now marked as NOT using the HDRX tag`,
                ephemeral: true 
            });

        } else if (subcommand === 'check') {
            const hasTag = VoiceTracker.getStoredTagStatus(userId);
            
            await interaction.reply({ 
                content: `${targetUser.tag} is ${hasTag ? '✅ using' : '❌ NOT using'} the HDRX tag`,
                ephemeral: true 
            });
        }
    },
};
