# 🧪 Voice Session Time - Testing Guide

## Quick Test (5 minutes)

### Test 1: Short Session
1. Join a voice channel
2. Wait 2-3 minutes
3. Leave the voice channel
4. Check the log embed

**Expected Result:**
```
Session Duration: 2m (or 3m)
```

**If you see "0m":** The bug is still present ❌

### Test 2: Check Console
Look at your bot console when you leave:

**Expected Output:**
```
[VoiceTracker] User 123456789 leaving voice. Joined at: 1234567890
[VoiceTracker] Session duration: 2 minutes (1234567920 - 1234567890)
```

**If you see "Session duration: 0 minutes":** The bug is still present ❌

## Full Test (1+ hour)

### Test 3: Long Session with Updates
1. Join a voice channel
2. Stay for at least 65 minutes (to ensure at least one update cycle runs)
3. Leave the voice channel
4. Check the log embed

**Expected Result:**
```
Session Duration: 1h 5m (or whatever time you stayed)
```

**NOT:** "0m" or "5m" ❌

### Test 4: Monitor Console During Session
While in voice, watch the console for update cycles:

**Expected Output (every 60 seconds):**
```
[VoiceTracker] Updating 1 active users
[VoiceTracker] User 123456789: Adding 1 minutes (keeping original joined_at: 1234567890)
```

**Key Check:** The `joined_at` value should advance by the minutes counted, not jump to current time.

## Understanding the Console Logs

### When You Join:
```
[VoiceTracker] User 123456789 joining voice at 1234567890
```
- This is your join timestamp

### During Updates (every 60s):
```
[VoiceTracker] Updating 1 active users
[VoiceTracker] User 123456789: Adding 1 minutes (keeping original joined_at: 1234567890)
```
- Shows how many minutes are being added
- Shows the joined_at is being preserved (advanced, not reset)

### When You Leave:
```
[VoiceTracker] User 123456789 leaving voice. Joined at: 1234569690
[VoiceTracker] Session duration: 35 minutes (1234571490 - 1234569690)
```
- Shows the final calculation
- Duration should match your actual time in voice

## Common Test Scenarios

### Scenario 1: Join and Leave Quickly (< 1 minute)
**Expected:** 0 minutes (correct, less than 1 minute rounds down)

### Scenario 2: Stay for 5 Minutes
**Expected:** 5 minutes

### Scenario 3: Stay for 65 Minutes
**Expected:** 65 minutes (or 1h 5m)
**NOT:** 5 minutes ❌

### Scenario 4: Stay for 2 Hours
**Expected:** 120 minutes (or 2h)
**NOT:** 0-10 minutes ❌

## Troubleshooting Test Results

### If Session Shows 0 Minutes:

**Check 1:** Did you stay less than 1 minute?
- Voice time is counted in full minutes
- 59 seconds = 0 minutes (expected behavior)

**Check 2:** Check console for join log
```bash
# Should see:
[VoiceTracker] User 123456789 joining voice at 1234567890
```
- If missing, the join event didn't fire

**Check 3:** Check console for leave log
```bash
# Should see:
[VoiceTracker] User 123456789 leaving voice. Joined at: 1234567890
[VoiceTracker] Session duration: X minutes
```
- If "No join time found", the database didn't record your join

**Check 4:** Check if bot was restarted while you were in voice
- If bot restarts, it loses track of who's in voice
- This is expected behavior

### If Session Shows Very Low Minutes (but you stayed longer):

**Check:** Look at the console logs during updates
```bash
# WRONG (bug still present):
[VoiceTracker] User 123456789: Adding 30 minutes (keeping original joined_at: 1234567890)
# Next update:
[VoiceTracker] User 123456789: Adding 30 minutes (keeping original joined_at: 1234567890)
# Same joined_at = BUG!

# CORRECT (bug fixed):
[VoiceTracker] User 123456789: Adding 30 minutes (keeping original joined_at: 1234567890)
# Next update:
[VoiceTracker] User 123456789: Adding 30 minutes (keeping original joined_at: 1234569690)
# joined_at advanced by 30 minutes = CORRECT!
```

## Database Verification

### Check Current Voice Sessions:
```sql
SELECT user_id, joined_at, total_minutes FROM voice_activity WHERE joined_at IS NOT NULL;
```

**What to look for:**
- `joined_at` should be a recent timestamp (within the last few minutes/hours)
- `total_minutes` should reflect accumulated time

### Check After Leaving:
```sql
SELECT user_id, joined_at, total_minutes FROM voice_activity WHERE user_id = 'YOUR_USER_ID';
```

**What to look for:**
- `joined_at` should be NULL (you left)
- `total_minutes` should have increased by your session time

## Success Criteria

✅ **Test Passes If:**
1. Console shows correct join timestamp
2. Console shows periodic updates (if session > 1 minute)
3. Console shows correct session duration on leave
4. Discord embed shows correct session time
5. Total voice time increases correctly
6. Users can earn roles after required time

❌ **Test Fails If:**
1. Session always shows 0 minutes
2. Session shows very low minutes for long stays
3. Console shows "No join time found"
4. joined_at doesn't advance during updates
5. Total voice time doesn't increase

## Automated Test Script

If you want to test programmatically:

```javascript
// Test the calculation
const VoiceTracker = require('./utils/voiceTracker');

// Simulate join
const userId = '123456789';
VoiceTracker.joinVoice(userId);

// Wait 2 minutes
setTimeout(() => {
    // Simulate update
    VoiceTracker.updateActiveUsers();
    
    // Wait another 2 minutes
    setTimeout(() => {
        // Simulate leave
        const sessionMinutes = VoiceTracker.leaveVoice(userId);
        console.log(`Test Result: ${sessionMinutes} minutes`);
        console.log(`Expected: ~4 minutes`);
        console.log(`Test ${sessionMinutes >= 3 && sessionMinutes <= 5 ? 'PASSED' : 'FAILED'}`);
    }, 120000);
}, 120000);
```

## Real-World Test

The best test is real usage:
1. Deploy the fix
2. Have users join voice normally
3. Monitor the logs for a day
4. Check if session times look accurate
5. Verify users are earning roles correctly

## Reporting Issues

If tests fail, collect:
1. Console output (full logs from join to leave)
2. Discord embed screenshot
3. Database query results
4. How long you actually stayed in voice
5. Bot version/commit hash

This helps diagnose any remaining issues.
