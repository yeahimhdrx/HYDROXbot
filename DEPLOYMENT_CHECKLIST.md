# Deployment Readiness Checklist

## ✅ Pre-Deployment Steps

### 1. Security (CRITICAL)
- [ ] **REGENERATE BOT TOKEN** - Your token was exposed and must be regenerated
- [ ] Configure new token in .env file
- [ ] Verify .env is in .gitignore
- [ ] Never commit .env to git
- [ ] Set proper file permissions (chmod 600 .env on Linux)

### 2. Environment Configuration
- [ ] Copy .env.example to .env
- [ ] Set DISCORD_TOKEN (regenerated token)
- [ ] Set CLIENT_ID (bot client ID)
- [ ] Set GUILD_ID (your server ID)
- [ ] Set LOG_CHANNEL_ID (channel for bot logs)
- [ ] Set OWNER_ID (your Discord user ID)

### 3. Discord Bot Setup
- [ ] Bot created in Discord Developer Portal
- [ ] Bot invited to server with correct permissions:
  - View Channels
  - Send Messages
  - Embed Links
  - Read Message History
  - Manage Roles
  - Connect
  - View Voice Channels
- [ ] Required intents enabled:
  - Presence Intent
  - Server Members Intent
  - Message Content Intent

### 4. Discord Server Setup
- [ ] Create these exact role names:
  - 𝐅𝐑𝐈𝐄𝐍𝐃𝐒
  - 𝐀𝐒𝐂𝐄𝐍𝐃𝐀𝐍𝐓
  - 𝐄𝐏𝐈𝐂
  - 𝐋𝐄𝐆𝐄𝐍𝐃
  - 𝐄𝐋𝐈𝐓𝐄
  - 𝐂𝐇𝐀𝐌𝐏𝐈𝐎𝐍
  - 𝐌𝐘𝐓𝐇𝐈𝐂
- [ ] Bot's role positioned ABOVE these roles
- [ ] Create log channel for bot events
- [ ] Test bot can send messages in log channel

### 5. Code & Dependencies
- [ ] Node.js 18+ installed
- [ ] Run `npm install` to install dependencies
- [ ] Run `npm audit` to check for vulnerabilities
- [ ] Fix any critical vulnerabilities: `npm audit fix`
- [ ] Test bot locally before deploying

### 6. Database
- [ ] data/ directory will be created automatically
- [ ] Ensure data/ is in .gitignore
- [ ] Plan backup strategy for bot.db file
- [ ] Set proper permissions on data/ directory

### 7. Commands Deployment
- [ ] Run `npm run deploy` to register slash commands
- [ ] Verify commands appear in Discord server
- [ ] Test each command works correctly

## 🚀 Deployment Options

### Option A: VPS/Cloud Server (Recommended)

#### Initial Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Create bot user (security)
sudo useradd -m -s /bin/bash hydroxbot
sudo su - hydroxbot

# Clone/upload your bot code
cd ~
# Upload your files here

# Install dependencies
npm install --production

# Configure environment
cp .env.example .env
nano .env  # Edit with your values

# Deploy commands
npm run deploy

# Start bot with PM2
pm2 start index.js --name hydroxbot
pm2 save
pm2 startup  # Follow instructions

# Monitor bot
pm2 logs hydroxbot
pm2 status
```

#### Checklist
- [ ] Server has Node.js 18+
- [ ] PM2 installed and configured
- [ ] Bot running as non-root user
- [ ] Firewall configured (only SSH allowed)
- [ ] PM2 startup script configured
- [ ] Bot auto-restarts on crash
- [ ] Logs are being written

### Option B: Docker (Advanced)

#### Build and Run
```bash
# Build image
docker build -t hydroxbot .

# Run container
docker run -d \
  --name hydroxbot \
  --restart unless-stopped \
  --env-file .env \
  -v $(pwd)/data:/app/data \
  hydroxbot

