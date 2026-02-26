const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
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
        const db = require('../utils/database-adapter');
        const Logger = require('../utils/logger');

        // Input validation
        if (hours < 0) {
            return interaction.reply({ 
                content: '❌ Hours cannot be negative!',
                flags: MessageFlags.Ephemeral 
            });
        }

        if (hours > 10000) {
            return interaction.reply({ 
                content: '❌ Hours value too large! Maximum is 10,000 hours.',
                flags: MessageFlags.Ephemeral 
            });
        }

        if (targetUser.bot) {
            return interaction.reply({ 
                content: '❌ Cannot modify voice time for bots!',
                flags: MessageFlags.Ephemeral 
            });
        }

        if (subcommand === 'add') {
            const stmt = db.prepare(`
                INSERT INTO voice_activity (user_id, total_seconds) 
                VALUES (?, ?)
                ON CONFLICT(user_id) DO UPDATE SET total_seconds = total_seconds + ?
            `);
            stmt.run(targetUser.id, hours * 3600, hours * 3600);
            
            await Logger.log('ADMIN_ACTION', `Added ${hours} hours to voice time`, {
                admin: interaction.user.tag,
                target: targetUser.tag,
                details: `Added ${hours} hours of voice time`
            });
            
            await interaction.reply({ 
                content: `✅ Added ${hours} hours to ${targetUser.tag}`,
                flags: MessageFlags.Ephemeral 
            });
        } else if (subcommand === 'set') {
            const stmt = db.prepare(`
                INSERT INTO voice_activity (user_id, total_seconds) 
                VALUES (?, ?)
                ON CONFLICT(user_id) DO UPDATE SET total_seconds = ?
            `);
            stmt.run(targetUser.id, hours * 3600, hours * 3600);
            
            await Logger.log('ADMIN_ACTION', `Set voice time to ${hours} hours`, {
                admin: interaction.user.tag,
                target: targetUser.tag,
                details: `Voice time set to ${hours} hours`
            });
            
            await interaction.reply({ 
                content: `✅ Set ${targetUser.tag}'s voice time to ${hours} hours`,
                flags: MessageFlags.Ephemeral 
            });
        }

        // Check for new roles
        const member = await interaction.guild.members.fetch(targetUser.id);
        const RoleManager = require('../utils/roleManager');
        await RoleManager.checkAndGrantRoles(member);
    },
};
