# 💾 Message Cache System

## Problem Solved

Previously, deleted messages showed "Unknown" for author and no content because:
- Discord.js only caches recent messages (limited by memory)
- Old messages are not in cache
- Messages sent before bot started are not cached

## Solution: Database Message Cache

The bot now caches all messages to a local database, ensuring deleted messages can always be logged with full details.

## How It Works

### 1. Message Caching
Every message sent in the server is automatically cached to the database:
- User information (ID, tag)
- Message content
- Attachments (with URLs)
- Embed count
- Timestamps

### 2. Deletion Logging
When a message is deleted:
1. Bot checks if message is in Discord.js cache
2. If not, checks local database cache
3. Logs with full details if found
4. Shows "Unknown" with warning if not found

### 3. Automatic Cleanup
- Old messages (7+ days) are automatically deleted
- Runs daily to keep database size manageable
- Configurable retention period

## Features

### What Gets Cached
✅ Message content (full text)
✅ Author ID and tag
✅ Channel ID
✅ Attachments (name, URL, size, type)
✅ Embed count
✅ Creation timestamp

### What Doesn't Get Cached
❌ Bot messages (to save space)
❌ DM messages (only guild messages)
❌ Message edits (only original)

## Database Schema

```sql
CREATE TABLE message_cache (
    message_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_tag TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    content TEXT,
    has_attachments INTEGER DEFAULT 0,
    attachment_data TEXT,  -- JSON
    embed_count INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL,
    cached_at INTEGER DEFAULT (strftime('%s', 'now'))
);
```

## Improved Deletion Logs

### Before (Without Cache):
```
👤 Author: Unknown
🏷️ Author Tag: Unknown User
📝 Message Content: [No text content]
```

### After (With Cache):
```
👤 Author: @Username
🏷️ Author Tag: Username#1234
📝 Message Content:
```
This is the actual message that was deleted!
```
📎 Attachments (1)
1. [image.png](https://cdn.discord.com/...) (1.5 MB)
```

### If Still Not in Cache:
```
⚠️ Message was not in cache - author unknown
📝 Message Content:
```
⚠️ Message was sent before bot started or cache expired
Content not available
```
```

## Performance

### Resource Usage
- **Storage:** ~500 bytes per message
- **Memory:** Minimal (database is on disk)
- **CPU:** Negligible (simple INSERT queries)

### Example Storage:
- 1,000 messages = ~500 KB
- 10,000 messages = ~5 MB
- 100,000 messages = ~50 MB

### Cleanup:
- Messages older than 7 days are deleted
- Runs automatically every 24 hours
- Keeps database size manageable

## Configuration

### Cache Retention Period
Default: 7 days

To change, edit `utils/messageCache.js`:
```javascript
// Change 7 to desired number of days
const sevenDaysAgo = Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60);
```

### Disable Caching
To disable message caching (not recommended):
1. Comment out in `events/messageCreate.js`:
```javascript
// MessageCache.cacheMessage(message);
```

## Statistics

Check cache statistics:
```javascript
const MessageCache = require('./utils/messageCache');
const stats = MessageCache.getStats();
console.log(stats);
// {
//   totalMessages: 1234,
//   messagesWithContent: 1100,
//   messagesWithAttachments: 234
// }
```

## Limitations

### What Can't Be Cached
1. **Messages before bot started** - Bot can only cache messages it sees
2. **Deleted attachments** - URLs may expire (Discord CDN)
3. **Message edits** - Only original message is cached
4. **Reactions** - Not cached (only message content)

### Cache Misses
Messages will show "Unknown" if:
- Sent before bot started
- Older than retention period (7 days)
- Bot was offline when sent
- Database error occurred

## Troubleshooting

### Messages still showing "Unknown"

**Cause 1:** Message was sent before bot started
**Solution:** This is expected. Cache only works for messages sent after bot starts.

**Cause 2:** Message is older than 7 days
**Solution:** Increase retention period or accept this limitation.

**Cause 3:** Database error
**Solution:** Check console for errors, verify database permissions.

### Database growing too large

**Cause:** High message volume
**Solution:** 
1. Reduce retention period (e.g., 3 days instead of 7)
2. Run manual cleanup: `MessageCache.cleanOldMessages()`
3. Consider excluding certain channels

### Cache not working

**Check 1:** Verify messageCreate event is running
```bash
# Should see in console when messages are sent
[MessageCache] Cached message from Username#1234
```

**Check 2:** Check database
```bash
sqlite3 data/bot.db "SELECT COUNT(*) FROM message_cache;"
# Should show number of cached messages
```

**Check 3:** Verify no errors in console
```bash
# Look for:
[MessageCache] Error caching message: ...
```

## Best Practices

1. **Monitor Database Size**
   - Check `data/bot.db` file size periodically
   - Adjust retention period if needed

2. **Regular Backups**
   - Backup `data/bot.db` regularly
   - Cache can be rebuilt but backups are safer

3. **Privacy Considerations**
   - Inform users messages are cached
   - Add to privacy policy
   - Consider GDPR compliance

4. **Performance**
   - Cache is optimized for reads (deletion lookups)
   - Indexes on user_id, channel_id, created_at
   - Minimal impact on bot performance

## Privacy & Compliance

### What This Means
- All messages are stored in local database
- Messages kept for 7 days by default
- Deleted messages can be recovered from cache
- No external services involved (local only)

### GDPR Compliance
If you have EU users:
- Inform users about message caching
- Provide way to request data deletion
- Document retention period
- Consider user data export

### Recommendations
1. Add to server rules/privacy policy
2. Inform users messages are cached
3. Provide contact for data requests
4. Regular cleanup of old data

## Files Modified

1. `utils/database.js` - Added message_cache table
2. `utils/messageCache.js` - New cache utility
3. `events/messageCreate.js` - Cache messages on create
4. `events/messageDelete.js` - Use cache on delete
5. `utils/logger.js` - Improved unknown message handling
6. `index.js` - Added cleanup task

## Summary

✅ Messages are now cached to database
✅ Deleted messages show full details
✅ Automatic cleanup keeps database small
✅ Works for messages sent after bot starts
✅ Privacy-friendly (local storage only)
✅ Minimal performance impact

The cache system ensures deleted messages are logged with complete information, making moderation and auditing much more effective!
