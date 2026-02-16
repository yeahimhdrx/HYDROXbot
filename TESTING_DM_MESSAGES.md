# 🧪 Testing DM Messages

## New Command: `/testdm`

You can now test all the DM messages that the bot sends to users!

## How to Use

### Command
```
/testdm type:[message_type]
```

### Available Message Types

1. **Role Granted (FRIENDS)**
   - Tests the congratulations message for earning the FRIENDS role (20h)
   - Shows the standard role achievement message

2. **Role Granted (LEGEND)**
   - Tests the congratulations message for earning the LEGEND role (100h)
   - Shows the message for tag-required roles

3. **Tag Reminder (LEGEND)**
   - Tests the tag reminder for LEGEND role (100h)
   - Shows the beautiful embed asking users to add HDRX tag

4. **Tag Reminder (ELITE)**
   - Tests the tag reminder for ELITE role (150h)
   - Shows the reminder for higher tier role

5. **Tag Reminder (MYTHIC)**
   - Tests the tag reminder for MYTHIC role (250h)
   - Shows the reminder for the ultimate role

## Examples

### Test Role Achievement Message
```
/testdm type:Role Granted (FRIENDS)
```
You'll receive a DM with:
```
🎉 Congratulations! You've earned the 𝐅𝐑𝐈𝐄𝐍𝐃𝐒 role in HYDROX Community! 
You've spent 20 hours with us in voice chat. Keep it up!
```

### Test Tag Reminder
```
/testdm type:Tag Reminder (LEGEND)
```
You'll receive a beautiful embed DM with:
- Title: 🏷️ HYDROX Tag Required!
- Your achievement (100h reached)
- Role available (LEGEND)
- Instructions on how to add the tag
- Motivational message

## What You'll See

### Role Achievement Messages
Simple text messages like:
- "🎉 Congratulations! You've earned the [ROLE] role..."
- Includes hours spent
- Motivational message

### Tag Reminder Messages
Beautiful embeds with:
- 🏷️ Orange color theme
- Your username
- Achievement unlocked section
- Role available
- Required time (with checkmark)
- Clear instructions on adding tag
- Step-by-step guide
- Footer with timestamp

## Requirements

- **Admin Only** - Only administrators can use this command
- **DMs Must Be Open** - Make sure you have DMs enabled from server members
- **Ephemeral Response** - Only you see the confirmation message

## Testing Workflow

1. Run `/testdm` with desired message type
2. Check your DMs
3. Review the message format
4. Verify all information is correct
5. Test different message types

## Troubleshooting

### "Could not send DM"
- Enable DMs from server members in your privacy settings
- Server Settings → Privacy & Safety → Allow direct messages from server members

### Message Not Received
- Check your DM inbox
- Look in message requests
- Verify bot is online

### Wrong Message Format
- This is a test - actual messages use real data
- Times shown are examples (100h, 150h, 250h)
- Your actual username is used

## Message Types Explained

### 1. Role Granted Messages
**When sent:** When a user earns a role through voice activity
**Content:** Congratulations message with role name and hours
**Format:** Plain text message

### 2. Tag Reminder Messages
**When sent:** When a user reaches hours for tag-required role but doesn't have tag
**Content:** Beautiful embed with instructions
**Format:** Rich embed with fields

## All Role Messages

You can see all role messages in `config.js`:
- 𝐅𝐑𝐈𝐄𝐍𝐃𝐒 (20h)
- 𝐀𝐒𝐂𝐄𝐍𝐃𝐀𝐍𝐓 (40h)
- 𝐄𝐏𝐈𝐂 (60h)
- 𝐋𝐄𝐆𝐄𝐍𝐃 (100h) - Requires tag
- 𝐄𝐋𝐈𝐓𝐄 (150h) - Requires tag
- 𝐂𝐇𝐀𝐌𝐏𝐈𝐎𝐍 (200h) - Requires tag
- 𝐌𝐘𝐓𝐇𝐈𝐂 (250h) - Requires tag

## Customizing Messages

### To Edit Role Messages
1. Open `config.js`
2. Find the role you want to edit
3. Change the `message` field
4. Save and restart bot

### To Edit Tag Reminder
1. Open `utils/roleManager.js`
2. Find the `sendTagReminder` function
3. Edit the embed fields
4. Save and restart bot

## Real vs Test Messages

### Test Messages
- Use example times (100h, 150h, etc.)
- Sent to you (the admin)
- Triggered manually

### Real Messages
- Use actual user's voice time
- Sent to the user who earned it
- Triggered automatically

## Benefits of Testing

✅ Preview messages before users see them
✅ Verify formatting is correct
✅ Check for typos or errors
✅ Ensure instructions are clear
✅ Test DM delivery

## Quick Test All Messages

Run these commands to test everything:
```
/testdm type:Role Granted (FRIENDS)
/testdm type:Role Granted (LEGEND)
/testdm type:Tag Reminder (LEGEND)
/testdm type:Tag Reminder (ELITE)
/testdm type:Tag Reminder (MYTHIC)
```

## Summary

The `/testdm` command lets you:
- Test all bot DM messages
- Preview what users will receive
- Verify message formatting
- Check DM delivery
- Admin-only for safety

Try it now: `/testdm type:Tag Reminder (LEGEND)`
