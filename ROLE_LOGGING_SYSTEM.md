# 🎭 Role Logging System

## Overview
The bot now supports **separate logging channels** for role changes, allowing you to monitor all role modifications in a dedicated channel.

## Features

### Separate Role Log Channel
- All role changes (additions, removals, and bot-granted roles) are logged to a dedicated channel
- Voice and member events continue to log to the main log channel
- Easy to review all role modifications in one place

### What Gets Logged
1. **Role Additions** - When any role is added to a member
2. **Role Removals** - When any role is removed from a member  
3. **Bot-Granted Roles** - When the bot automatically grants roles based on voice activity

### Information Captured
- Target user (with mention and avatar)
- Role name and details
- Who made the change (moderator or system)
- Executor's Discord tag and mention
- Timestamp of the change
- Action type (manual vs automatic)
- Complete audit trail

## Setup

### 1. Create a Role Log Channel
Create a new text channel in your Discord server (e.g., `#role-logs`)

### 2. Get the Channel ID
- Enable Developer Mode in Discord (Settings > Advanced > Developer Mode)
- Right-click the channel and select "Copy ID"

### 3. Add to Environment Variables
Edit your `.env` file and add:
```env
ROLE_LOG_CHANNEL_ID=your_role_log_channel_id_here
```

### 4. Restart the Bot
Restart your bot to apply the changes.

## Premium Embed Features

### Role Added
- Green color (#57f287)
- Shows target user with mention
- Displays who added the role (with mention if available)
- Includes executor tag and avatar
- Distinguishes between manual and system assignments
- Full timestamp and details section

### Role Removed  
- Red color (#ed4245)
- Shows target user with mention
- Displays who removed the role (with mention if available)
- Includes executor tag and avatar
- Distinguishes between manual and system removals
- Full timestamp and details section

### Bot-Granted Roles
- Cyan color (#00d9ff)
- Special indicator for automatic role grants
- Shows voice time requirement
- Displays tag requirement status
- Marked as "HYDROX Bot" action
- Achievement details included

## Example Use Cases

1. **Moderation Tracking** - See who is adding/removing roles
2. **Audit Trail** - Complete history of role changes
3. **Bot Activity** - Monitor automatic role grants
4. **Security** - Detect unauthorized role modifications

## Notes
- The bot requires "View Audit Log" permission to identify who made role changes
- If audit logs are unavailable, executor will show as "Unknown"
- @everyone role changes are not logged
- Bot role changes are not logged
