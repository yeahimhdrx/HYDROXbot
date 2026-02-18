const { EmbedBuilder, ChannelType } = require('discord.js');
const MessageCache = require('../utils/messageCache');

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        // Cache all guild messages for deletion logging
        if (message.guild && !message.author.bot) {
            MessageCache.cacheMessage(message);
        }

        // Ignore bot messages for DM forwarding
        if (message.author.bot) return;

        // Only handle DMs (not server messages) for forwarding
        if (message.channel.type !== ChannelType.DM) return;

        // Your user ID from environment variable
        const ownerId = process.env.OWNER_ID;
        
        if (!ownerId) {
            console.error('❌ OWNER_ID not set in .env file - cannot forward DMs');
            return;
        }

        console.log(`📨 Received DM from ${message.author.tag}: ${message.content}`);

        try {
            // Get the owner user
            const owner = await message.client.users.fetch(ownerId);

            // Create embed with the DM details
            const embed = new EmbedBuilder()
                .setColor('#5865f2')
                .setTitle('📨 New DM Received')
                .setDescription(`You received a DM from a user!`)
                .addFields(
                    { name: '👤 From', value: `${message.author.tag} (<@${message.author.id}>)`, inline: true },
                    { name: '🆔 User ID', value: `\`${message.author.id}\``, inline: true },
                    { name: '📅 Sent At', value: `<t:${Math.floor(message.createdTimestamp / 1000)}:F>`, inline: false },
                    { name: '💬 Message', value: message.content || '*No text content*', inline: false }
                )
                .setThumbnail(message.author.displayAvatarURL({ dynamic: true, size: 256 }))
                .setFooter({ text: `User ID: ${message.author.id}` })
                .setTimestamp();

            // Add attachments if any
            if (message.attachments.size > 0) {
                const attachmentList = message.attachments.map(att => `[${att.name}](${att.url})`).join('\n');
                embed.addFields({ name: '📎 Attachments', value: attachmentList, inline: false });
                
                // Set first image as embed image if it's an image
                const firstAttachment = message.attachments.first();
                if (firstAttachment.contentType?.startsWith('image/')) {
                    embed.setImage(firstAttachment.url);
                }
            }

            // Send to owner
            await owner.send({ embeds: [embed] });
            console.log(`✅ Forwarded DM from ${message.author.tag} to owner`);

            // Send auto-reply to user
            await message.reply(
                '✅ Thank you for your message! It has been forwarded to the HYDROX team. ' +
                'We\'ll get back to you as soon as possible.'
            );
            console.log(`✅ Sent auto-reply to ${message.author.tag}`);

        } catch (error) {
            console.error('❌ Error forwarding DM:', error);
        }
    },
};
