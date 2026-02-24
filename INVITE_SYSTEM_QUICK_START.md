# 🚀 Invite System - Quick Start Guide

## ✅ System Status: READY!

The invite tracking system is now installed and running!

```
✅ Bot is online as HYDROX - Community#5619
[InviteTracker] Cached 210 invites for 𝐇𝐘𝐃𝐑𝐎𝐗 - 𝐂𝐨𝐦𝐦𝐮𝐧𝐢𝐭𝐲
```

## Next Steps

### 1. Deploy New Commands
```bash
node deploy-commands.js
```

This will add 3 new commands:
- `/invites` - Check invite stats
- `/addinvites` - Add invites manually (Admin)
- `/inviteleaderboard` - View top inviters

### 2. Verify Roles Exist

Make sure these roles exist in your Discord server with EXACT names:
- ✅ 𝐒𝐂𝐎𝐔𝐓 (10 invites)
- ✅ 𝐑𝐄𝐂𝐑𝐔𝐈𝐓𝐄𝐑 (25 invites)
- ✅ 𝐀𝐌𝐁𝐀𝐒𝐒𝐀𝐃𝐎𝐑 (50 invites)
- ✅ 𝐈𝐍𝐅𝐋𝐔𝐄𝐍𝐂𝐄𝐑 (100 invites)
- ✅ 𝐏𝐀𝐑𝐓𝐍𝐄𝐑 (175 invites)
- ✅ 𝐒𝐎𝐕𝐄𝐑𝐄𝐈𝐆𝐍 (300+ invites)

### 3. Add Invites for Existing Inviters

For users who invited people BEFORE this system:

1. Check their Discord invite count:
   - Server Settings → Invites
   - Find their invite codes
   - Count total uses

2. Add invites with command:
   ```
   /addinvites @Username 50
   ```

3. Bot will automatically:
   - ✅ Add invites to their count
   - ✅ Grant all earned roles
   - ✅ Send celebration announcements

### 4. Test the System

#### Test Invite Checking:
```
/invites
/invites @Username
```

#### Test Manual Addition:
```
/addinvites @YourName 10
```
Should grant 𝐒𝐂𝐎𝐔𝐓 role and send celebration!

#### Test Leaderboard:
```
/inviteleaderboard
```

## How It Works

### When Someone Joins:
1. Bot detects which invite was used
2. Credits inviter with +1 valid invite
3. Checks if inviter earned new roles
4. Sends celebration to channel `1409519478391181362`
5. Tags @everyone, @𝐌𝐄𝐌𝐁𝐄𝐑, user, and new role

### When Someone Leaves:
1. Decrements inviter's valid invites
2. Moves to "left invites" count
3. Does NOT remove earned roles

## Celebration Example

When someone earns a role, this appears in channel `1409519478391181362`:

```
🎊 NEW INVITE MILESTONE ACHIEVED! 🎊

CONGRATULATIONS!

@Username has reached 50 invites and earned the 𝐀𝐌𝐁𝐀𝐒𝐒𝐀𝐃𝐎𝐑 role!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌟 Role Earned: @𝐀𝐌𝐁𝐀𝐒𝐒𝐀𝐃𝐎𝐑
📊 Total Invites: 50
🎯 Required: 50

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Thank you for growing our community! 💪

🎯 Next Milestone: 𝐈𝐍𝐅𝐋𝐔𝐄𝐍𝐂𝐄𝐑
50 / 100 invites • 50 more to go!
```

Plus a message tagging:
```
@everyone @𝐌𝐄𝐌𝐁𝐄𝐑 @Username @𝐀𝐌𝐁𝐀𝐒𝐒𝐀𝐃𝐎𝐑
```

## Commands Reference

### `/invites [user]`
Check invite statistics
- Shows total, valid, and left invites
- Shows earned roles
- Shows progress to next role

### `/addinvites <user> <amount>` (Admin Only)
Add invites manually
- For existing inviters
- Grants roles automatically
- Sends celebrations

### `/inviteleaderboard [limit]`
View top inviters
- Shows medals for top 3
- Shows valid and total invites
- Shows highest role earned

## Important Notes

### Bot Permissions Required:
- ✅ Manage Roles
- ✅ Manage Guild (for invite tracking)
- ✅ Send Messages
- ✅ Embed Links
- ✅ Mention @everyone

### Role Hierarchy:
- Bot's role must be HIGHER than invite roles
- Otherwise it can't grant them

### Celebration Channel:
- Channel ID: `1409519478391181362`
- Bot must have permissions there
- Configured in `.env`

## Troubleshooting

### "Role not found in server"
- Check role names match EXACTLY
- Including special characters
- Case sensitive

### Roles not granted
- Check bot has "Manage Roles" permission
- Check bot's role is higher than invite roles
- Check console for errors

### Celebrations not sending
- Verify channel ID: 1409519478391181362
- Check bot permissions in that channel
- Check INVITE_CELEBRATION_CHANNEL_ID in .env

## What's Tracking

The bot is now tracking:
- ✅ 210 invites cached
- ✅ Who invited each new member
- ✅ Valid invites (members still here)
- ✅ Left invites (members who left)
- ✅ Role milestones
- ✅ Leaderboard rankings

## Ready to Use!

The system is fully operational. Just:
1. Deploy commands
2. Verify roles exist
3. Add invites for existing inviters
4. Start inviting!

🎉 Let the invite competition begin! 🎉
