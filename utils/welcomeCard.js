const canvasHelper = require('./canvasHelper');
const { AttachmentBuilder } = require('discord.js');

// Only load canvas functions if available
let createCanvas, loadImage;
if (canvasHelper.isAvailable()) {
    const canvas = canvasHelper.getCanvas();
    createCanvas = canvas.createCanvas;
    loadImage = canvas.loadImage;
}

class WelcomeCard {
    constructor() {
        // Canvas dimensions (1920x1080 for high quality)
        this.width = 1920;
        this.height = 1080;
        
        // Your background GIF URL from postimage
        this.backgroundUrl = process.env.WELCOME_BG_URL || 'https://i.postimg.cc/your-image-url.gif';
    }

    /**
     * Check if canvas is available
     */
    isCanvasAvailable() {
        return canvasHelper.isAvailable();
    }

    /**
     * Create a premium welcome card
     * @param {GuildMember} member - The member who joined
     * @returns {AttachmentBuilder} - Discord attachment
     */
    async create(member) {
        // If canvas not available, return null (will use fallback embed)
        if (!canvasHelper.isAvailable()) {
            console.log('[WelcomeCard] Canvas not available, using fallback embed');
            return null;
        }

        try {
            // Create canvas
            const canvas = createCanvas(this.width, this.height);
            const ctx = canvas.getContext('2d');

            // Load background image/gif (first frame if GIF)
            const background = await loadImage(this.backgroundUrl).catch(() => null);
            
            if (background) {
                // Draw background
                ctx.drawImage(background, 0, 0, this.width, this.height);
                
                // Add dark overlay for better text visibility
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fillRect(0, 0, this.width, this.height);
            } else {
                // Fallback gradient background
                const gradient = ctx.createLinearGradient(0, 0, this.width, this.height);
                gradient.addColorStop(0, '#667eea');
                gradient.addColorStop(1, '#764ba2');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, this.width, this.height);
            }

            // ===== PROFILE PICTURE SECTION (CENTER) =====
            const avatarSize = 400;
            const avatarX = this.width / 2;
            const avatarY = this.height / 2;

            // Load user avatar
            const avatarUrl = member.user.displayAvatarURL({ 
                extension: 'png', 
                size: 512 
            });
            const avatar = await loadImage(avatarUrl);

            // Draw outer glow ring (larger and more prominent)
            ctx.save();
            ctx.shadowColor = '#00d4ff';
            ctx.shadowBlur = 60;
            ctx.beginPath();
            ctx.arc(avatarX, avatarY, avatarSize / 2 + 25, 0, Math.PI * 2);
            ctx.strokeStyle = '#00d4ff';
            ctx.lineWidth = 12;
            ctx.stroke();
            ctx.restore();

            // Draw white ring
            ctx.beginPath();
            ctx.arc(avatarX, avatarY, avatarSize / 2 + 12, 0, Math.PI * 2);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 10;
            ctx.stroke();

            // Clip to circle for avatar
            ctx.save();
            ctx.beginPath();
            ctx.arc(avatarX, avatarY, avatarSize / 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();

            // Draw avatar
            ctx.drawImage(
                avatar,
                avatarX - avatarSize / 2,
                avatarY - avatarSize / 2,
                avatarSize,
                avatarSize
            );
            ctx.restore();

            // ===== TOP TEXT SECTION =====
            ctx.textAlign = 'center';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
            ctx.shadowBlur = 35;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 6;
            
            // "WELCOME TO" - smaller, above
            ctx.font = 'bold 75px Arial, sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.fillText('WELCOME TO', this.width / 2, 150);

            // "HYDROX COMMUNITY" - large, with gradient
            ctx.font = 'bold 120px Arial, sans-serif';
            const gradient2 = ctx.createLinearGradient(
                this.width / 2 - 600,
                0,
                this.width / 2 + 600,
                0
            );
            gradient2.addColorStop(0, '#00d4ff');
            gradient2.addColorStop(0.5, '#ffffff');
            gradient2.addColorStop(1, '#00d4ff');
            ctx.fillStyle = gradient2;
            ctx.shadowBlur = 40;
            ctx.fillText('HYDROX COMMUNITY', this.width / 2, 260);

            // ===== BOTTOM TEXT SECTION =====
            const bottomY = avatarY + avatarSize / 2 + 120;

            // Username (large and prominent)
            ctx.font = 'bold 100px Arial, sans-serif';
            ctx.fillStyle = '#00d4ff';
            ctx.shadowBlur = 35;
            
            const username = member.user.username.length > 15 
                ? member.user.username.substring(0, 15) + '...' 
                : member.user.username;
            ctx.fillText(username, this.width / 2, bottomY);

            // Decorative line under username
            ctx.strokeStyle = '#00d4ff';
            ctx.lineWidth = 6;
            ctx.shadowColor = '#00d4ff';
            ctx.shadowBlur = 25;
            ctx.beginPath();
            const lineWidth = 600;
            ctx.moveTo(this.width / 2 - lineWidth / 2, bottomY + 35);
            ctx.lineTo(this.width / 2 + lineWidth / 2, bottomY + 35);
            ctx.stroke();

            // Bottom decorative line (separator)
            ctx.strokeStyle = '#00d4ff';
            ctx.lineWidth = 4;
            ctx.shadowColor = '#00d4ff';
            ctx.shadowBlur = 20;
            ctx.beginPath();
            const bottomLineWidth = 800;
            ctx.moveTo(this.width / 2 - bottomLineWidth / 2, this.height - 180);
            ctx.lineTo(this.width / 2 + bottomLineWidth / 2, this.height - 180);
            ctx.stroke();

            // Bottom message (moved down with more space)
            ctx.font = '55px Arial, sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 30;
            ctx.fillText('Make sure to read the rules and have fun!', this.width / 2, this.height - 110);

            // ===== DECORATIVE ELEMENTS =====
            
            // Top left corner decoration
            this.drawCornerDecoration(ctx, 80, 80, 'topLeft');
            
            // Top right corner decoration
            this.drawCornerDecoration(ctx, this.width - 80, 80, 'topRight');
            
            // Bottom left corner decoration
            this.drawCornerDecoration(ctx, 80, this.height - 80, 'bottomLeft');
            
            // Bottom right corner decoration
            this.drawCornerDecoration(ctx, this.width - 80, this.height - 80, 'bottomRight');

            // Convert to buffer
            const buffer = canvas.toBuffer('image/png');
            
            // Create attachment
            return new AttachmentBuilder(buffer, { name: 'welcome.png' });

        } catch (error) {
            console.error('Error creating welcome card:', error);
            return null;
        }
    }

