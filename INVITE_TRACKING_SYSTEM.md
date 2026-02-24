# 🎉 Invite Tracking & Reward System

## Overview

A comprehensive invite tracking system that rewards members for growing the community with exclusive roles and celebrations!

## Features

✅ Automatic invite tracking
✅ Role rewards based on invite count
✅ Beautiful celebration announcements
✅ Invite leaderboard
✅ Manual invite adjustment (for existing inviters)
✅ Tracks valid, left, and fake invites
✅ Progress tracking to next role

## Invite Roles

| Role | Invites Required | Emoji |
|------|-----------------|-------|
| 𝐒𝐂𝐎𝐔𝐓 | 10 | 🔍 |
| 𝐑𝐄𝐂𝐑𝐔𝐈𝐓𝐄𝐑 | 25 | 📢 |
| 𝐀𝐌𝐁𝐀𝐒𝐒𝐀𝐃𝐎𝐑 | 50 | 🌟 |
| 𝐈𝐍𝐅𝐋𝐔𝐄𝐍𝐂𝐄𝐑 | 100 | 💎 |
| 𝐏𝐀𝐑𝐓𝐍𝐄𝐑 | 175 | 👑 |
| 𝐒𝐎𝐕𝐄𝐑𝐄𝐈𝐆𝐍 | 300+ | ⚡ |

## Commands

### `/invites [user]`
Check invite statistics for yourself or another user.

**Shows:**
- Total invites
- Valid invites (members still in server)
- Left invites (members who left)
- Earned roles
- Progress to next role
- All available roles

**Example:**
```
/invites
/invites @Username
```

### `/addinvites <user> <amount>` (Admin Only)
Add invites to a user manually. Perfect for users who invited people before this system was implemented.

**Parameters:**
- `user` - The user to add invites to
- `amount` - Number of invites to add (1-1000)

**Features:**
- Automatically grants earned roles
- Sends celebration announcements
- Logs the action

**Example:**
```
/addinvites @Username 50
```

### `/inviteleaderboard [limit]`
View the top inviters in the server.

**Parameters:**
- `limit` - Number of users to show (5-25, default: 10)

**Shows:**
- Top inviters with medals (🥇🥈🥉)
- Valid and total invites
- Highest role earned
- Role milestones

**Example:**
```
/inviteleaderboard
/inviteleaderboard 20
```

## How It Works

### Automatic Tracking

1. **Member Joins**
   - Bot detects which invite was used
   - Credits the inviter with +1 valid invite
   - Checks if inviter earned any new roles
   - Sends celebration if role earned

2. **Member Leaves**
   - Decrements inviter's valid invites
   - Moves count to "left invites"
   - Does NOT remove roles (once earned, always kept)

3. **Role Granting**
   - Automatic when invite threshold reached
   - Grants all earned roles at once
   - Sends celebration announcement
   - Tags @everyone, @𝐌𝐄𝐌𝐁𝐄𝐑, user, and new role

### Celebration Announcements

When a user earns a new invite role, a beautiful celebration message is sent to channel `1409519478391181362`:

**Features:**
- Premium embed with role-specific colors
- User avatar and server banner
- Total invites and required amount
- Progress to next role
- Tags everyone and the user
- Professional and modern design

**Example Celebration:**
```
🎊 NEW INVITE MILESTONE ACHIEVED! 🎊

CONGRATULATIONS!

@Username has reached 50 invites and earned the prestigious 𝐀𝐌𝐁𝐀𝐒𝐒𝐀𝐃𝐎𝐑 role!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌟 Role Earned: @𝐀𝐌𝐁𝐀𝐒𝐒𝐀𝐃𝐎𝐑
📊 Total Invites: 50
🎯 Required: 50

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Thank you for growing our community! 💪
Keep inviting to unlock even more exclusive roles!

🎯 Next Milestone: 𝐈𝐍𝐅𝐋𝐔𝐄𝐍𝐂𝐄𝐑
50 / 100 invites • 50 more to go!
```

## Database Structure

### `invites` Table
Stores invite statistics for each user:
- `user_id` - Discord user ID
- `total_invites` - Total invites (valid + left + fake)
- `valid_invites` - Members still in server
- `left_invites` - Members who left
- `fake_invites` - Suspicious invites
- `last_updated` - Last update timestamp

