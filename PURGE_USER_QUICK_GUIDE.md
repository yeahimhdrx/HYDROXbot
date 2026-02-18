# 🗑️ Purge User - Quick Guide

## What It Does
Deletes ALL messages from a specific user within a time range. Perfect for spam cleanup!

## Command
```
/purgeuser user:<user> minutes:<time> [channel:<channel>]
```

## Quick Examples

### Remove spam from last 10 minutes (all channels):
```
/purgeuser user:@SpammerUser minutes:10
```

### Remove messages from last hour in #general only:
```
/purgeuser user:@User minutes:60 channel:#general
```

### Remove all messages from last 24 hours:
```
/purgeuser user:@User minutes:1440
```

## Who Can Use?
**ONLY ADMINISTRATORS** ⚠️

## What Happens?
1. Bot scans all channels (or specified channel)
2. Finds all messages from target user in time range
3. Deletes them (bulk delete for recent, individual for old)
4. Shows detailed report

## Example Result:
```
✅ Purge Complete

🗑️ Messages Deleted: 247
📊 Channels Processed: 50
👮 Executed By: YourName#1234
```

## Important Notes:
- ⚠️ **Permanent deletion** - Cannot be undone!
- ✅ Only admins can use
- ✅ Cannot purge bot's messages
- ✅ Handles rate limits automatically
- ✅ Shows progress for large operations

## Use Cases:
- 🚫 Spam cleanup
- 🚫 Raid response
- 🚫 Rule violation cleanup
- 🚫 Accidental flood removal

## Tips:
1. Start with short time ranges (5-10 minutes)
2. Use specific channel if you know where spam is
3. Check user's messages before purging
4. Document the action for mod logs

## Need More Info?
See `PURGE_USER_COMMAND.md` for complete documentation.

## Ready to Use!
The command is now deployed and ready. Only administrators will see it in the command list.
