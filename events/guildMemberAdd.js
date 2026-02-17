const WelcomeCard = require('../utils/welcomeCard');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        try {
            // Get welcome channel ID from environment
            const welcomeChannelId = process.env.WELCOME_CHANNEL_ID;
            
            if (!welcomeChannelId) {
                console.log('⚠️ WELCOME_CHANNEL_ID not set in .env - skipping welcome message');
                return;
            }

            // Get welcome channel
            const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId);
            
            if (!welcomeChannel) {
                console.log(`⚠️ Welcome channel ${welcomeChannelId} not found`);
                return;
            }

            // Check if bot has permission to send messages
            if (!welcomeChannel.permissionsFor(member.guild.members.me).has('SendMessages')) {
                console.log(`⚠️ No permission to send messages in welcome channel`);
                return;
            }

            console.log(`👋 New member joined: ${member.user.tag}`);

            // Create welcome card
            const welcomeCardGenerator = new WelcomeCard();
            const welcomeCard = await welcomeCardGenerator.create(member);

            // Get rules channel ID from environment
            const rulesChannelId = process.env.RULES_CHANNEL_ID;
            const rulesChannelMention = rulesChannelId ? `<#${rulesChannelId}>` : '#rules';

            if (welcomeCard) {
                // Send with custom image and tag user
                await welcomeChannel.send({
                    content: `Welcome To HYDROX - COMUNITY : ${member}, Read The Rules in ${rulesChannelMention}`,
                    files: [welcomeCard]
                });
                
                console.log(`✅ Sent welcome card to ${member.user.tag}`);
            } else {
                // Fallback to embed if image generation fails
                const fallbackEmbed = welcomeCardGenerator.createFallbackEmbed(member);
                
                await welcomeChannel.send({
                    content: `Welcome To HYDROX - COMUNITY : ${member}, Read The Rules in ${rulesChannelMention}`,
                    embeds: [fallbackEmbed]
                });
                
                console.log(`✅ Sent fallback welcome embed to ${member.user.tag}`);
            }

            // Send beautiful welcome DM to user
            try {
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
                    .setImage(member.guild.bannerURL({ size: 1024 }) || null)
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
                    .setFooter({ 
                        text: `Member #${member.guild.memberCount} • ${member.guild.name}`,
                        iconURL: member.guild.iconURL({ dynamic: true })
                    })
                    .setTimestamp();

                // Add server icon as thumbnail if no banner
                if (!member.guild.bannerURL()) {
                    dmEmbed.setImage(member.guild.iconURL({ dynamic: true, size: 512 }));
                }

                await member.send({ embeds: [dmEmbed] });
                console.log(`📨 Sent welcome DM to ${member.user.tag}`);
            } catch (dmError) {
                console.log(`Could not send welcome DM to ${member.user.tag} (DMs might be closed)`);
            }

            // Log to bot log channel
            const Logger = require('../utils/logger');
            await Logger.log('MEMBER_JOIN', null, {
                user: member.user.tag,
                userId: member.user.id,
                userAvatar: member.user.displayAvatarURL({ dynamic: true }),
                memberCount: member.guild.memberCount,
                accountAge: Math.floor((Date.now() - member.user.createdTimestamp) / (1000 * 60 * 60 * 24))
            });

        } catch (error) {
            console.error('Error in guildMemberAdd event:', error);
        }
    },
};
