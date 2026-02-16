# 👁️ Audit Log Tracking - Who Did What

## New Feature: Executor Tracking

Your bot now tracks and displays **who performed moderation actions** on users in voice channels!

## 🎯 What's Tracked

### 1. Voice Channel Moves
When a user is moved between voice channels by a moderator:

**Before:**
```
🔄 Voice Channel Switched
@Username moved between voice channels
📤 From: General Voice
📥 To: AFK
```

**After:**
```
🔄 Voice Channel Switched
@Username was moved by ModeratorName
📤 From: General Voice
📥 To: AFK
👤 Moved By: ModeratorName
```

### 2. Server Mute
When a moderator mutes a user:

**Before:**
```
🔇 Voice Muted
@Username was server muted
📢 Channel: General Voice
🎯 Type: ⚠️ Server Mute
```

**After:**
```
🔇 Voice Muted
@Username was muted by ModeratorName
📢 Channel: General Voice
🎯 Type: ⚠️ Server Mute
👤 Muted By: ModeratorName
```

### 3. Server Unmute
When a moderator unmutes a user:

```
🔊 Voice Unmuted
@Username was unmuted by ModeratorName
📢 Channel: General Voice
🎯 Type: ✅ Server Unmute
👤 Unmuted By: ModeratorName
```

### 4. Server Deafen
When a moderator deafens a user:

```
🔇 Voice Deafened
@Username was deafened by ModeratorName
📢 Channel: General Voice
🎯 Type: ⚠️ Server Deafen
👤 Deafened By: ModeratorName
```

### 5. Server Undeafen
When a moderator undeafens a user:

```
🔊 Voice Undeafened
@Username was undeafened by ModeratorName
📢 Channel: General Voice
🎯 Type: ✅ Server Undeafen
👤 Undeafened By: ModeratorName
```

## 🔍 How It Works

### Audit Log Integration
The bot uses Discord's Audit Log API to:
1. Detect when a moderation action occurs
2. Find the most recent audit log entry
3. Match it to the user and action
4. Display the moderator's name

### Smart Detection
- Only shows executor for **server actions** (not self-actions)
- Checks audit logs within 5 seconds of the action
- Falls back to generic message if audit log unavailable
- Handles permission errors gracefully

## 📊 Action Types

### Self Actions (No Executor)
When users do things themselves:
- Self mute: "muted themselves"
- Self unmute: "unmuted themselves"
- Self deafen: "deafened themselves"
- Self undeafen: "undeafened themselves"
- Channel switch: "moved between voice channels"

### Server Actions (Shows Executor)
When moderators do things to users:
- Server mute: "was muted by ModeratorName"
- Server unmute: "was unmuted by ModeratorName"
- Server deafen: "was deafened by ModeratorName"
- Server undeafen: "was undeafened by ModeratorName"
- Force move: "was moved by ModeratorName"

## 🔒 Required Permissions

For executor tracking to work, the bot needs:
- ✅ **View Audit Log** permission
- ✅ Access to the guild's audit logs

If the bot doesn't have these permissions:
- Actions will still be logged
- Executor name won't be shown
- Generic message will be used instead

## 💡 Use Cases

### Moderation Accountability
- See which staff member performed actions
- Track moderation patterns
- Review staff actions
- Resolve disputes

### Incident Investigation
- "Who moved this user to AFK?"
- "Who muted this person?"
- "When did this happen?"
- Full audit trail available

### Staff Training
- Monitor new moderators
- Review moderation decisions
- Provide feedback
- Ensure proper procedures

## 🎨 Visual Examples

### User Moved by Moderator
```
🔄 Voice Channel Switched
@TroubleMaker was moved by @StaffMember
📤 From: General Voice
📥 To: Timeout Room
👤 Moved By: StaffMember#1234
User ID: 123456789
```

### User Muted by Moderator
```
🔇 Voice Muted
@LoudUser was muted by @Moderator
📢 Channel: General Voice
🎯 Type: ⚠️ Server Mute
👤 Muted By: Moderator#5678
User ID: 987654321
```

### User Self-Muted (No Executor)
```
🔇 Voice Muted
@QuietUser muted themselves
📢 Channel: General Voice
🎯 Type: 🔇 Self Mute
User ID: 456789123
```

## 🚀 Benefits

### For Staff
- Full transparency of actions
- Easy to track who did what
- Accountability built-in
- Professional logging

### For Admins
- Monitor staff activity
- Review moderation quality
- Investigate incidents
- Maintain standards

### For Community
- Fair moderation
- Clear records
- Dispute resolution
- Trust building

## ⚙️ Technical Details

### Audit Log Types Used
- Type 24: MEMBER_UPDATE (mute/deafen)
- Type 26: MEMBER_MOVE (channel moves)

### Timing Window
- Checks audit logs within 5 seconds
- Prevents false matches
- Ensures accuracy

### Error Handling
- Gracefully handles missing permissions
- Falls back to generic messages
- Doesn't crash on errors
- Logs issues to console

## 📝 Notes

- Executor tracking only works for **server actions**
- Self-actions (user does it themselves) don't show executor
- Requires "View Audit Log" permission
- Works in real-time as actions happen
- All data comes from Discord's official audit logs

## 🎯 Summary

Your bot now provides **complete accountability** for all voice moderation actions. Every server mute, deafen, and move is tracked with the moderator's name, giving you full transparency and a professional audit trail.

Test it by:
1. Having a moderator move someone between channels
2. Having a moderator server-mute someone
3. Check your log channel - you'll see who did it!
