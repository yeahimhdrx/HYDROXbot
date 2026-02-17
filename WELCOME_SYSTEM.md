# Premium Welcome System

Professional, high-quality welcome messages with custom image generation.

---

## ✨ Features

- 🎨 **Custom Image Generation** - Beautiful welcome cards with user avatars
- 🖼️ **Custom Background** - Use your own GIF/image from Postimage
- 💎 **Premium Design** - Modern, clean, professional look
- 🎯 **Member Counter** - Shows member number
- 📱 **Optional DMs** - Send welcome message to new members
- 📊 **Logging** - Logs all joins to your log channel
- 🔄 **Fallback System** - Works even if image generation fails

---

## 🎨 Design Features

### Visual Elements
- ✅ User profile picture in the center
- ✅ Glowing cyan ring around avatar
- ✅ Custom background (your GIF/image)
- ✅ Gradient text effects
- ✅ Corner decorations
- ✅ Member count display
- ✅ Professional typography
- ✅ Shadow effects for depth
- ✅ High resolution (1920x1080)

### Text Elements
- "WELCOME TO"
- "HYDROX" (with gradient)
- "Community"
- Username
- Member number
- Custom message at bottom

---

## 📋 Setup Instructions

### Step 1: Upload Your Background

1. **Prepare Your Image/GIF**
   - Recommended size: 1920x1080 (Full HD)
   - Format: GIF, PNG, or JPG
   - Make sure it's not too busy (text needs to be readable)

2. **Upload to Postimage**
   - Go to https://postimages.org/
   - Click "Choose images"
   - Select your background image/GIF
   - Click "Upload"
   - Copy the **Direct Link** (ends with .gif, .png, or .jpg)
   - Example: `https://i.postimg.cc/abc123/background.gif`

### Step 2: Configure Environment Variables

Add these to your `.env` file:

```env
# Welcome system configuration
WELCOME_CHANNEL_ID=1234567890123456789
WELCOME_BG_URL=https://i.postimg.cc/your-image-url.gif
```

**Configuration:**
- `WELCOME_CHANNEL_ID` - Channel where welcome messages are sent
- `WELCOME_BG_URL` - Your background image URL from Postimage

**Note:** Welcome DMs are automatically sent to all new members!

### Step 3: Install Dependencies

```bash
# Install the canvas library
npm install @napi-rs/canvas

# Or if already installed, update
npm install
```

### Step 4: Deploy Commands

```bash
npm run deploy
```

### Step 5: Test Welcome Message

In Discord, use:
```
/testwelcome
```

This will show you how the welcome message looks!

---

## 🎯 How It Works

### When a User Joins

1. **Event Triggered** - `guildMemberAdd` event fires
2. **Image Generation** - Creates custom welcome card:
   - Loads your background image
   - Adds dark overlay for text visibility
   - Draws user's profile picture in center
   - Adds glowing ring around avatar
   - Adds text with gradients and shadows
   - Adds decorative corner elements
3. **Send Channel Message** - Posts to welcome channel with user tag
4. **Send Welcome DM** - Sends beautiful embed with server logo and info
5. **Logging** - Logs join to your log channel

### Image Generation Process

```
Background Image
    ↓
Add Dark Overlay (30% opacity)
    ↓
Draw Glowing Ring (cyan)
    ↓
Draw White Ring
    ↓
Draw User Avatar (circular)
    ↓
Add Text (with shadows & gradients)
    ↓
Add Corner Decorations
    ↓
Export as PNG
    ↓
Send to Discord
```

---

## 🎨 Customization

### Change Colors

Edit `utils/welcomeCard.js`:

```javascript
// Glow color (line ~50)
ctx.shadowColor = '#00d4ff';  // Change to your color

// Ring color (line ~53)
ctx.strokeStyle = '#00d4ff';  // Change to your color

// Text gradient (line ~110)
gradient2.addColorStop(0, '#00d4ff');  // Start color
gradient2.addColorStop(1, '#00d4ff');  // End color
```

### Change Text

Edit `utils/welcomeCard.js`:

```javascript
// Server name (line ~115)
ctx.fillText('HYDROX', this.width / 2, 320);

// Subtitle (line ~120)
ctx.fillText('Community', this.width / 2, 400);

// Bottom message (line ~145)
ctx.fillText('Make sure to read the rules and have fun!', ...);
```

### Change Dimensions

```javascript
// In constructor (line ~7-8)
this.width = 1920;   // Change width
this.height = 1080;  // Change height
```

### Change Avatar Size

```javascript
// Line ~40
const avatarSize = 300;  // Change size (in pixels)
```

---

## 🧪 Testing

### Test Welcome Card

```
/testwelcome
```

Shows how the welcome message looks for you.

```
/testwelcome user:@someone
```

Shows how it looks for another user.

### Test Welcome DM

```
/testwelcomedm
```

Sends you the exact DM that new members receive.

```
/testwelcomedm user:@someone
```

Sends the test DM to another user.

### Test by Joining

1. Create a test account
2. Join your server
3. Check welcome channel

---

## 🆘 Troubleshooting

### Image Not Generating

