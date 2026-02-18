# 🗑️ Message Deletion Logging System

## Overview
The bot now logs all deleted messages permanently to a dedicated channel, providing a complete audit trail of message deletions.

## Features

### What Gets Logged

#### Single Message Deletion
- ✅ Message author (with mention and avatar)
- ✅ Message content (full text)
- ✅ Attachments (with links and file info)
- ✅ Embeds count
- ✅ Channel where deleted
- ✅ Message ID
- ✅ Deletion timestamp
- ✅ Original creation timestamp
- ✅ Bot vs User message indicator

#### Bulk Message Deletion
- ✅ Number of messages deleted
- ✅ Channel where deleted
- ✅ Who performed the bulk delete (from audit logs)
- ✅ Timestamp range of deleted messages
- ✅ Deletion timestamp

## Setup

### 1. Channel Already Configured
The deleted messages log channel is already set in `.env.example`:
```env
DELETED_MESSAGES_LOG_CHANNEL_ID=1473653741025493064
```

### 2. Update Your .env File
If you haven't already, add this line to your `.env` file:
```env
DELETED_MESSAGES_LOG_CHANNEL_ID=1473653741025493064
```

### 3. Restart the Bot
```bash
# Stop the bot (Ctrl+C)
# Start it again
node index.js
```

### 4. Verify It's Working
1. Send a test message in any channel
2. Delete it
3. Check channel `1473653741025493064` for the deletion log

## Log Examples

### Single Message Deletion

**Red Embed:**
```
🗑️ Message Deleted

Message by @Username deleted in #general

👤 Author: @Username
🏷️ Author Tag: Username#1234
📍 Channel: #general
🆔 Message ID: 1234567890123456789
🕐 Deleted At: January 15, 2024 2:30 PM
📅 Created At: January 15, 2024 2:25 PM

📝 Message Content
```
This is the message that was deleted.
It can be multiple lines.
```

📎 Attachments (2)
1. [image.png](https://cdn.discord.com/...) (1024000 bytes)
2. [document.pdf](https://cdn.discord.com/...) (2048000 bytes)
```

### Bulk Message Deletion

**Red Embed:**
```
🗑️ Bulk Message Deletion

50 messages were deleted in #general

📍 Channel: #general
🔢 Messages Deleted: 50
🕐 Deleted At: January 15, 2024 2:30 PM
👤 Deleted By: @Moderator
🏷️ Executor Tag: Moderator#5678

📅 Message Range
From: January 15, 2024 1:00 PM
To: January 15, 2024 2:30 PM
```

## Features in Detail

### Message Content Preservation
- Full message text is preserved (up to 1024 characters displayed)
- Long messages are truncated with "..." indicator
- Code blocks and formatting are preserved
- Empty messages show "*[No text content]*"

### Attachment Tracking
- All attachments are logged with:
  - File name
  - Direct URL (clickable link)
  - File size in bytes
  - Content type
- Attachment URLs remain valid for a limited time (Discord CDN)

### Embed Detection
- Counts how many embeds were in the message
- Useful for tracking rich content deletions

### Bot Message Handling
- Bot messages are logged with gray color
- User messages are logged with red color
- Footer indicates if message was from a bot

### Audit Log Integration
- For bulk deletions, shows who performed the action
- Uses Discord audit logs to identify moderator
- Shows moderator's avatar and tag

### Timestamp Precision
- Shows when message was created
- Shows when message was deleted
- Uses Discord's dynamic timestamps (adjusts to user timezone)

## Privacy & Compliance

### What This Means
- **All deleted messages are permanently logged**
- **Message content is preserved**
- **Attachments are linked (URLs may expire)**
- **No automatic deletion of logs**

### Recommendations
1. Inform your server members that deleted messages are logged
2. Add this to your server rules or privacy policy
3. Restrict access to the log channel (staff only)
4. Consider data retention policies for your region

### GDPR Compliance
If you're in the EU or have EU users:
- Inform users about message logging in your privacy policy
- Provide a way for users to request deletion of their logged messages
- Consider implementing automatic log cleanup after X days

## Channel Permissions

### Recommended Setup
For channel `1473653741025493064`:

**Bot Permissions:**
- ✅ View Channel
- ✅ Send Messages
- ✅ Embed Links
- ✅ Read Message History

**Staff Permissions:**
- ✅ View Channel
- ✅ Read Message History

**Everyone:**
- ❌ View Channel (hidden from regular users)

## Performance

### Resource Usage
- **CPU:** Minimal (only on message deletion)
- **Memory:** ~1KB per deleted message (cached briefly)
- **Network:** One API call per deletion
- **Storage:** Logs stored in Discord (no local storage)

