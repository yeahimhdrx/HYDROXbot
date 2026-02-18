# 🔧 Role Logging Troubleshooting Guide

## Recent Fixes Applied

### What Was Fixed
1. **Async forEach Issue** - Replaced with proper `for...of` loops that wait for each log
2. **Race Conditions** - Fetch audit logs once and reuse for all role changes
3. **Timing Window** - Increased from 5 to 10 seconds to catch more changes
4. **Early Exit** - Skip processing if no role changes detected
5. **Better Error Handling** - Added detailed console logging for debugging
6. **Fallback Channel** - Role logs fall back to main channel if role channel not set

## Checking If It's Working

### 1. Check Console Logs
When a role is added/removed, you should see:
```
[RoleUpdate] User: Username#1234 | Added: 1 | Removed: 0
[RoleUpdate] Logging role add: RoleName to Username#1234 by Moderator#5678
[Logger] [ROLE_ADD] {...}
```

### 2. If You Don't See Console Logs
The event isn't firing. Check:
- Bot has `GuildMembers` intent enabled (should be in index.js)
- Bot is online and connected
- Bot has "View Audit Log" permission

### 3. If You See Console Logs But No Discord Messages

#### Check Channel Configuration
```bash
# In your .env file, verify:
ROLE_LOG_CHANNEL_ID=1234567890  # Must be a valid channel ID
```

#### Verify Channel Permissions
The bot needs these permissions in the role log channel:
- ✅ View Channel
- ✅ Send Messages
- ✅ Embed Links

#### Check Console for Errors
Look for:
```
[Logger] Channel 1234567890 not found
[Logger] Channel 1234567890 is not a text channel
[Logger] Error sending ROLE_ADD log to channel
```

## Common Issues & Solutions

### Issue: "Some role changes not logged"

**Possible Causes:**
1. **Multiple rapid changes** - Discord may batch updates
2. **Bot offline during change** - Can't log what it doesn't see
3. **Audit log timing** - Very fast changes might not appear in audit logs yet

**Solutions:**
- The new code fetches 5 audit log entries instead of 1
- Timing window increased to 10 seconds
- Logs are processed sequentially to avoid race conditions

### Issue: "Executor shows as 'Unknown'"

**Causes:**
1. Bot doesn't have "View Audit Log" permission
2. Change was made by Discord itself (e.g., integration)
3. Audit log entry is older than 10 seconds

**Solution:**
```
Server Settings → Roles → Your Bot Role → Enable "View Audit Log"
```

### Issue: "Bot role changes are logged"

**Expected Behavior:**
Bot role changes ARE filtered out with `if (newMember.user.bot) return;`

If you're seeing bot logs, check the code hasn't been modified.

### Issue: "@everyone role changes logged"

**Expected Behavior:**
@everyone is filtered out with `&& role.name !== '@everyone'`

This should not happen with the current code.

## Testing Role Logging

### Manual Test
1. Add a role to a user manually
2. Check console for: `[RoleUpdate] User: ... | Added: 1 | Removed: 0`
3. Check Discord role log channel for the embed
4. Remove the role
5. Check console for: `[RoleUpdate] User: ... | Added: 0 | Removed: 1`
6. Check Discord for the removal embed

### What to Look For
- ✅ Console shows role change detected
- ✅ Console shows "Logging role add/remove"
- ✅ Discord embed appears in role log channel
- ✅ Embed shows correct user, role, and moderator
- ✅ Timestamp is accurate

## Debug Mode

### Enable Detailed Logging
The bot now logs:
- When role changes are detected
- What roles changed
- Who made the change
- Any errors during logging

### Check These Logs
```bash
# Role change detected
[RoleUpdate] User: Username#1234 | Added: 1 | Removed: 0

# Logging attempt
[RoleUpdate] Logging role add: RoleName to Username#1234 by Moderator#5678

# Logger processing
[Logger] [ROLE_ADD] {...}

# Errors (if any)
[RoleUpdate] Failed to fetch audit logs: Missing Permissions
[Logger] Channel 1234567890 not found
[Logger] Error sending ROLE_ADD log to channel: ...
```

## Still Having Issues?

### Collect This Information:
1. Console output when adding/removing a role
2. Your bot's permissions in the server
3. Your bot's permissions in the log channel
4. The .env configuration (without tokens)
5. Any error messages

### Verify Bot Setup:
```javascript
// In index.js, verify these intents are present:
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMembers,  // REQUIRED for role changes
GatewayIntentBits.GuildModeration, // REQUIRED for audit logs
```

### Check Bot Permissions:
Server Settings → Roles → Bot Role:
- ✅ View Audit Log (to see who made changes)
- ✅ View Channels
- ✅ Send Messages
- ✅ Embed Links

## Comparison with Other Bots

If other logging bots show changes that this bot doesn't:
1. Check if those bots are using a different event (some use raw events)
2. Verify this bot was online when the change happened
3. Check console logs to see if the event fired
4. Compare the timing - some bots may have faster audit log access

The current implementation should catch all role changes that Discord.js reports through the `guildMemberUpdate` event.
