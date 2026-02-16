# 🏷️ HYDROX Tag Reminder System

## Overview
The bot now automatically sends professional DM reminders to members who have earned enough voice time for tag-required roles (LEGEND and above) but haven't added the HDRX tag yet.

## How It Works

### Automatic Detection
- Bot checks voice time after every voice session
- When a user reaches 100h, 150h, 200h, or 250h without the HDRX tag
- Automatically sends a beautiful DM reminder

### Smart Reminders
- ✅ Only sends ONE reminder per role (won't spam)
- ✅ Sends a new reminder when they reach the next role tier
- ✅ Stops sending once they add the tag
- ✅ Automatically grants roles when tag is added

## Roles That Trigger Reminders

| Role | Hours Required | Tag Required |
|------|----------------|--------------|
| 𝐋𝐄𝐆𝐄𝐍𝐃 | 100h | ✅ Yes |
| 𝐄𝐋𝐈𝐓𝐄 | 150h | ✅ Yes |
| 𝐂𝐇𝐀𝐌𝐏𝐈𝐎𝐍 | 200h | ✅ Yes |
| 𝐌𝐘𝐓𝐇𝐈𝐂 | 250h | ✅ Yes |

## DM Message Format

The reminder includes:
- 🎉 Congratulations on reaching the milestone
- 🎭 Which role they're eligible for
- ⏱️ Their current voice time
- 📝 Step-by-step instructions to add the tag
- 🏷️ Clear explanation of what's needed

## Example Scenario

**User Journey:**
1. User reaches 100 hours of voice time
2. Bot sends DM: "You've unlocked LEGEND role! Add [HDRX] tag to claim it"
3. User continues without adding tag
4. User reaches 150 hours
5. Bot sends NEW DM: "You've unlocked ELITE role! Add [HDRX] tag to claim it"
6. User adds [HDRX] to their nickname
7. Staff runs `/settag add @user`
8. Bot automatically grants ALL eligible roles (LEGEND + ELITE)
9. No more reminders sent (they have the tag now)

## Staff Actions

### When User Adds Tag
```
/settag add @user
```
- Bot marks user as having tag
- Automatically checks and grants ALL eligible roles
- Sends congratulations DMs for each role
- Logs everything to staff channel

### When User Removes Tag
```
/settag remove @user
```
- Bot marks user as not having tag
- Future reminders will be sent again if they reach new milestones

## Logging

Every reminder is logged to your staff channel with:
- 📨 Tag Reminder Sent notification
- User mention (clickable)
- Which role they're eligible for
- Their current voice time
- Status: "Waiting for tag"

## Database Tracking

The bot tracks reminders in the database:
- Prevents duplicate reminders for the same role
- Allows new reminders for higher tier roles
- Persists across bot restarts

## Benefits

### For Members:
- Clear communication about achievements
- Step-by-step guidance
- Motivation to add the tag
- No confusion about requirements

### For Staff:
- Less manual reminders needed
- Automatic role granting when tag is added
- Full audit trail in logs
- Reduced workload

## Privacy

- DMs are only sent to eligible users
- If user has DMs disabled, bot logs it but doesn't spam
- No personal data stored beyond user ID and role eligibility

## Testing

To test the system:
1. Use `/voicetime set @user 100` to give someone 100 hours
2. Make sure they don't have the tag: `/settag check @user`
3. Run `/checkroles` to trigger the check
4. User should receive a DM reminder
5. Add the tag: `/settag add @user`
6. User should automatically get the LEGEND role

## Customization

To modify the DM message, edit `utils/roleManager.js` in the `sendTagReminder` function.

The message includes:
- Embed with orange color (#f39c12)
- User's achievement details
- Clear call-to-action
- Instructions on how to add tag
- Friendly, encouraging tone

## Troubleshooting

**User didn't receive DM:**
- Check if user has DMs disabled
- Check console logs for "Could not send tag reminder DM"
- Verify user actually meets the requirements

**Reminder sent multiple times:**
- This shouldn't happen - check database integrity
- Each user+role combination is tracked uniquely

**Role not granted after adding tag:**
- Make sure staff ran `/settag add @user`
- Check bot has permission to grant roles
- Verify bot role is above the role being granted

## Future Enhancements

Possible additions:
- Configurable reminder messages
- Multiple reminder attempts
- Reminder cooldown periods
- Statistics on tag adoption rates
