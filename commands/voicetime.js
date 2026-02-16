const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const VoiceTracker = require('../utils/voiceTracker');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('voicetime')
        .setDescription('Manage user voice time (Admin only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add voice time to a user')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User to add time to')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('hours')
                        .setDescription('Hours to add')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('Set user voice time')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User to set time for')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('hours')
                        .setDescription('Total hours to set')
                        .setRequired(true))),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const targetUser = interaction.options.getUser('user');
        const hours = interaction.options.getInteger('hours');
        const db = require('../utils/database');
        const Logger = require('../utils/logger');

        if (subcommand === 'add') {
            const stmt = db.prepare(`
                INSERT INTO voice_activity (user_id, total_minutes) 
                VALUES (?, ?)
                ON CONFLICT(user_id) DO UPDATE SET total_minutes = total_minutes + ?
            `);
            stmt.run(targetUser.id, hours * 60, hours * 60);
            
            await Logger.log('ADMIN_ACTION', `Added ${hours} hours to voice time`, {
                admin: interaction.user.tag,
                target: targetUser.tag
            });
            
            await interaction.reply({ 
                content: `✅ Added ${hours} hours to ${targetUser.tag}`,
                ephemeral: true 
            });
        } else if (subcommand === 'set') {
            const stmt = db.prepare(`
                INSERT INTO voice_activity (user_id, total_minutes) 
                VALUES (?, ?)
                ON CONFLICT(user_id) DO UPDATE SET total_minutes = ?
            `);
            stmt.run(targetUser.id, hours * 60, hours * 60);
            
            await Logger.log('ADMIN_ACTION', `Set voice time to ${hours} hours`, {
                admin: interaction.user.tag,
                target: targetUser.tag
            });
            
            await interaction.reply({ 
                content: `✅ Set ${targetUser.tag}'s voice time to ${hours} hours`,
                ephemeral: true 
            });
        }

        // Check for new roles
        const member = await interaction.guild.members.fetch(targetUser.id);
        const RoleManager = require('../utils/roleManager');
        await RoleManager.checkAndGrantRoles(member);
    },
};
