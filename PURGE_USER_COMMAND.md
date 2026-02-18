# 🗑️ Purge User Command

## Overview
A powerful moderation command that allows administrators to delete all messages from a specific user within a time range across the entire server or in a specific channel.

## Command

```
/purgeuser user:<user> minutes:<1-1440> [channel:<channel>]
```

## Parameters

### Required:
- **user** - The user whose messages to delete
- **minutes** - Time range in minutes (1-1440, max 24 hours)

### Optional:
- **channel** - Specific channel to purge from (if not specified, purges from all channels)

## Permission Requirements

### Who Can Use This Command?
**ONLY ADMINISTRATORS** - This command requires the Administrator permission.

### Double Security Check:
1. Command is set to require Administrator permission in Discord
2. Command code double-checks the permission before executing
3. Cannot be used in DMs (server only)

## Usage Examples

### Example 1: Purge from all channels
```
/purgeuser user:@SpammerUser minutes:30
```
Deletes all messages from @SpammerUser in the last 30 minutes across ALL channels.

### Example 2: Purge from specific channel
```
/purgeuser user:@SpammerUser minutes:60 channel:#general
```
Deletes all messages from @SpammerUser in the last 60 minutes ONLY in #general.

### Example 3: Purge recent spam
```
/purgeuser user:@SpammerUser minutes:5
```
Deletes all messages from @SpammerUser in the last 5 minutes (quick spam cleanup).

### Example 4: Purge from last 24 hours
```
/purgeuser user:@SpammerUser minutes:1440
```
Deletes all messages from @SpammerUser in the last 24 hours (maximum allowed).

## How It Works

### Process:
1. **Validation** - Checks administrator permission
2. **Scanning** - Scans specified channels for messages
3. **Filtering** - Finds messages from target user within time range
4. **Deletion** - Deletes messages (bulk delete for recent, individual for old)
5. **Reporting** - Shows detailed results

### Smart Deletion:
- **Recent messages** (< 14 days): Bulk deleted (fast)
- **Old messages** (> 14 days): Deleted individually (slower, rate-limited)
- **Progress updates**: Shows progress every 5 channels

### Safety Features:
- ✅ Cannot purge bot's own messages
- ✅ Only administrators can use
- ✅ Respects Discord's 14-day bulk delete limit
- ✅ Handles rate limits automatically
- ✅ Skips channels without permissions
- ✅ Shows detailed error reports

## What You'll See

### During Execution:
```
🔄 Purging Messages...

Scanning channels for messages from Username#1234...

👤 Target User: Username#1234
⏱️ Time Range: Last 30 minute(s)
📊 Progress: 15/50 channels
🗑️ Deleted So Far: 127 messages
```

### After Completion:
```
✅ Purge Complete

Purge operation completed for Username#1234

👤 Target User: Username#1234 (@123456789)
⏱️ Time Range: Last 30 minute(s)
📍 Scope: All channels
🗑️ Messages Deleted: 247
📊 Channels Processed: 50
👮 Executed By: ModeratorName#5678
```

## Performance

### Speed:
- **Recent messages**: ~100 messages per second (bulk delete)
- **Old messages**: ~1 message per second (rate limited)
- **Large servers**: May take several minutes for full scan

### Limitations:
- **Max time range**: 1440 minutes (24 hours)
- **Discord API**: 14-day limit for bulk delete
- **Rate limits**: Automatic handling with delays
- **Permissions**: Skips channels bot can't access

## Use Cases

### 1. Spam Cleanup
User posts spam across multiple channels:
```
/purgeuser user:@Spammer minutes:10
```
Quickly removes all spam messages.

### 2. Raid Response
User is raiding the server:
```
/purgeuser user:@Raider minutes:30
```
Removes all raid messages across the server.

### 3. Accidental Flood
User accidentally floods a channel:
```
/purgeuser user:@User minutes:5 channel:#general
```
Cleans up the flood in specific channel.

### 4. Rule Violation Cleanup
User posted inappropriate content:
```
/purgeuser user:@Violator minutes:60
```
Removes all recent messages from violator.

## Error Handling

### Common Errors:

**Missing Permissions:**
```
⚠️ Errors Encountered
Missing permissions in #private-channel
```
Bot can't access certain channels.

