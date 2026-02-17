const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('testwelcomedm')
        .setDescription('Test the welcome DM message (Admin only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to send test DM to (defaults to you)')
                .setRequired(false)),
    async execute(interaction) {
        await interaction.deferReply({ flags: 1 << 6 }); // Ephemeral

        try {
            const targetUser = interaction.options.getUser('user') || interaction.user;
            const member = await interaction.guild.members.fetch(targetUser.id);

            // Create the same DM embed that new members receive
            const dmEmbed = new EmbedBuilder()
                .setColor('#00d4ff')
                .setAuthor({ 
                    name: `Welcome to ${member.guild.name}!`,
                    iconURL: member.guild.iconURL({ dynamic: true })
                })
                .setTitle('🎉 You\'ve Joined HYDROX Community!')
                .setDescription(
                    `Hey **${member.user.username}**! We're excited to have you here!\n\n` +
                    `You're now part of an amazing community with **${member.guild.memberCount}** members!`
                )
                .addFields(
                    {
                        name: '📜 Getting Started',
                        value: 
                            `• Read the **rules** to stay safe\n` +
                            `• Introduce yourself in the chat\n` +
                            `• Check out our channels and explore`,
                        inline: false
                    },
                    {
                        name: '🎤 Voice Activity System',
                        value: 
                            `• Join voice channels to earn roles\n` +
                            `• Track your progress with \`/stats\`\n` +
                            `• Unlock exclusive roles as you participate`,
                        inline: false
                    },
                    {
                        name: '🎮 Community Guidelines',
                        value: 
                            `• Be respectful to everyone\n` +
                            `• Have fun and make friends\n` +
                            `• Ask questions if you need help`,
                        inline: false
                    }
                )
                .setImage(member.guild.bannerURL({ size: 1024 }) || member.guild.iconURL({ dynamic: true, size: 512 }))
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
                .setFooter({ 
                    text: `Member #${member.guild.memberCount} • ${member.guild.name}`,
                    iconURL: member.guild.iconURL({ dynamic: true })
                })
                .setTimestamp();

            // Try to send DM
            try {
                await member.send({ embeds: [dmEmbed] });
                await interaction.editReply({
                    content: `✅ Test welcome DM sent to ${targetUser.tag}! Check your DMs.`
                });
            } catch (dmError) {
                await interaction.editReply({
                    content: `❌ Could not send DM to ${targetUser.tag}. They might have DMs disabled.\n\nHere's a preview of what the DM would look like:`,
                    embeds: [dmEmbed]
                });
            }
        } catch (error) {
            console.error('Error testing welcome DM:', error);
            await interaction.editReply({
                content: `❌ Error: ${error.message}`
            });
        }
    },
};
