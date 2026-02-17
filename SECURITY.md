# Security Guide

## 🔒 Security Features Implemented

### 1. Environment Variable Validation
- All required environment variables are validated on startup
- Bot exits gracefully if configuration is missing or invalid
- No hardcoded credentials in source code

### 2. Input Validation
- User inputs are validated before processing
- Maximum value checks on numeric inputs (hours limited to 10,000)
- Bot users are blocked from admin commands
- Discord snowflake ID validation

### 3. Rate Limiting
- Commands are rate-limited to prevent spam (5 uses per minute per user)
- Admins bypass rate limiting
- Automatic cleanup of old rate limit entries

### 4. Database Security
- All queries use prepared statements (prevents SQL injection)
- WAL mode enabled for better concurrency
- Foreign keys enabled for data integrity
- Database file stored outside web-accessible directories

### 5. Error Handling
- Global error handlers for uncaught exceptions
- Graceful error messages to users
- Detailed error logging for debugging
- Try-catch blocks around critical operations

### 6. Permission Checks
- Admin commands require proper Discord permissions
- Role management commands require ManageRoles permission
- Voice time commands require Administrator permission

### 7. DM Security
- DM forwarding only to configured owner
- Auto-reply to users confirming message receipt
- Attachment handling with content type validation

## 🚨 Critical Security Steps Before Hosting

### Step 1: Regenerate Bot Token (URGENT!)
Your bot token was exposed in the .env file. You MUST:

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Go to "Bot" section
4. Click "Reset Token"
5. Copy the new token
6. Update your .env file with the new token
7. NEVER commit .env to git

### Step 2: Configure Environment Variables
```bash
# Copy the example file
copy .env.example .env

# Edit .env with your actual values
# Make sure .env is in .gitignore
```

### Step 3: Set Proper File Permissions (Linux/Mac)
```bash
chmod 600 .env
chmod 700 data/
```

### Step 4: Discord Bot Permissions
Ensure your bot has ONLY these permissions:
- View Channels
- Send Messages
- Embed Links
- Read Message History
- Manage Roles (for role granting)
- Connect (for voice tracking)
- View Voice Channels

### Step 5: Enable Required Intents
In Discord Developer Portal > Bot:
- ✅ Presence Intent
- ✅ Server Members Intent
- ✅ Message Content Intent

## 🛡️ Hosting Security Best Practices

### For VPS/Cloud Hosting

1. **Use a Non-Root User**
   ```bash
   # Create dedicated user
   useradd -m -s /bin/bash hydroxbot
   su - hydroxbot
   ```

2. **Use Process Manager**
   ```bash
   # Install PM2
   npm install -g pm2
   
   # Start bot with PM2
   pm2 start index.js --name hydroxbot
   pm2 save
   pm2 startup
   ```

3. **Enable Firewall**
   ```bash
   # Only allow SSH and necessary ports
   ufw allow 22/tcp
   ufw enable
   ```

4. **Keep System Updated**
   ```bash
   # Regular updates
   apt update && apt upgrade -y
   ```

5. **Use Environment Variables**
   - Never hardcode secrets
   - Use .env files (not committed to git)
   - Consider using secret management services

### For Docker Hosting

1. **Use Docker Secrets**
   ```yaml
   # docker-compose.yml
   services:
     bot:
       image: hydroxbot
       secrets:
         - discord_token
   secrets:
     discord_token:
       external: true
   ```

2. **Run as Non-Root**
   ```dockerfile
   USER node
   ```

3. **Limit Resources**
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '0.5'
         memory: 512M
   ```

## 🔍 Security Monitoring

### What to Monitor
- Failed login attempts
- Unusual command usage patterns
- Database size growth
- Memory/CPU usage spikes
- Error rates in logs

### Logging
- All admin actions are logged
- Voice events are tracked
- Role grants are recorded
- Errors are logged with timestamps

## 🚫 What NOT to Do

1. ❌ Never commit .env file to git
2. ❌ Never share your bot token
3. ❌ Never run bot as root user
4. ❌ Never disable input validation
5. ❌ Never expose database file publicly
6. ❌ Never hardcode credentials
7. ❌ Never disable rate limiting
8. ❌ Never ignore error logs

## 📋 Pre-Deployment Checklist

- [ ] Bot token regenerated (if exposed)
- [ ] .env file configured with correct values
- [ ] .env file NOT committed to git
- [ ] .gitignore includes .env and data/
- [ ] All required Discord intents enabled
- [ ] Bot permissions set correctly in Discord
- [ ] Database directory has proper permissions
- [ ] Process manager configured (PM2 or similar)
- [ ] Error logging configured
- [ ] Backup strategy in place for database
- [ ] Monitoring/alerting set up
- [ ] Documentation reviewed

## 🆘 Security Incident Response

If you suspect a security breach:

1. **Immediately regenerate bot token**
2. **Check audit logs in Discord**
3. **Review bot logs for suspicious activity**
4. **Check database for unauthorized changes**
5. **Update all credentials**
6. **Review and update permissions**

## 📞 Reporting Security Issues

If you discover a security vulnerability:
- Do NOT open a public issue
- Contact the bot owner directly
- Provide detailed information
- Allow time for fix before disclosure

## 🔄 Regular Security Maintenance

### Weekly
- Review error logs
- Check for unusual activity
- Monitor resource usage

### Monthly
- Update dependencies: `npm audit fix`
- Review and rotate credentials
- Check for Discord.js updates
- Review access logs

### Quarterly
- Full security audit
- Update documentation
- Review and update permissions
- Test backup restoration

## 📚 Additional Resources

- [Discord.js Security Best Practices](https://discordjs.guide/popular-topics/common-questions.html)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