**Bulk Delete Failed:**
```
⚠️ Errors Encountered
Bulk delete failed in #channel-name
```
Messages might be too old (>14 days).

**No Messages Found:**
```
⚠️ Purge Complete - No Messages Found

🗑️ Messages Deleted: 0
```
User didn't send messages in the time range.

## Best Practices

### 1. Start Small
Test with short time ranges first:
```
/purgeuser user:@User minutes:5
```

### 2. Use Specific Channels
If you know where the spam is:
```
/purgeuser user:@User minutes:30 channel:#general
```
Faster and more targeted.

### 3. Check Before Purging
Review the user's recent messages first to ensure you're targeting the right person.

### 4. Document Actions
Take screenshots of the purge results for moderation logs.

### 5. Communicate
Inform other moderators before large purges.

## Security

### Protection Against Abuse:
1. **Administrator Only** - Only admins can use
2. **No Self-Purge** - Cannot purge bot's messages
3. **Audit Trail** - All purges logged to console
4. **Confirmation** - Shows who executed the command
5. **Detailed Results** - Full report of what was deleted

### Audit Log:
Console output:
```
[PurgeUser] ModeratorName#5678 purged 247 messages from SpammerUser#1234 (last 30 minutes)
```

## Troubleshooting

### Command Not Appearing?
**Cause**: Commands not deployed
**Solution**: Run `npm run deploy`

### "You must be an administrator"?
**Cause**: User doesn't have Administrator permission
**Solution**: Only server administrators can use this command

### Slow Execution?
**Cause**: Many messages or old messages (>14 days)
**Solution**: This is normal. Old messages are rate-limited by Discord.

### Some Messages Not Deleted?
**Cause**: Messages older than 14 days or permission issues
**Solution**: Check error report in command output

### Bot Doesn't Respond?
**Cause**: Bot might be processing
**Solution**: Wait up to 15 minutes for large purges

## Technical Details

### Rate Limits:
- **Bulk Delete**: 5 requests per 5 seconds
- **Individual Delete**: 1 message per second
- **Message Fetch**: 50 requests per second

### Batch Processing:
- Fetches 100 messages at a time
- Processes channels sequentially
- Updates progress every 5 channels

### Memory Usage:
- Minimal (processes in batches)
- No message content stored
- Efficient for large purges

## Comparison with Other Methods

### Manual Deletion:
- ❌ Time-consuming
- ❌ Error-prone
- ❌ Can't target specific users
- ❌ No bulk operations

### This Command:
- ✅ Automated
- ✅ Accurate (targets specific user)
- ✅ Fast (bulk operations)
- ✅ Comprehensive (all channels)
- ✅ Detailed reporting

## Important Notes

### Discord Limitations:
- Cannot delete messages older than 14 days in bulk
- Rate limits apply (handled automatically)
- Requires proper bot permissions

### Bot Permissions Required:
- ✅ View Channel
- ✅ Read Message History
- ✅ Manage Messages

### What Gets Deleted:
- ✅ Text messages
- ✅ Messages with attachments
- ✅ Messages with embeds
- ✅ Messages with reactions

### What Doesn't Get Deleted:
- ❌ Messages in channels bot can't access
- ❌ Messages from other users
- ❌ Messages outside time range

## After Purging

### Deleted Messages:
- Permanently removed from Discord
- Logged in deletion log channel (if configured)
- Cannot be recovered

### User Status:
- User remains in server (not kicked/banned)
- Can continue sending messages
- Consider additional moderation actions if needed

## Deployment

### 1. Deploy Command:
```bash
npm run deploy
```

### 2. Verify in Discord:
Type `/purgeuser` and check if it appears (admin only)

### 3. Test:
Create a test user, send some messages, then purge them

## Summary

✅ **Administrator only** - Maximum security
✅ **Powerful** - Purges across entire server
✅ **Flexible** - Time range and channel options
✅ **Fast** - Bulk deletion for recent messages
✅ **Safe** - Multiple safety checks
✅ **Detailed** - Comprehensive reporting
✅ **Smart** - Handles rate limits automatically

This command is an essential tool for server moderation, allowing quick response to spam, raids, and rule violations!