### `invite_roles_granted` Table
Tracks which roles have been granted:
- `user_id` - Discord user ID
- `role_name` - Name of the role
- `invites_required` - Invites needed for role
- `granted_at` - When role was granted

## Setup Instructions

### 1. Enable Required Intents
✅ Already enabled in `index.js`:
- `GuildInvites` - Track invite usage

### 2. Configure Environment
✅ Already added to `.env`:
```env
INVITE_CELEBRATION_CHANNEL_ID=1409519478391181362
```

### 3. Create Roles
Make sure these roles exist in your Discord server:
- 𝐒𝐂𝐎𝐔𝐓
- 𝐑𝐄𝐂𝐑𝐔𝐈𝐓𝐄𝐑
- 𝐀𝐌𝐁𝐀𝐒𝐒𝐀𝐃𝐎𝐑
- 𝐈𝐍𝐅𝐋𝐔𝐄𝐍𝐂𝐄𝐑
- 𝐏𝐀𝐑𝐓𝐍𝐄𝐑
- 𝐒𝐎𝐕𝐄𝐑𝐄𝐈𝐆𝐍

**Important:** Role names must match exactly (including special characters)!

### 4. Bot Permissions
Ensure bot has these permissions:
- ✅ Manage Roles
- ✅ View Channels
- ✅ Send Messages
- ✅ Embed Links
- ✅ Mention @everyone
- ✅ Manage Guild (for invite tracking)

### 5. Deploy Commands
```bash
node deploy-commands.js
```

### 6. Restart Bot
```bash
node index.js
```

## For Existing Inviters

If you have users who invited people BEFORE this system was implemented:

1. Check their current invite count in Discord:
   - Server Settings → Invites
   - Find their invite codes and count uses

2. Add invites manually:
   ```
   /addinvites @Username 50
   ```

3. Bot will:
   - Add the invites to their count
   - Grant all earned roles
   - Send celebration announcements

## Files Created/Modified

### New Files:
- ✅ `utils/inviteTracker.js` - Invite tracking logic
- ✅ `commands/invites.js` - Check invite stats
- ✅ `commands/addinvites.js` - Manual invite adjustment
- ✅ `commands/inviteleaderboard.js` - Leaderboard display

### Modified Files:
- ✅ `utils/database.js` - Added invite tables
- ✅ `utils/logger.js` - Added celebration embeds
- ✅ `events/guildMemberAdd.js` - Track invites on join
- ✅ `events/ready.js` - Cache invites on startup
- ✅ `index.js` - Added GuildInvites intent
- ✅ `.env` - Added celebration channel ID

## Testing

### Test Invite Tracking
1. Create an invite link
2. Use it to join with an alt account
3. Check invites: `/invites`
4. Should show +1 valid invite

### Test Role Granting
1. Add invites to reach a threshold:
   ```
   /addinvites @YourName 10
   ```
2. Should grant 𝐒𝐂𝐎𝐔𝐓 role
3. Should send celebration to channel 1409519478391181362

### Test Leaderboard
```
/inviteleaderboard
```
Should show users with invites

## Troubleshooting

### Invites Not Tracking
- Check bot has "Manage Guild" permission
- Verify GuildInvites intent is enabled
- Check console for errors

### Roles Not Granted
- Verify role names match exactly
- Check bot has "Manage Roles" permission
- Ensure bot's role is higher than invite roles

### Celebrations Not Sending
- Verify channel ID: 1409519478391181362
- Check bot has permissions in that channel
- Verify INVITE_CELEBRATION_CHANNEL_ID in .env

### Member Role Not Tagged
- Update member role ID in code if different
- Current ID: 1409517032231276614

## Statistics

Track your community growth:
- Total invites across all users
- Top inviters
- Role distribution
- Invite conversion rate

## Future Enhancements

Possible additions:
- Invite rewards (currency, perks)
- Bonus invites for events
- Invite goals and challenges
- Weekly/monthly invite contests
- Invite analytics dashboard

## Summary

✅ Automatic invite tracking
✅ 6 reward roles (10-300+ invites)
✅ Beautiful celebrations with @everyone tags
✅ Manual invite adjustment for existing inviters
✅ Leaderboard system
✅ Progress tracking
✅ Professional embeds

The system is ready to use! Start inviting and earning roles! 🎉
