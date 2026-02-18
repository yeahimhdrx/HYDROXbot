# 🗑️ Message Deletion Logging - Quick Setup

## Already Configured! ✅

The message deletion logging is already set up and ready to use.

## Channel Information

**Deleted Messages Log Channel ID:** `1473653741025493064`

All deleted messages will be logged to this channel permanently.

## Quick Test (2 Steps)

### Step 1: Restart Bot
```bash
# Stop the bot (Ctrl+C if running)
# Start it again
node index.js
```

### Step 2: Test It
1. Send a test message in any channel: "This is a test message"
2. Delete the message
3. Check channel `1473653741025493064`
4. You should see a red embed with the deleted message details

## What You'll See

When you delete a message, a log appears showing:
- 👤 Who sent the message
- 📝 The message content
- 📎 Any attachments
- 📍 Which channel it was in
- 🕐 When it was deleted
- 🆔 Message ID

## Features

✅ **Permanent Logs** - All deleted messages are saved
✅ **Full Content** - Complete message text preserved
✅ **Attachments** - Links to deleted files
✅ **Bulk Deletes** - Tracks mass deletions
✅ **Moderator Tracking** - Shows who deleted (for bulk)
✅ **Timestamps** - Creation and deletion times

## Important Notes

### Privacy
- All deleted messages are logged permanently
- Message content is preserved
- Inform your server members about this feature
- Consider adding to your server rules

### Permissions
Make sure the log channel is:
- ❌ Hidden from regular users
- ✅ Visible to staff/moderators only
- ✅ Bot can send messages there

### What Gets Logged
- ✅ User messages
- ✅ Bot messages (shown in gray)
- ✅ Messages with attachments
- ✅ Messages with embeds
- ✅ Bulk deletions

### What Doesn't Get Logged
- ❌ DM deletions (only guild messages)
- ❌ Messages sent before bot started (not cached)
- ❌ Messages in channels bot can't see

## Troubleshooting

### No logs appearing?

**Check 1:** Is the bot running?
```bash
# Check if bot is online in Discord
```

**Check 2:** Is the channel ID correct in .env?
```bash
cat .env | grep DELETED_MESSAGES_LOG_CHANNEL_ID
# Should show: DELETED_MESSAGES_LOG_CHANNEL_ID=1473653741025493064
```

**Check 3:** Can the bot access the channel?
- Go to channel `1473653741025493064`
- Check bot has permissions to send messages

**Check 4:** Did you restart the bot after updating?
```bash
# Restart required for .env changes
```

### Message content is empty?

**Cause:** Bot didn't have the message in cache

**Solution:** 
- Bot can only log messages it has seen
- Messages sent before bot started won't have content
- This is normal and expected

### Attachments not showing?

**Cause:** Message had no attachments or bot didn't cache them

**Solution:**
- Verify message actually had attachments
- Attachment URLs may expire after some time (Discord CDN)

## Configuration

### Current Setup
```env
# In your .env file:
DELETED_MESSAGES_LOG_CHANNEL_ID=1473653741025493064
```

### To Change Channel
1. Create a new channel
2. Right-click → Copy ID
3. Update `.env` file with new ID
4. Restart bot

### To Disable
Comment out the line in `.env`:
```env
# DELETED_MESSAGES_LOG_CHANNEL_ID=1473653741025493064
```

## Console Output

When working correctly, you'll see:
```
[MessageDelete] Message 1234567890 deleted in #general by Username#1234
```

## Need More Info?

See `MESSAGE_DELETION_LOGGING.md` for:
- Detailed feature documentation
- Privacy and compliance guidelines
- Advanced configuration options
- Troubleshooting guide
- Best practices

## Success Checklist

✅ Bot is running
✅ .env has DELETED_MESSAGES_LOG_CHANNEL_ID set
✅ Bot restarted after configuration
✅ Test message deleted successfully
✅ Log appeared in channel 1473653741025493064
✅ Log shows message content and details

If all checks pass, you're good to go! 🎉

## Support

If you have issues:
1. Check console for error messages
2. Verify bot permissions in the log channel
3. Test with a simple message deletion
4. Review `MESSAGE_DELETION_LOGGING.md` for details
