# Welcome System - Quick Setup (5 Minutes)

Get your premium welcome system running in 5 minutes!

---

## 🚀 Quick Steps

### 1. Upload Background (2 min)

1. Go to https://postimages.org/
2. Upload your GIF/image (1920x1080 recommended)
3. Copy the **Direct Link**
4. Example: `https://i.postimg.cc/abc123/background.gif`

### 2. Configure .env (1 min)

Add to your `.env` file:

```env
WELCOME_CHANNEL_ID=your_welcome_channel_id_here
WELCOME_BG_URL=https://i.postimg.cc/your-image-url.gif
WELCOME_DM_ENABLED=false
```

**How to get Channel ID:**
1. Enable Developer Mode in Discord (Settings → Advanced)
2. Right-click your welcome channel
3. Click "Copy Channel ID"

### 3. Install Package (1 min)

```bash
npm install @napi-rs/canvas
```

### 4. Deploy & Test (1 min)

```bash
# Deploy new commands
npm run deploy

# Restart bot
pm2 restart hydroxbot

# Test in Discord
/testwelcome      # Test welcome card
/testwelcomedm    # Test welcome DM
```

---

## ✅ Done!

Your welcome system is ready! When someone joins:

1. **Channel Message** - Tags user with beautiful custom image
2. **Welcome DM** - Sends beautiful embed with server logo and info
3. **Log Entry** - Records join in log channel

- ✨ Beautiful custom image
- 🖼️ Their profile picture in the center
- 💎 Professional design
- 🎯 Member count
- 📝 Welcome message

---

## 🎨 What It Looks Like

```
┌─────────────────────────────────────────┐
│                                         │
│         WELCOME TO                      │
│         HYDROX                          │
│         Community                       │
│                                         │
│           ╭─────────╮                   │
│           │  USER   │                   │
│           │  AVATAR │                   │
│           ╰─────────╯                   │
│                                         │
│         Username                        │
│         Member #123                     │
│                                         │
│  Make sure to read the rules!          │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🧪 Test It

```
/testwelcome        # Test welcome card in channel
/testwelcomedm      # Test welcome DM message
```

Both show exactly what new members will see!

---

## 🆘 Issues?

### Canvas won't install (Windows)
```bash
npm install --global windows-build-tools
npm install @napi-rs/canvas
```

### Image not showing
- Check WELCOME_BG_URL is correct
- Make sure it's a direct link (ends with .gif/.png/.jpg)
- Test URL in browser

### No welcome message
- Check WELCOME_CHANNEL_ID is correct
- Bot needs "Send Messages" and "Attach Files" permissions
- Check logs: `pm2 logs hydroxbot`

---

## 📚 Full Documentation

See **WELCOME_SYSTEM.md** for:
- Detailed customization
- Color changes
- Text changes
- Advanced features
- Troubleshooting

---

**That's it! Your premium welcome system is ready! 🎉**
