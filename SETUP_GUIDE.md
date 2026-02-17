# HYDROX Bot Setup Guide

Complete step-by-step guide to get your bot running on the HYDROX Community Server.

## Step 1: Create Discord Bot Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Name it "HYDROX Bot" and click "Create"
4. Go to the "Bot" tab on the left
5. Click "Add Bot" and confirm
6. Under "Privileged Gateway Intents", enable:
   - ✅ PRESENCE INTENT
   - ✅ SERVER MEMBERS INTENT
   - ✅ MESSAGE CONTENT INTENT
7. Click "Save Changes"
8. Under "Token", click "Reset Token" and copy it (you'll need this later)

## Step 2: Get Your Bot's Client ID

1. Still in the Developer Portal, go to "OAuth2" tab
2. Copy your "CLIENT ID" (you'll need this later)

## Step 3: Invite Bot to Your Server

1. In Developer Portal, go to "OAuth2" → "URL Generator"
2. Select these scopes:
   - ✅ bot
   - ✅ applications.commands
3. Select these bot permissions:
   - ✅ Manage Roles
   - ✅ Send Messages
   - ✅ Embed Links
   - ✅ Read Message History
   - ✅ View Channels
4. Copy the generated URL at the bottom
5. Paste it in your browser and select your HYDROX server
6. Click "Authorize"

## Step 4: Create Roles in Your Discord Server

Create these exact role names in your Discord server (Server Settings → Roles):

1. 𝐅𝐑𝐈𝐄𝐍𝐃𝐒
2. 𝐀𝐒𝐂𝐄𝐍𝐃𝐀𝐍𝐓
3. 𝐄𝐏𝐈𝐂
4. 𝐋𝐄𝐆𝐄𝐍𝐃
5. 𝐄𝐋𝐈𝐓𝐄
6. 𝐂𝐇𝐀𝐌𝐏𝐈𝐎𝐍
7. 𝐌𝐘𝐓𝐇𝐈𝐂

**IMPORTANT:** Make sure the bot's role is ABOVE these roles in the role hierarchy!

## Step 5: Create Log Channel

1. Create a text channel in your server (e.g., "bot-logs" or "hydrox-logs")
2. Right-click the channel → "Copy Channel ID"
   - If you don't see this option, enable Developer Mode:
     - User Settings → Advanced → Developer Mode (toggle ON)
3. Save this Channel ID for later

## Step 6: Get Your Server (Guild) ID

1. Right-click your server icon → "Copy Server ID"
2. Save this for later

## Step 7: Configure the Bot

1. In your bot folder, copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```

2. Open `.env` file and fill in your values:
   ```
   DISCORD_TOKEN=your_bot_token_from_step_1
   CLIENT_ID=your_client_id_from_step_2
   GUILD_ID=your_server_id_from_step_6
   LOG_CHANNEL_ID=your_log_channel_id_from_step_5
   ```

## Step 8: Install Dependencies

Open terminal in your bot folder and run:
```bash
npm install
```

## Step 9: Deploy Slash Commands

Register the bot's commands with Discord:
```bash
npm run deploy
```

You should see: "✅ Successfully reloaded X application (/) commands."

## Step 10: Start the Bot

```bash
npm start
```

You should see:
- "✅ Bot is online as HYDROX Bot#1234"
- A message in your log channel saying the bot is online

## Step 11: Test the Bot

1. Join a voice channel in your server
2. Stay for a minute, then leave
3. Check your log channel - you should see join/leave messages
4. Run `/stats` to check your voice time
5. Test admin commands:
   - `/settag add @yourself` (if you have admin)
   - `/voicetime add @yourself 20` to test role granting

## Troubleshooting

### Bot doesn't respond to commands
- Make sure you ran `npm run deploy`
- Check bot has "Use Application Commands" permission
- Restart the bot

### Bot can't grant roles
- Check bot's role is ABOVE the roles it needs to grant
- Verify bot has "Manage Roles" permission

### No logs in channel
- Verify LOG_CHANNEL_ID is correct in .env
- Check bot can see and send messages in that channel

### Voice tracking not working
- Verify "SERVER MEMBERS INTENT" is enabled in Developer Portal
- Make sure bot has permission to view voice channels

## Daily Usage

### When someone uses HDRX tag:
```
/settag add @user
```

### When someone removes HDRX tag:
```
/settag remove @user
```

### To manually adjust voice time:
```
/voicetime add @user 10    (adds 10 hours)
/voicetime set @user 50    (sets to 50 hours)
```

### To force role check:
```
/checkroles
```

## Role Requirements Reminder

| Role | Hours | HDRX Tag |
|------|-------|----------|
| 𝐅𝐑𝐈𝐄𝐍𝐃𝐒 | 20h | ❌ |
| 𝐀𝐒𝐂𝐄𝐍𝐃𝐀𝐍𝐓 | 40h | ❌ |
| 𝐄𝐏𝐈𝐂 | 60h | ❌ |
| 𝐋𝐄𝐆𝐄𝐍𝐃 | 100h | ✅ Yes |
| 𝐄𝐋𝐈𝐓𝐄 | 200h | ✅ Yes |
| 𝐂𝐇𝐀𝐌𝐏𝐈𝐎𝐍 | 300h | ✅ Yes |
| 𝐌𝐘𝐓𝐇𝐈𝐂 | 400h | ❌ No |

## Need Help?

- Check console logs for errors
- Verify all IDs in .env are correct
- Make sure bot has proper permissions
- Ensure role hierarchy is correct (bot role above granted roles)
