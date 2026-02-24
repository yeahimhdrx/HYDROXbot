# 🤖 Bot Messaging Commands - Send Messages as the Bot

## Overview

Three powerful admin-only commands to send messages as the bot in any channel.

## Commands

### 1. `/say` - Simple Text Messages

Send plain text messages as the bot.

**Usage:**
```
/say message:"Your message here" [channel:#channel-name]
```

**Parameters:**
- `message` (required) - The text message to send
- `channel` (optional) - Channel to send in (defaults to current channel)

**Examples:**
```
/say message:"Welcome to our server!"
/say message:"Server maintenance in 1 hour" channel:#announcements
/say message:"Good morning everyone! 🌅"
```

**Features:**
- ✅ Send as bot in any channel
- ✅ Admin only
- ✅ Logs who sent the message
- ✅ Checks bot permissions

---

### 2. `/embed` - Rich Embed Messages

Send beautiful embed messages with customization.

**Usage:**
```
/embed title:"Title" description:"Description" [color:blue] [image:url] [thumbnail:url] [channel:#channel]
```

**Parameters:**
- `title` (required) - Embed title
- `description` (required) - Embed description/content
- `color` (optional) - Color name or hex code
- `image` (optional) - Large image URL
- `thumbnail` (optional) - Small thumbnail URL
- `channel` (optional) - Channel to send in

**Color Options:**
- Names: `blue`, `red`, `green`, `yellow`, `purple`, `pink`, `orange`, `cyan`, `gold`, `black`, `white`
- Hex codes: `#00d4ff`, `#e74c3c`, etc.

**Examples:**
```
/embed title:"Server Rules" description:"1. Be respectful\n2. No spam\n3. Have fun!" color:blue

/embed title:"New Update!" description:"Check out our latest features!" color:#00d4ff image:https://example.com/image.png

/embed title:"Welcome" description:"Thanks for joining!" thumbnail:https://example.com/logo.png channel:#welcome
```

**Features:**
- ✅ Professional embeds
- ✅ Custom colors
- ✅ Images and thumbnails
- ✅ Server branding (footer)
- ✅ Timestamp

---

### 3. `/announce` - Professional Announcements

Send styled announcements with predefined templates.

**Usage:**
```
/announce title:"Title" message:"Message" [type:event] [channel:#channel] [ping_everyone:true]
```

**Parameters:**
- `title` (required) - Announcement title
- `message` (required) - Announcement content
- `type` (optional) - Announcement style
- `channel` (optional) - Channel to send in
- `ping_everyone` (optional) - Ping @everyone (default: false)

**Announcement Types:**

| Type | Emoji | Color | Use For |
|------|-------|-------|---------|
| 📢 General | 📢 | Cyan | General announcements |
| 🎉 Event | 🎉 | Purple | Events, parties, gatherings |
| ⚠️ Important | ⚠️ | Red | Critical information |
| 🔔 Update | 🔔 | Blue | Bot/server updates |
| 🎮 Gaming | 🎮 | Green | Gaming events, tournaments |
| 🎁 Giveaway | 🎁 | Gold | Giveaways, contests |

**Examples:**
```
/announce title:"Server Event Tonight!" message:"Join us at 8 PM for game night!" type:event

/announce title:"Important Update" message:"Server rules have been updated. Please review them." type:important ping_everyone:true

/announce title:"New Giveaway!" message:"React to win a Nitro gift!" type:giveaway channel:#giveaways
```

**Features:**
- ✅ Professional styling
- ✅ 6 predefined templates
- ✅ Optional @everyone ping
- ✅ Server branding
- ✅ Shows who posted
- ✅ Timestamp

---

## Security

### Admin Only
All commands require **Administrator** permission:
- Double-checked in code
- Set in Discord permissions
- Logged for audit trail

### Permission Checks
Bot verifies it has permissions before sending:
- Send Messages
- Embed Links
- Mention Everyone (for @everyone pings)

### Audit Logging
All messages sent are logged:
```
[Say] Username#1234 sent message as bot in #general: "Hello everyone..."
[Embed] Username#1234 sent embed as bot in #announcements: "Server Rules"
[Announce] Username#1234 sent event announcement in #events: "Game Night"
```

---

## Use Cases

### Server Announcements
```
/announce title:"Maintenance Notice" message:"Server will be down for 30 minutes at 3 PM EST" type:important ping_everyone:true
```

### Welcome Messages
```
/say message:"Welcome to HYDROX Community! Make sure to read the rules and introduce yourself!" channel:#welcome
```

### Event Notifications
```
/announce title:"Movie Night!" message:"Join us in voice chat at 8 PM to watch a movie together! 🍿" type:event channel:#events
```

### Rules and Info
```
/embed title:"📜 Server Rules" description:"1. Be respectful to all members\n2. No spam or self-promotion\n3. Keep conversations appropriate\n4. Follow Discord ToS\n5. Have fun!" color:blue channel:#rules
```

### Updates
```
/announce title:"Bot Update v2.0" message:"New features:\n• Invite tracking\n• Enhanced logging\n• Voice rewards\n\nCheck them out!" type:update
```

### Giveaways
```
/announce title:"🎁 Nitro Giveaway!" message:"React with 🎉 to enter!\nWinner announced in 24 hours!" type:giveaway ping_everyone:true
```

---

## Tips

### Formatting
Use Discord markdown in messages:
- **Bold**: `**text**`
- *Italic*: `*text*`
- `Code`: `` `text` ``
- Line breaks: `\n`

### Emojis
Use emojis in any message:
```
/say message:"Good morning! ☀️ Have a great day! 🎉"
```

### Multiple Lines
Use `\n` for line breaks:
```
/embed title:"Info" description:"Line 1\nLine 2\nLine 3"
```

### Images
Use direct image URLs:
```
/embed title:"Check this out!" description:"Cool image below" image:https://i.imgur.com/example.png
```

---

## Deployment

### 1. Deploy Commands
```bash
node deploy-commands.js
```

### 2. Verify Permissions
Make sure bot has:
- ✅ Send Messages
- ✅ Embed Links
- ✅ Mention Everyone (for @everyone)

### 3. Test Commands
```
/say message:"Test message"
/embed title:"Test" description:"Testing embed"
/announce title:"Test" message:"Testing announcement" type:general
```

---

## Files Created

- ✅ `commands/say.js` - Simple text messages
- ✅ `commands/embed.js` - Rich embeds
- ✅ `commands/announce.js` - Professional announcements

---

## Summary

Three powerful commands to communicate as the bot:

1. **`/say`** - Quick text messages
2. **`/embed`** - Beautiful embeds with customization
3. **`/announce`** - Professional announcements with templates

All admin-only, secure, and logged! 🎉
