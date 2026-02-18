# 🚀 Voice Tracking System Upgrade Guide

## What's New?

The voice tracking system has been upgraded from minute-based to **millisecond-precision** tracking with comprehensive session history.

## Quick Upgrade (3 Steps)

### Step 1: Backup Your Database
```bash
# Create a backup of your current database
cp data/bot.db data/bot.db.backup
```

### Step 2: Update Code
The code is already updated. Just restart your bot:
```bash
# Stop the bot (Ctrl+C)
# Start it again
node index.js
```

### Step 3: Verify Migration
Check the console for:
```
[Database] Migrating voice_activity from minutes to seconds...
[Database] Migration completed
```

That's it! The system is now running with enhanced precision.

## What Happens During Migration?

### Automatic Changes:
1. ✅ New columns added to `voice_activity` table
2. ✅ Existing `total_minutes` converted to `total_seconds` (× 60)
3. ✅ Existing `joined_at` converted to `joined_at_ms` (× 1000)
4. ✅ New `voice_sessions` table created
5. ✅ Indexes created for performance

### Data Safety:
- ✅ No data is deleted
- ✅ All existing voice time is preserved
- ✅ Users keep their progress toward roles
- ✅ Tag status is maintained
- ✅ Backward compatible

## Verification Checklist

### ✅ Check 1: Database Migration
```bash
# Check if new columns exist
sqlite3 data/bot.db "PRAGMA table_info(voice_activity);"

# Should see:
# - total_seconds
# - joined_at_ms
# - last_updated_ms
# - session_count
# - last_session_seconds
```

### ✅ Check 2: Data Conversion
```bash
# Check if data was converted
sqlite3 data/bot.db "SELECT user_id, total_seconds FROM voice_activity LIMIT 5;"

# Should see non-zero values if users had voice time
```

### ✅ Check 3: New Table
```bash
# Check if sessions table exists
sqlite3 data/bot.db "SELECT COUNT(*) FROM voice_sessions;"

# Should return 0 (no sessions yet, will populate as users join/leave)
```

### ✅ Check 4: Bot Functionality
1. Join a voice channel
2. Check console for: `[VoiceTracker] User XXX joining voice at...`
3. Leave after 1-2 minutes
4. Check Discord log shows seconds: "1m 23s"

## Before vs After

### Before Upgrade:
```
Session Duration: 5m
Total Voice Time: 10h 30m
Progress: 52%
```

### After Upgrade:
```
Session Duration: 5m 23s ← More precise!
Total Voice Time: 10h 30m 45s ← Shows seconds!
Progress: 52.6% ← Decimal precision!
Session #15 ← Session count!
```

## New Features Available

### 1. Session History
Users now have a complete history of their voice sessions:
- When they joined
- Which channel
- How long they stayed
- Exact timestamps

### 2. Session Count
Track how many times a user has joined voice:
- Displayed in join/leave logs
- Useful for engagement metrics

### 3. Precise Progress
Role progress now shows decimal percentages:
- Old: "52%"
- New: "52.6%"

### 4. Current Session Duration
For users currently in voice, you can see how long they've been there in real-time.

### 5. Leaderboard
Get top users by voice time (feature ready for future commands).

## Configuration Changes

### config.js
```javascript
// NEW: Update interval reduced for better precision
updateInterval: 30,  // Was 60, now 30 seconds

// NEW: Cleanup interval for orphaned sessions
cleanupInterval: 24  // Hours
```

**What this means:**
- Voice time updates every 30 seconds (was 60)
- More accurate tracking
- Slightly more CPU usage (negligible)

**Can I change it?**
Yes! Adjust `updateInterval`:
- `15` = Maximum precision (updates every 15s)
- `30` = High precision (recommended)
- `60` = Standard precision (old behavior)

## Rollback (If Needed)

If you need to rollback for any reason:

### Step 1: Restore Backup
```bash
cp data/bot.db.backup data/bot.db
```

### Step 2: Revert Code
```bash
git checkout HEAD~1  # Or your previous commit
```

