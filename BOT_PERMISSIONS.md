# HYDROX Bot Permissions

## Current Status
- **Environment**: Development
- **Permission Level**: Administrator (temporary)
- **Plan**: Reduce to specific permissions before production

## Required Permissions (Current Features)

### General Permissions
- **View Channels** - Required to see server channels and voice channels
  - Used by: Voice tracking, logging system

### Text Permissions
- **Send Messages** - Required to send logs and DM responses
  - Used by: Logger, DM forwarding, command responses
  
- **Embed Links** - Required for rich embed messages
  - Used by: All logging, stats command, celebration messages
  
- **Read Message History** - Required for context in channels and message deletion logging
  - Used by: Message handling, logging system, deletion tracking

### Voice Permissions
- **Connect** - Required to detect voice channel activity
  - Used by: Voice tracking system
  
- **View Channel** - Required to see voice channels
  - Used by: Voice tracking system

### Membership Permissions
- **Manage Roles** - Required to grant roles to users
  - Used by: Role granting system (core feature)

- **View Audit Log** - Required to identify who made role changes
  - Used by: Role logging system (to show moderator names)

## Permissions NOT Currently Needed
- ❌ Administrator - Too broad, security risk
- ❌ Manage Server - Not needed for current features
- ❌ Manage Channels - Not creating/editing channels
- ❌ Kick Members - Not moderating users
- ❌ Ban Members - Not moderating users
- ❌ Manage Nicknames - Not changing user nicknames
- ❌ Manage Webhooks - Not using webhooks
- ❌ Manage Emojis - Not managing server emojis
- ❌ Manage Messages - Not deleting/editing messages
- ❌ Mention Everyone - Not needed
- ❌ Use External Emojis - Not needed
- ❌ Manage Threads - Not using threads

## Future Features (Potential Permissions)

### If Adding Moderation Features
- Kick Members - For kick command
- Ban Members - For ban command
- Manage Messages - For message cleanup

### If Adding Channel Management
- Manage Channels - For creating voice/text channels
- Manage Webhooks - For webhook integrations

### If Adding Nickname Features
- Manage Nicknames - For nickname commands
- Change Nickname - For bot's own nickname

### If Adding Reaction Roles
- Add Reactions - For reaction role system
- Manage Messages - For reaction role messages

## Migration Plan

### Phase 1: Development (Current)
- Status: Administrator permission
- Duration: Until all planned features are implemented
- Review: Monthly

### Phase 2: Testing
- Status: Switch to specific permissions
- Test all features work correctly
- Document any missing permissions
- Duration: 1-2 weeks

### Phase 3: Production
- Status: Minimal required permissions only
- Monitor for permission errors
- Add permissions only when needed
- Review: Quarterly

## Permission Change Checklist

When reducing from Administrator:

- [ ] Document all current features
- [ ] List exact permissions needed
- [ ] Create new role with specific permissions
- [ ] Position role above managed roles
- [ ] Assign new role to bot
- [ ] Test all features:
  - [ ] Voice tracking works
  - [ ] Role granting works
  - [ ] Logging works
  - [ ] DM forwarding works
  - [ ] All commands work
- [ ] Remove Administrator role
- [ ] Monitor for 24 hours
- [ ] Document any issues

## Security Notes

### Why Reduce Permissions?
1. **Principle of Least Privilege** - Only grant what's needed
2. **Limit Damage** - If token is compromised, attacker has limited access
3. **Compliance** - Many servers require specific permissions only
4. **Trust** - Users trust bots with minimal permissions more

### When to Keep Administrator?
- Active development phase (current)
- Testing new features frequently
- Small private server with trusted users
- Planning major feature additions

### When to Remove Administrator?
- Going to production
- Bot is feature-complete
- Public server or large community
- Security audit required
- Best practice compliance needed

## Current Recommendation

**For Now (Development):**
✅ Keep Administrator - You're still adding features

**Before Production:**
⚠️ Switch to specific permissions listed above

**After Production:**
✅ Review permissions quarterly
✅ Remove unused permissions
✅ Document all permission changes

## Permission Testing Commands

Test these after reducing permissions:

```
/ping - Test basic functionality
/stats - Test embed creation
/stats @user - Test user data access
Join voice channel - Test voice tracking
Leave voice channel - Test logging
/settag add @user - Test role management
/voicetime add @user 10 - Test database access
/checkroles - Test role granting
DM the bot - Test DM forwarding
```

## Notes

- Bot role must be ABOVE roles it manages
- Some permissions are inherited from @everyone
- Changes take effect immediately (no restart needed)
- Test in a test server first if possible

## Last Updated
Date: Current
Status: Development phase with Administrator permission
Next Review: Before production deployment