    /**
     * Draw decorative corner elements
     */
    drawCornerDecoration(ctx, x, y, position) {
        ctx.save();
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 6;
        ctx.shadowColor = '#00d4ff';
        ctx.shadowBlur = 20;

        const size = 70;

        ctx.beginPath();
        switch (position) {
            case 'topLeft':
                ctx.moveTo(x, y + size);
                ctx.lineTo(x, y);
                ctx.lineTo(x + size, y);
                break;
            case 'topRight':
                ctx.moveTo(x - size, y);
                ctx.lineTo(x, y);
                ctx.lineTo(x, y + size);
                break;
            case 'bottomLeft':
                ctx.moveTo(x, y - size);
                ctx.lineTo(x, y);
                ctx.lineTo(x + size, y);
                break;
            case 'bottomRight':
                ctx.moveTo(x - size, y);
                ctx.lineTo(x, y);
                ctx.lineTo(x, y - size);
                break;
        }
        ctx.stroke();
        ctx.restore();
    }

    /**
     * Create a simple text-based welcome embed (fallback)
     */
    createFallbackEmbed(member) {
        const { EmbedBuilder } = require('discord.js');
        
        return new EmbedBuilder()
            .setColor('#00d4ff')
            .setTitle('🎉 Welcome to HYDROX Community!')
            .setDescription(
                `Hey ${member}! Welcome to **HYDROX Community**!\n\n` +
                `You are member **#${member.guild.memberCount}**\n\n` +
                `Make sure to read the rules and have fun!`
            )
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
            .setImage(this.backgroundUrl)
            .setFooter({ 
                text: 'HYDROX Community', 
                iconURL: member.guild.iconURL({ dynamic: true }) 
            })
            .setTimestamp();
    }
}

module.exports = WelcomeCard;
