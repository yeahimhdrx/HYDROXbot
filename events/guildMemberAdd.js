const canvasHelper = require('../utils/canvasHelper');
const WelcomeCard = require('../utils/welcomeCard');
const InviteTracker = require('../utils/inviteTracker');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        try {
            // Track invite
            const inviteInfo = await InviteTracker.handleMemberJoin(member);
            
            if (inviteInfo) {
                console.log(`[GuildMemberAdd] ${member.user.tag} was invited by ${inviteInfo.inviterTag}`);
                
                // Check if inviter earned any roles
                const inviterMember = await member.guild.members.fetch(inviteInfo.inviterId).catch(() => null);
                
                if (inviterMember) {
                    const grantedRoles = await InviteTracker.checkAndGrantRoles(inviterMember, inviteInfo.newTotal);
                    
                    // Send celebration for each new role
                    if (grantedRoles.length > 0) {
                        const celebrationChannelId = process.env.INVITE_CELEBRATION_CHANNEL_ID || '1409519478391181362';
                        const celebrationChannel = member.guild.channels.cache.get(celebrationChannelId);
                        
                        if (celebrationChannel) {
                            for (const { role, config } of grantedRoles) {
                                const nextRole = InviteTracker.getNextRole(inviteInfo.newTotal);
                                
                                // Create celebration embed data
                                const celebrationData = {
                                    userId: inviteInfo.inviterId,
                                    userAvatar: inviteInfo.inviter.displayAvatarURL({ dynamic: true }),
                                    roleName: config.name,
                                    roleId: role.id,
                                    invites: inviteInfo.newTotal,
                                    required: config.invites,
                                    nextRole: nextRole,
                                    guildIcon: member.guild.iconURL({ dynamic: true })
                                };
                                
                                // Send to celebration channel
                                const Logger = require('../utils/logger');
                                await Logger.sendToChannel(celebrationChannelId, 'INVITE_ROLE_EARNED', null, celebrationData);
                                
                                // Tag everyone, member role, and the user
                                const memberRoleId = '1409517032231276614'; // @𝐌𝐄𝐌𝐁𝐄𝐑 role ID
                                await celebrationChannel.send({
                                    content: `@everyone <@&${memberRoleId}> <@${inviteInfo.inviterId}> <@&${role.id}>`
                                });
                                
                                // Send DM to the user with the same celebration
                                try {
                                    const dmEmbed = this.createCelebrationEmbed(celebrationData, member.guild);
                                    await inviteInfo.inviter.send({ embeds: [dmEmbed] });
                                    console.log(`[InviteReward] Sent celebration DM to ${inviteInfo.inviterTag}`);
                                } catch (dmError) {
                                    console.log(`[InviteReward] Could not send DM to ${inviteInfo.inviterTag} (DMs might be closed)`);
                                }
                            }
                        }
                    }
                }
            }

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

    // Helper function to create celebration embed for DM
    createCelebrationEmbed(data, guild) {
        const roleEmojis = {
            '𝐒𝐂𝐎𝐔𝐓': '🔍',
            '𝐑𝐄𝐂𝐑𝐔𝐈𝐓𝐄𝐑': '📢',
            '𝐀𝐌𝐁𝐀𝐒𝐒𝐀𝐃𝐎𝐑': '🌟',
            '𝐈𝐍𝐅𝐋𝐔𝐄𝐍𝐂𝐄𝐑': '💎',
            '𝐏𝐀𝐑𝐓𝐍𝐄𝐑': '👑',
            '𝐒𝐎𝐕𝐄𝐑𝐄𝐈𝐆𝐍': '⚡'
        };

        const roleColors = {
            '𝐒𝐂𝐎𝐔𝐓': '#00d4ff',
            '𝐑𝐄𝐂𝐑𝐔𝐈𝐓𝐄𝐑': '#7c3aed',
            '𝐀𝐌𝐁𝐀𝐒𝐒𝐀𝐃𝐎𝐑': '#ec4899',
            '𝐈𝐍𝐅𝐋𝐔𝐄𝐍𝐂𝐄𝐑': '#f59e0b',
            '𝐏𝐀𝐑𝐓𝐍𝐄𝐑': '#ef4444',
            '𝐒𝐎𝐕𝐄𝐑𝐄𝐈𝐆𝐍': '#FFD700'
        };

        const emoji = roleEmojis[data.roleName] || '🎉';
        const color = roleColors[data.roleName] || '#00d4ff';

        // Create progress bar for next role
        let progressBar = '';
        if (data.nextRole) {
            const progress = (data.invites / data.nextRole.invites) * 100;
            const filled = Math.round(progress / 5);
            const empty = 20 - filled;
            progressBar = '▰'.repeat(filled) + '▱'.repeat(empty);
        }

        const embed = new EmbedBuilder()
            .setColor(color)
            .setAuthor({ 
                name: '🔔 NEW INVITE MILESTONE ACHIEVED!',
                iconURL: data.userAvatar
            })
            .setTitle(`${emoji} **CONGRATULATIONS!** ${emoji}`)
            .setDescription(
                `You have reached **${data.invites} invites** and earned\n` +
                `the prestigious **${data.roleName}** role!`
            )
            .addFields(
                {
                    name: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
                    value: '\u200b',
                    inline: false
                },
                {
                    name: `${emoji} Role Earned`,
                    value: `**${data.roleName}**`,
                    inline: true
                },
                {
                    name: '📊 Total Invites',
                    value: `\`${data.invites}\``,
                    inline: true
                },
                {
                    name: '🎯 Required',
                    value: `\`${data.required}\``,
                    inline: true
                },
                {
                    name: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
                    value: '\u200b',
                    inline: false
                }
            )
            .setThumbnail(data.userAvatar)
            .setImage('https://i.postimg.cc/ncKDwxkD/image.jpg')
            .setFooter({ 
                text: `⚡ ${guild.name} • Invite Rewards System • Today at ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`,
                iconURL: data.guildIcon 
            })
            .setTimestamp();

        // Add next milestone or max rank
        if (data.nextRole) {
            const remaining = data.nextRole.invites - data.invites;
            embed.addFields({
                name: `🎯 Next Milestone: ${data.nextRole.name}`,
                value: `${progressBar}\n\`${data.invites}\` / \`${data.nextRole.invites}\` invites • **${remaining}** more to go!`,
                inline: false
            });
        } else {
            embed.addFields({
                name: '👑 Maximum Rank Achieved!',
                value: 'You have reached the highest invite rank! You are a legend! 🔥',
                inline: false
            });
        }

        embed.addFields({
            name: '\u200b',
            value: 'Thank you for growing our community! 💪\nKeep inviting to unlock even more exclusive roles!',
            inline: false
        });

        return embed;
    }
};