**Problem:** Welcome card doesn't show, only text

**Solutions:**
1. Check if @napi-rs/canvas is installed:
   ```bash
   npm list @napi-rs/canvas
   ```

2. Reinstall if needed:
   ```bash
   npm uninstall canvas @napi-rs/canvas
   npm install @napi-rs/canvas
   ```

3. Check logs:
   ```bash
   pm2 logs hydroxbot
   ```

### Background Not Loading

**Problem:** Background is gradient instead of your image

**Solutions:**
1. Verify `WELCOME_BG_URL` in .env is correct
2. Make sure URL is direct link (ends with .gif, .png, .jpg)
3. Test URL in browser - should show image directly
4. Try re-uploading to Postimage

### Text Not Readable

**Problem:** Text is hard to read on background

**Solutions:**
1. Increase overlay opacity in `welcomeCard.js`:
   ```javascript
   ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';  // Darker overlay
   ```

2. Use a less busy background image
3. Increase text shadow:
   ```javascript
   ctx.shadowBlur = 30;  // More blur
   ```

### Welcome Not Sending

**Problem:** No welcome message when users join

**Solutions:**
1. Check `WELCOME_CHANNEL_ID` is set in .env
2. Verify channel exists and bot can see it
3. Check bot has "Send Messages" permission
4. Check bot has "Attach Files" permission
5. Look for errors in logs

### Canvas Installation Fails (Windows)

**Problem:** npm install @napi-rs/canvas fails

**Solutions:**
1. Install Visual Studio Build Tools:
   - Download from: https://visualstudio.microsoft.com/downloads/
   - Install "Desktop development with C++"

2. Or use windows-build-tools:
   ```bash
   npm install --global windows-build-tools
   ```

3. Then try again:
   ```bash
   npm install @napi-rs/canvas
   ```

---

## 📊 Example Welcome Messages

### With Custom Background
```
[Beautiful image with user avatar in center]
WELCOME TO
HYDROX
Community

Username
Member #123

Make sure to read the rules and have fun!
```

### Fallback (if image fails)
```
🎉 Welcome to HYDROX Community!

Hey @User! Welcome to HYDROX Community!

You are member #123

Make sure to read the rules and have fun!

[User avatar thumbnail]
[Background image]
```

---

## 🎯 Best Practices

### Background Image
- ✅ Use 1920x1080 resolution
- ✅ Not too busy or detailed
- ✅ Good contrast for text
- ✅ Represents your server theme
- ✅ File size under 5MB

### Channel Setup
- ✅ Dedicated welcome channel
- ✅ Bot has proper permissions
- ✅ Channel is visible to new members
- ✅ No other bots posting there

### Testing
- ✅ Test with /testwelcome first
- ✅ Test with alt account
- ✅ Check on mobile and desktop
- ✅ Verify text is readable

---

## 🔧 Advanced Customization

### Add More Decorations

```javascript
// In create() method, add:

// Add stars
ctx.fillStyle = '#ffffff';
for (let i = 0; i < 50; i++) {
    const x = Math.random() * this.width;
    const y = Math.random() * this.height;
    const size = Math.random() * 3;
    ctx.fillRect(x, y, size, size);
}
```

### Add Server Icon

```javascript
// Load server icon
const serverIcon = await loadImage(
    member.guild.iconURL({ extension: 'png', size: 256 })
);

// Draw in corner
ctx.drawImage(serverIcon, 50, 50, 100, 100);
```

### Add Role Count

```javascript
// Get role count
const roleCount = member.guild.roles.cache.size;

// Add text
ctx.fillText(`${roleCount} Roles Available`, this.width / 2, y);
```

### Animated GIF Support

Note: Canvas only captures first frame of GIFs. For animated backgrounds:
1. Use a static image
2. Or use a video background (requires different approach)
3. Or use Discord's native GIF support in embeds

---

## 📝 Files Structure

```
├── events/
│   └── guildMemberAdd.js      # Handles member joins
├── utils/
│   └── welcomeCard.js         # Image generation
├── commands/
│   └── testwelcome.js         # Test command
└── .env                       # Configuration
```

---

## 🎉 Examples from Premium Bots

Your welcome system now has features similar to:
- ✅ MEE6 Premium
- ✅ Welcomer Premium
- ✅ ProBot Premium
- ✅ Dyno Premium

But it's FREE and fully customizable!

---

## 📞 Need Help?

1. Check troubleshooting section above
2. Test with `/testwelcome` command
3. Check bot logs: `pm2 logs hydroxbot`
4. Verify .env configuration
5. Make sure canvas is installed

---

## ✅ Checklist

- [ ] Background image uploaded to Postimage
- [ ] WELCOME_CHANNEL_ID set in .env
- [ ] WELCOME_BG_URL set in .env
- [ ] @napi-rs/canvas installed
- [ ] Commands deployed (npm run deploy)
- [ ] Tested with /testwelcome
- [ ] Bot has Send Messages permission
- [ ] Bot has Attach Files permission
- [ ] Welcome channel is visible to new members

---

**Your premium welcome system is ready! 🎉**

Test it with `/testwelcome` and watch new members get an amazing first impression!
