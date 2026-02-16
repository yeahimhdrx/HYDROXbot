# Quick Start Guide

Fast setup for HYDROX Bot if you already have a Discord bot created.

## Prerequisites
- Node.js installed
- Discord bot created with token
- Bot invited to server with proper permissions

## 5-Minute Setup

### 1. Configure Environment
```bash
copy .env.example .env
```

Edit `.env`:
```
DISCORD_TOKEN=your_bot_token
CLIENT_ID=your_bot_client_id
GUILD_ID=your_server_id
LOG_CHANNEL_ID=your_log_channel_id
```

### 2. Install & Deploy
```bash
npm install
npm run deploy
npm start
```

### 3. Create These Roles in Discord
- 𝐅𝐑𝐈𝐄𝐍𝐃𝐒
- 𝐀𝐒𝐂𝐄𝐍𝐃𝐀𝐍𝐓
- 𝐄𝐏𝐈𝐂
- 𝐋𝐄𝐆𝐄𝐍𝐃
- 𝐄𝐋𝐈𝐓𝐄
- 𝐂𝐇𝐀𝐌𝐏𝐈𝐎𝐍
- 𝐌𝐘𝐓𝐇𝐈𝐂

**Important:** Bot's role must be ABOVE these roles!

### 4. Test
```
/stats - Check your stats
/ping - Test bot response
```

## Bot Permissions Required
- Manage Roles
- Send Messages
- Embed Links
- View Channels
- Read Message History

## Gateway Intents Required (Developer Portal)
- Presence Intent
- Server Members Intent
- Message Content Intent

Done! The bot is now tracking voice activity.