### Step 3: Restart Bot
```bash
node index.js
```

**Note:** You'll lose any sessions recorded after the upgrade, but total voice time is preserved in the backup.

## Common Questions

### Q: Will users lose their voice time?
**A:** No! All existing voice time is automatically converted and preserved.

### Q: Will users lose progress toward roles?
**A:** No! Progress is maintained. In fact, it's now more accurate.

### Q: Do I need to reconfigure anything?
**A:** No! Everything works automatically. Configuration is optional.

### Q: What if the migration fails?
**A:** The bot will still work with old data. Check console for errors and report them.

### Q: Can I see the old minute values?
**A:** Yes, divide `total_seconds` by 60. But the new system is more accurate.

### Q: Will this affect performance?
**A:** Minimal impact. Updates run every 30s instead of 60s, but the code is optimized.

### Q: What happens to users currently in voice during upgrade?
**A:** Their session continues normally. The system tracks from the last update.

## Troubleshooting

### Issue: "Column already exists" error
**Solution:** Migration already ran. This is normal on restart.

### Issue: Session times still show only minutes
**Solution:** 
1. Check you're running the new code
2. Restart the bot
3. Join/leave voice to test

### Issue: Console shows old log format
**Solution:** Clear your terminal and restart the bot

### Issue: Database locked error
**Solution:** 
1. Stop all bot instances
2. Wait 5 seconds
3. Start bot again

### Issue: Users report lost voice time
**Solution:**
1. Check backup: `sqlite3 data/bot.db.backup "SELECT * FROM voice_activity WHERE user_id='USER_ID';"`
2. Verify current: `sqlite3 data/bot.db "SELECT * FROM voice_activity WHERE user_id='USER_ID';"`
3. Compare `total_seconds` should equal `total_minutes * 60`

## Testing After Upgrade

### Test 1: Quick Session
1. Join voice
2. Wait exactly 30 seconds
3. Leave
4. Verify log shows "0m 30s" (not "0m")

### Test 2: Long Session
1. Join voice
2. Stay for 5 minutes
3. Watch console for update logs every 30 seconds
4. Leave
5. Verify accurate duration

### Test 3: Multiple Sessions
1. Join and leave 3 times
2. Check session count increases
3. Verify total time accumulates

### Test 4: Role Progress
1. Check a user close to next role
2. Verify progress shows decimal (e.g., "89.3%")
3. Have them join voice
4. Verify progress increases smoothly

## Performance Monitoring

### What to Watch:
```bash
# CPU usage (should be minimal)
top -p $(pgrep -f "node index.js")

# Database size (grows slowly with sessions)
ls -lh data/bot.db

# Memory usage (should be stable)
ps aux | grep "node index.js"
```

### Expected Values:
- CPU: 1-5% during updates
- Memory: +10-50MB (depends on active users)
- Database: +1-10MB per month (depends on activity)

## Success Indicators

You'll know the upgrade worked when:
1. ✅ Bot starts without errors
2. ✅ Console shows migration message
3. ✅ Join/leave logs show seconds
4. ✅ Progress percentages have decimals
5. ✅ Session count appears in logs
6. ✅ No user complaints about lost time

## Support

If you encounter issues:
1. Check console for error messages
2. Verify database backup exists
3. Review `ENHANCED_VOICE_TRACKING.md` for details
4. Check `VOICE_SESSION_TIME_FIX.md` for related fixes

## Next Steps

After successful upgrade:
1. Monitor for 24 hours
2. Verify users are earning roles correctly
3. Check session history is populating
4. Consider adjusting `updateInterval` if needed
5. Enjoy the enhanced precision! 🎉

## Summary

✅ **Automatic migration** - No manual steps needed
✅ **Data preserved** - All voice time maintained
✅ **Better accuracy** - Millisecond precision
✅ **New features** - Session history and more
✅ **Backward compatible** - Works with existing data
✅ **Easy rollback** - Backup available if needed

The upgrade is designed to be seamless. Most users won't notice anything except more accurate time tracking!
