# 📊 HYDROX Bot - Advanced Logging System

## Overview
Your bot now has a comprehensive, professional logging system that tracks EVERYTHING happening in your Discord server.

## 🎨 Modern Features
- ✅ Beautiful color-coded embeds
- ✅ User avatars in logs
- ✅ Timestamps on every event
- ✅ User IDs for easy reference
- ✅ Professional formatting
- ✅ Clear categorization

## 📝 What Gets Logged

### 🎭 Role Events
- **Role Granted** (Green) - When users earn roles through voice time
- **Role Added** (Light Green) - Any role manually added to a user
- **Role Removed** (Red) - Any role removed from a user
- Shows: User, Role name, Who did it, User ID

### 🎤 Voice Channel Events
- **Joined Voice** (Blue) - User joins any voice channel
- **Left Voice** (Gray) - User leaves voice channel + session time + total hours
- **Moved Channels** (Yellow) - User switches between voice channels
- Shows: User, Channel name(s), Session stats

### 🔇 Voice State Changes
- **Muted** (Red) - Server mute or self-mute
- **Unmuted** (Green) - Server unmute or self-unmute
- **Deafened** (Red) - Server deafen or self-deafen
- **Undeafened** (Green) - Server undeafen or self-undeafen
- Shows: User, Channel, Type (self or server action)

### 📹 Streaming & Video
- **Started Streaming** (Purple) - User starts screen share
- **Stopped Streaming** (Gray) - User stops screen share
- **Camera On** (Blue) - User enables camera
- **Camera Off** (Gray) - User disables camera
- Shows: User, Channel

### 🏷️ Tag Management
- **Tag Updated** (Orange) - HDRX tag added/removed
- Shows: User, Status, Admin who made the change

### ⚙️ Admin Actions
- **Admin Commands** (Red) - Voice time adjustments, manual changes
- Shows: Admin, Target user, Details of action

### ✅ System Events
- **Bot Online** (Green) - Bot startup with stats
- Shows: Bot name, Server count, Total users

## 🎯 Log Channel Setup

Your logs go to the channel specified in `.env`:
```
LOG_CHANNEL_ID=1472934610588537045
```

**Recommended Setup:**
1. Create a private channel (e.g., #staff-logs or #bot-logs)
2. Only give access to staff/admins
3. The bot will send all events there automatically

## 🔍 Reading the Logs

Each log embed includes:
- **Color** - Quick visual identification of event type
- **Icon & Title** - What happened
- **User Avatar** - Visual identification
- **Details** - All relevant information
- **User ID** - For moderation actions
- **Timestamp** - When it happened
- **Footer** - "HYDROX Logging System"

## 💡 Use Cases

### For Moderators:
- Track who's active in voice channels
- See when users mute/unmute (potential issues)
- Monitor streaming activity
- Verify role changes

### For Admins:
- Audit trail of all admin commands
- Track tag status changes
- Monitor bot actions
- Review role grants

### For Community Management:
- See voice activity patterns
- Identify active members
- Track milestone achievements
- Monitor community engagement

## 🎨 Color Guide

| Color | Event Type | Meaning |
|-------|------------|---------|
| 🟢 Green | Positive | Role granted, unmuted, bot online |
| 🔵 Blue | Neutral | Voice join, camera on |
| 🟡 Yellow | Change | Channel move, updates |
| 🟠 Orange | Tag | Tag status changes |
| 🔴 Red | Negative/Admin | Role removed, muted, admin actions |
| ⚪ Gray | End State | Left voice, stopped streaming |
| 🟣 Purple | Special | Streaming started |

## 🚀 Performance

- Logs are sent asynchronously (won't slow down bot)
- Failed logs won't crash the bot
- Console logs as backup
- Efficient embed creation

## 🔒 Privacy & Security

- Logs are only visible to staff with channel access
- User IDs included for moderation purposes
- No sensitive data logged
- Audit log integration for role changes

## 📊 Statistics Tracking

The bot tracks:
- Total voice time per user
- Session durations
- Role progression
- Tag status
- All stored in SQLite database

## 🛠️ Troubleshooting

**Logs not appearing?**
1. Check LOG_CHANNEL_ID in .env is correct
2. Verify bot can see and send messages in that channel
3. Check console for error messages

**Missing some events?**
1. Ensure bot has proper permissions
2. Check intents are enabled in Developer Portal
3. Restart the bot

**Audit log executor shows "Unknown"?**
- Bot needs "View Audit Log" permission
- Some actions may not appear in audit logs immediately

## 🎯 Next Steps

Your logging system is now fully operational! Every action in your server will be beautifully logged and easy to review.

Test it by:
1. Joining a voice channel
2. Muting/unmuting yourself
3. Starting a stream
4. Using admin commands

Check your log channel to see the beautiful embeds!