# View logs
docker logs -f hydroxbot
```

#### Checklist
- [ ] Docker installed
- [ ] Image built successfully
- [ ] Container running
- [ ] Data volume mounted
- [ ] Restart policy set
- [ ] Logs accessible

### Option C: Hosting Services

#### Railway.app
1. Create account at railway.app
2. New Project > Deploy from GitHub
3. Add environment variables in dashboard
4. Deploy

#### Heroku
1. Create Heroku account
2. Install Heroku CLI
3. `heroku create hydroxbot`
4. Set environment variables: `heroku config:set DISCORD_TOKEN=...`
5. `git push heroku main`

#### Checklist
- [ ] Account created
- [ ] Environment variables configured
- [ ] Database persistence configured
- [ ] Deployment successful
- [ ] Bot online in Discord

## 🧪 Testing Before Going Live

### Test Commands
```
/ping - Check bot latency
/stats - Check your stats
/stats @user - Check another user's stats (admin)
/settag check @user - Check tag status (admin)
/checkroles - Manual role check (admin)
/testdm - Test DM messages (admin)
```

### Test Scenarios
- [ ] Bot responds to /ping
- [ ] Join voice channel - bot tracks time
- [ ] Leave voice channel - bot logs session
- [ ] /stats shows correct voice time
- [ ] Admin commands work
- [ ] Non-admins cannot use admin commands
- [ ] Rate limiting works (spam commands)
- [ ] DM forwarding works
- [ ] Role granting works (test with low hours)
- [ ] Tag reminders work
- [ ] Logs appear in log channel

## 📊 Post-Deployment Monitoring

### First 24 Hours
- [ ] Monitor bot uptime
- [ ] Check error logs
- [ ] Verify voice tracking works
- [ ] Test role granting
- [ ] Monitor memory usage
- [ ] Check database growth

### First Week
- [ ] Review all logs
- [ ] Check for any errors
- [ ] Verify all features working
- [ ] Monitor performance
- [ ] Gather user feedback

### Ongoing
- [ ] Weekly log review
- [ ] Monthly dependency updates
- [ ] Regular backups of database
- [ ] Monitor disk space
- [ ] Check for Discord.js updates

## 🔧 Maintenance Commands

### PM2 (if using)
```bash
pm2 restart hydroxbot    # Restart bot
pm2 stop hydroxbot       # Stop bot
pm2 logs hydroxbot       # View logs
pm2 status               # Check status
pm2 monit                # Monitor resources
```

### Docker (if using)
```bash
docker restart hydroxbot     # Restart container
docker stop hydroxbot        # Stop container
docker logs -f hydroxbot     # View logs
docker stats hydroxbot       # Monitor resources
```

### Database Backup
```bash
# Backup database
cp data/bot.db data/bot.db.backup.$(date +%Y%m%d)

# Restore database
cp data/bot.db.backup.YYYYMMDD data/bot.db
```

## 🆘 Troubleshooting

### Bot Won't Start
1. Check .env file exists and has correct values
2. Verify bot token is valid (regenerate if needed)
3. Check Node.js version: `node --version` (need 18+)
4. Check logs for error messages
5. Verify all dependencies installed: `npm install`

### Bot Online But Not Responding
1. Check bot has correct permissions in Discord
2. Verify intents are enabled in Developer Portal
3. Check slash commands are deployed: `npm run deploy`
4. Review error logs
5. Test with /ping command

### Voice Tracking Not Working
1. Verify bot has Connect permission
2. Check bot can see voice channels
3. Review logs for voice events
4. Test by joining/leaving voice channel
5. Check database for entries

### Roles Not Being Granted
1. Verify role names match exactly (including special characters)
2. Check bot's role is above the roles it's granting
3. Verify bot has Manage Roles permission
4. Check user meets requirements (hours + tag if needed)
5. Run /checkroles to manually trigger check

## 📞 Support

If you encounter issues:
1. Check logs first
2. Review this checklist
3. Check SECURITY.md for security issues
4. Review README.md for setup instructions
5. Check Discord.js documentation

## ✨ You're Ready!

Once all items are checked:
- ✅ Security measures in place
- ✅ Environment configured
- ✅ Bot deployed and running
- ✅ Commands working
- ✅ Monitoring set up

Your HYDROX Bot is ready to track voice activity and grant roles!
