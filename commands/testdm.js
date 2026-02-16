const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const RoleManager = require('../utils/roleManager');
const config = require('../config');
const { formatTime } = require('../utils/timeFormatter');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('testdm')
        .setDescription('Test DM messages that the bot sends (Admin only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type of message to test')
                .setRequired(true)
                .addChoices(
                    { name: 'Role: FRIENDS (20h)', value: 'role_friends' },
                    { name: 'Role: ASCENDANT (40h)', value: 'role_ascendant' },
                    { name: 'Role: EPIC (60h)', value: 'role_epic' },
                    { name: 'Role: LEGEND (100h)', value: 'role_legend' },
                    { name: 'Role: ELITE (150h)', value: 'role_elite' },
                    { name: 'Role: CHAMPION (200h)', value: 'role_champion' },
                    { name: 'Role: MYTHIC (250h)', value: 'role_mythic' },
                    { name: 'Tag Reminder: LEGEND', value: 'tag_legend' },
                    { name: 'Tag Reminder: ELITE', value: 'tag_elite' }
                )),
    async execute(interaction) {
        const type = interaction.options.getString('type');
        const member = interaction.member;

        try {
            let embed = null;

            // Role celebration messages
            if (type.startsWith('role_')) {
                const roleIndex = {
                    'role_friends': 0,
                    'role_ascendant': 1,
                    'role_epic': 2,
                    'role_legend': 3,
                    'role_elite': 4,
                    'role_champion': 5,
                    'role_mythic': 6
                };

                const index = roleIndex[type];
                const roleConfig = config.roles[index];
                const testHours = roleConfig.hours;

                embed = RoleManager.createRoleCelebrationEmbed(member, roleConfig, testHours);
                await member.send({ embeds: [embed] });
            }
            // Tag reminder messages
            else if (type === 'tag_legend') {
                embed = new EmbedBuilder()
                    .setColor('#f39c12')
                    .setTitle('🏷️ HYDROX Tag Required!')
                    .setDescription(`Hey ${member.user.username}! Great news! 🎉`)
                    .addFields(
                        { name: '✨ Achievement Unlocked', value: `You've reached **${formatTime(100)}** of voice activity!`, inline: false },
                        { name: '🎭 Role Available', value: `**𝐋𝐄𝐆𝐄𝐍𝐃**`, inline: true },
                        { name: '⏱️ Required Time', value: `100h ✅`, inline: true },
                        { name: '\u200B', value: '\u200B', inline: false },
                        { name: '🏷️ Next Step', value: `To unlock the **𝐋𝐄𝐆𝐄𝐍𝐃** role, please add the **[HDRX]** tag to your Discord username!`, inline: false },
                        { name: '📝 How to Add Tag', value: '1. Click on the server name\n2. Select "Edit Server Profile"\n3. Add **[HDRX]** to your nickname\n4. Let staff know you\'ve added it!', inline: false }
                    )
                    .setFooter({ text: 'HYDROX Community • Keep being awesome!' })
                    .setTimestamp();
                
                await member.send({ embeds: [embed] });
            }
            else if (type === 'tag_elite') {
                embed = new EmbedBuilder()
                    .setColor('#f39c12')
                    .setTitle('🏷️ HYDROX Tag Required!')
                    .setDescription(`Hey ${member.user.username}! Great news! 🎉`)
                    .addFields(
                        { name: '✨ Achievement Unlocked', value: `You've reached **${formatTime(150)}** of voice activity!`, inline: false },
                        { name: '🎭 Role Available', value: `**𝐄𝐋𝐈𝐓𝐄**`, inline: true },
                        { name: '⏱️ Required Time', value: `150h ✅`, inline: true },
                        { name: '\u200B', value: '\u200B', inline: false },
                        { name: '🏷️ Next Step', value: `To unlock the **𝐄𝐋𝐈𝐓𝐄** role, please add the **[HDRX]** tag to your Discord username!`, inline: false },
                        { name: '📝 How to Add Tag', value: '1. Click on the server name\n2. Select "Edit Server Profile"\n3. Add **[HDRX]** to your nickname\n4. Let staff know you\'ve added it!', inline: false }
                    )
                    .setFooter({ text: 'HYDROX Community • Keep being awesome!' })
                    .setTimestamp();
                
                await member.send({ embeds: [embed] });
            }

            await interaction.reply({ 
                content: `✅ Test DM sent! Check your direct messages to see the beautiful celebration message.`,
                ephemeral: true 
            });

        } catch (error) {
            console.error('Error sending test DM:', error);
            await interaction.reply({ 
                content: `❌ Could not send DM. Make sure your DMs are open!\n\nError: ${error.message}`,
                ephemeral: true 
            });
        }
    },
};
