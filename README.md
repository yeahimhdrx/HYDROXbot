# HYDROX Bot

A voice activity tracking bot for HYDROX Community Server. Automatically grants roles based on voice chat time and tag usage.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`:
```bash
copy .env.example .env
```

3. Add your bot credentials to `.env`

4. Deploy slash commands:
```bash
node deploy-commands.js
```

5. Start the bot:
```bash
node index.js
```

## Project Structure

```
├── commands/          # Slash commands
├── events/           # Discord event handlers
├── utils/            # Utility functions and database
├── data/             # SQLite database storage
├── index.js          # Main bot file
└── deploy-commands.js # Command deployment script
```

## Adding New Commands

Create a new file in `commands/` folder:

```js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('commandname')
        .setDescription('Command description'),
    async execute(interaction) {
        await interaction.reply('Response');
    },
};
```

Then run `node deploy-commands.js` to register it.


## Role System

The bot automatically grants roles based on voice activity:

| Role | Hours Required | Tag Required |
|------|----------------|--------------|
| 𝐅𝐑𝐈𝐄𝐍𝐃𝐒 | 20h | No |
| 𝐀𝐒𝐂𝐄𝐍𝐃𝐀𝐍𝐓 | 40h | No |
| 𝐄𝐏𝐈𝐂 | 60h | No |
| 𝐋𝐄𝐆𝐄𝐍𝐃 | 100h | Yes |
| 𝐄𝐋𝐈𝐓𝐄 | 200h | Yes |
| 𝐂𝐇𝐀𝐌𝐏𝐈𝐎𝐍 | 300h | Yes |
| 𝐌𝐘𝐓𝐇𝐈𝐂 | 400h | No |

## Commands

- `/stats [user]` - Check voice activity and role progress
- `/settag add/remove/check <user>` - (Admin) Manage HDRX tag status for users
- `/checkroles` - (Admin) Manually check and grant roles for all members
- `/voicetime add/set <user> <hours>` - (Admin) Manage user voice time
- `/ping` - Check bot latency

## Features

- Automatic voice time tracking
- Role progression system with 7 tiers
- DM notifications when roles are granted
- Previous roles are kept when earning higher roles
- Automatic HDRX tag detection (checks username/display name)
- All bot activities logged to configured channel
- Admin commands for manual adjustments
- Manual HDRX tag management (Discord API doesn't expose server tags)

## Configuration

1. Set up your `.env` file with:
   - `DISCORD_TOKEN` - Your bot token
   - `CLIENT_ID` - Your bot's client ID
   - `LOG_CHANNEL_ID` - Channel ID where voice and member events will be logged
   - `ROLE_LOG_CHANNEL_ID` - Channel ID where all role changes will be logged (optional, separate from main logs)

2. Create these exact role names in your Discord server:
   - 𝐅𝐑𝐈𝐄𝐍𝐃𝐒
   - 𝐀𝐒𝐂𝐄𝐍𝐃𝐀𝐍𝐓
   - 𝐄𝐏𝐈𝐂
   - 𝐋𝐄𝐆𝐄𝐍𝐃
   - 𝐄𝐋𝐈𝐓𝐄
   - 𝐂𝐇𝐀𝐌𝐏𝐈𝐎𝐍
   - 𝐌𝐘𝐓𝐇𝐈𝐂

3. The bot tracks HDRX tag status manually via `/settag` command (Discord API doesn't expose server tags to bots)

## Managing HDRX Tags

Since Discord doesn't expose server tags to bots, you'll need to manually track who's using the HDRX tag:

```
/settag add @user    - Mark user as using HDRX tag
/settag remove @user - Mark user as not using HDRX tag
/settag check @user  - Check user's tag status
```

When users equip or remove the HDRX server tag, use these commands to update their status.