### Limitations
- Message content only available if bot has cached the message
- Attachments: URLs expire after some time (Discord CDN)
- Bulk delete: Individual messages not logged by default
- Audit logs: May not always identify who deleted (timing dependent)

## Troubleshooting

### No Logs Appearing

**Check 1: Channel ID**
```bash
# Verify in .env
cat .env | grep DELETED_MESSAGES_LOG_CHANNEL_ID
# Should show: DELETED_MESSAGES_LOG_CHANNEL_ID=1473653741025493064
```

**Check 2: Bot Permissions**
- Bot can see the channel
- Bot can send messages
- Bot can embed links

**Check 3: Intents**
```javascript
// In index.js, verify these are present:
GatewayIntentBits.GuildMessages,
GatewayIntentBits.MessageContent,
```

**Check 4: Partials**
```javascript
// In index.js, verify partials are configured:
partials: [
    Partials.Message,
    Partials.Channel,
]
```

### Message Content Shows as Empty

**Cause:** Message was not in bot's cache
**Solution:** 
- Bot can only log content of messages it has seen
- Older messages (before bot started) won't have content
- Increase message cache size if needed

### Attachments Not Showing

**Cause:** Message had no attachments or bot didn't cache them
**Solution:**
- Verify message actually had attachments
- Check if bot was online when message was sent

### Bulk Delete Not Showing Executor

**Cause:** Audit log timing or permissions
**Solution:**
- Verify bot has "View Audit Log" permission
- Audit logs may take a moment to appear
- Some bulk deletes may not have audit log entries

## Advanced Configuration

### Enable Individual Message Logs for Bulk Deletes

In `events/messageDeleteBulk.js`, uncomment this section:
```javascript
// Optionally log individual messages (if you want detailed logs)
for (const message of messageArray) {
    if (message.author) {
        await Logger.log('MESSAGE_DELETE', null, {
            // ... logs each message individually
        });
    }
}
```

**Warning:** This can create a LOT of logs for large bulk deletes!

### Change Log Channel

To use a different channel:
1. Create a new channel
2. Copy its ID
3. Update `.env`:
```env
DELETED_MESSAGES_LOG_CHANNEL_ID=your_new_channel_id
```
4. Restart bot

### Disable Deletion Logging

To temporarily disable:
1. Remove or comment out the line in `.env`:
```env
# DELETED_MESSAGES_LOG_CHANNEL_ID=1473653741025493064
```
2. Restart bot

Logs will fall back to main log channel if configured.

## Use Cases

### Moderation
- Track deleted spam messages
- Review deleted rule violations
- Audit moderator actions
- Investigate harassment reports

### Compliance
- Legal requirements for message retention
- Audit trail for investigations
- Data retention policies
- Transparency reports

### Security
- Track deleted phishing attempts
- Monitor deleted malicious links
- Review deleted suspicious content
- Incident response documentation

## Best Practices

1. **Restrict Access:** Only staff should see deletion logs
2. **Regular Review:** Check logs periodically for patterns
3. **Privacy Policy:** Inform users about logging
4. **Data Retention:** Consider auto-cleanup after X days
5. **Backup:** Logs are in Discord, consider external backup
6. **Training:** Train staff on using deletion logs
7. **Compliance:** Follow local data protection laws

## Console Logs

When a message is deleted, you'll see:
```
[MessageDelete] Message 1234567890123456789 deleted in #general by Username#1234
```

For bulk deletes:
```
[MessageDeleteBulk] 50 messages deleted in #general
```

## Files Modified

1. `.env.example` - Added `DELETED_MESSAGES_LOG_CHANNEL_ID`
2. `utils/logger.js` - Added message deletion log types and embeds
3. `index.js` - Added Partials for message caching
4. `events/messageDelete.js` - New event handler
5. `events/messageDeleteBulk.js` - New event handler

## Required Permissions

Bot needs these permissions:
- ✅ View Channels
- ✅ Read Messages/View Channels
- ✅ Send Messages
- ✅ Embed Links
- ✅ Read Message History
- ✅ View Audit Log (for bulk delete executor)

## Notes

- Logs are permanent (stored in Discord)
- Message content only available if bot cached it
- Attachment URLs may expire (Discord CDN)
- Bot messages are logged but shown in gray
- DM deletions are not logged (only guild messages)

## Future Enhancements

Possible additions:
- Message edit logging
- Reaction logging
- Pin/unpin logging
- Thread creation/deletion
- Export logs to file
- Search deleted messages
- Statistics dashboard
