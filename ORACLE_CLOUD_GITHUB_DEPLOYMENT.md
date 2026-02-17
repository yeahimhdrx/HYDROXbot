# Oracle Cloud + GitHub Deployment Guide

Complete guide to deploy your HYDROX Bot to Oracle Cloud using GitHub for easy updates and version control.

---

## 🎯 Why Use GitHub?

✅ Easy updates (just `git pull`)
✅ Version control and history
✅ Professional workflow
✅ Easy rollback if something breaks
✅ No manual file uploads needed

---

## 📋 Part 1: Prepare Your Code for GitHub

### Step 1: Verify .gitignore

Your `.gitignore` should already have these (already configured ✅):

```
node_modules/
.env
.env.local
.env.*.local
data/
*.db
*.db-shm
*.db-wal
*.log
.DS_Store
```

**CRITICAL:** This prevents your bot token and database from being uploaded to GitHub!

### Step 2: Stop the Local Bot

```powershell
# Stop the bot if it's running
# Press Ctrl+C in the terminal where it's running
```

---

## 🌐 Part 2: Create GitHub Repository

### Step 1: Create GitHub Account (if needed)

1. Go to https://github.com
2. Click "Sign up"
3. Follow the registration process
4. Verify your email

### Step 2: Create New Repository

1. **Login to GitHub**
2. **Click the "+" icon** (top right) → "New repository"
3. **Configure Repository:**
   - Repository name: `hydroxbot` (or any name you want)
   - Description: `HYDROX Discord Bot - Voice Activity Tracker`
   - Visibility: **Private** (recommended) or Public
   - ❌ Do NOT initialize with README (we already have files)
   - ❌ Do NOT add .gitignore (we already have one)
   - ❌ Do NOT add license yet
4. **Click "Create repository"**

### Step 3: Note Your Repository URL

You'll see something like:
```
https://github.com/YOUR_USERNAME/hydroxbot.git
```

Copy this URL - you'll need it!

---

## 💻 Part 3: Push Code to GitHub

### For Windows Users (Using Git Bash or PowerShell)

#### Install Git (if not installed)

1. Download from https://git-scm.com/download/win
2. Install with default settings
3. Restart PowerShell/Terminal

#### Push Your Code

Open PowerShell in your bot directory:

```powershell
# Navigate to your bot directory
cd "C:\Users\Alumno 2\Documents\HydroxBot\HYDROXbot"

# Initialize git repository
git init

# Configure git (first time only)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Add all files (respects .gitignore)
git add .

# Check what will be committed (verify .env is NOT listed!)
git status

# Commit files
git commit -m "Initial commit - HYDROX Bot"

# Add remote repository (replace with YOUR repository URL)
git remote add origin https://github.com/YOUR_USERNAME/hydroxbot.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Enter your GitHub credentials when prompted.**

### Verify Upload

1. Go to your GitHub repository page
2. You should see all your files EXCEPT:
   - ❌ .env (should NOT be there!)
   - ❌ node_modules/ (should NOT be there!)
   - ❌ data/ (should NOT be there!)
3. ✅ You SHOULD see:
   - ✅ All .js files
   - ✅ package.json
   - ✅ .env.example
   - ✅ All .md documentation files

**IMPORTANT:** If you see .env file in GitHub, DELETE IT IMMEDIATELY and regenerate your bot token!

---

## ☁️ Part 4: Set Up Oracle Cloud Instance

### Step 1: Create Oracle Cloud Account

1. Go to https://www.oracle.com/cloud/free/
2. Click "Start for free"
3. Complete registration (credit card required but won't be charged)
4. Verify email and complete setup

### Step 2: Create Compute Instance

1. **Login to Oracle Cloud Console**
   - https://cloud.oracle.com/

2. **Navigate to Compute**
   - Click ☰ menu → Compute → Instances

3. **Create Instance**
   - Click "Create Instance"

4. **Configure Instance:**

   **Name:**
   ```
   hydroxbot
   ```

   **Image:**
   - Click "Change Image"
   - Select "Canonical Ubuntu 22.04"
   - Click "Select Image"

   **Shape:**
   - Click "Change Shape"
   - Select "Ampere" (ARM-based, free tier)
   - Choose: **VM.Standard.A1.Flex**
   - OCPUs: 2 (free tier allows up to 4)
   - Memory: 12 GB (free tier allows up to 24 GB)
   - Click "Select Shape"

   **Networking:**
   - ✅ "Assign a public IPv4 address" (must be checked!)

   **SSH Keys:**
   - Click "Generate a key pair for me"
   - Click "Save Private Key" → Save as `hydroxbot-key.key`
   - Click "Save Public Key" (optional)
   - **IMPORTANT:** Keep this key safe! You can't download it again!

5. **Click "Create"**

6. **Wait 1-2 minutes** for status to change to "RUNNING"

7. **Copy the Public IP Address**
   - Example: `123.456.789.012`
   - You'll need this!

### Step 3: Configure Firewall

1. **From Instance Details:**
   - Click on the Subnet link

2. **Edit Security List:**
   - Click "Default Security List"
   - Click "Add Ingress Rules"

3. **Add SSH Rule:**
   - Source CIDR: `0.0.0.0/0`
   - IP Protocol: TCP
   - Destination Port Range: `22`
   - Description: `SSH`
   - Click "Add Ingress Rules"

---

## 🔐 Part 5: Connect to Your Server

### For Windows (Using PowerShell)

```powershell
# Set key permissions (important!)
icacls "C:\path\to\hydroxbot-key.key" /inheritance:r
icacls "C:\path\to\hydroxbot-key.key" /grant:r "%username%:R"

# Connect via SSH
ssh -i "C:\path\to\hydroxbot-key.key" ubuntu@YOUR_PUBLIC_IP
```

Replace:
- `C:\path\to\hydroxbot-key.key` with actual path to your key
- `YOUR_PUBLIC_IP` with your instance's public IP

Type `yes` when asked about authenticity.

### For Mac/Linux

```bash
# Set key permissions
chmod 400 ~/Downloads/hydroxbot-key.key

# Connect via SSH
ssh -i ~/Downloads/hydroxbot-key.key ubuntu@YOUR_PUBLIC_IP
```

---

## 🛠️ Part 6: Set Up Server Environment

### Step 1: Update System

```bash
# Update package list
sudo apt update

# Upgrade packages (this may take 5-10 minutes)
sudo apt upgrade -y

# Install essential tools
sudo apt install -y git curl build-essential
```

### Step 2: Install Node.js 18

```bash
# Download Node.js setup script
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x or higher
```

### Step 3: Install PM2 (Process Manager)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Verify installation
pm2 --version
```

### Step 4: Configure Firewall

```bash
# Allow SSH (important!)
sudo ufw allow 22/tcp

# Enable firewall
sudo ufw enable
# Type 'y' and press Enter

# Check status
sudo ufw status
```

### Step 5: Create Bot User (Security Best Practice)

```bash
# Create dedicated user
sudo useradd -m -s /bin/bash hydroxbot

# Set password (optional but recommended)
sudo passwd hydroxbot
# Enter a password twice

# Switch to bot user
sudo su - hydroxbot
```

You're now logged in as the `hydroxbot` user!

---

## 📦 Part 7: Clone Repository and Set Up Bot

### Step 1: Clone from GitHub

```bash
# Make sure you're the hydroxbot user
whoami  # Should show: hydroxbot

# Clone your repository
git clone https://github.com/YOUR_USERNAME/hydroxbot.git bot

# Navigate to bot directory
cd bot

# Verify files are there
ls -la
```

You should see all your bot files!

### Step 2: Create .env File

```bash
# Create .env file
nano .env
```

Paste your configuration (replace with YOUR actual values):

```env
# Discord Bot Configuration
DISCORD_TOKEN=your_actual_bot_token_here
CLIENT_ID=your_client_id_here
GUILD_ID=your_guild_id_here
LOG_CHANNEL_ID=your_log_channel_id_here
OWNER_ID=your_owner_id_here
```

**Save and exit:**
- Press `Ctrl + X`
- Press `Y`
- Press `Enter`

### Step 3: Secure .env File

```bash
# Set proper permissions (only owner can read)
chmod 600 .env

# Verify permissions
ls -la .env
# Should show: -rw------- (only owner can read/write)
```

### Step 4: Install Dependencies

```bash
# Install all npm packages
npm install

# This will take 2-5 minutes
# You should see packages being installed
```

### Step 5: Deploy Commands

```bash
# Deploy slash commands to Discord
npm run deploy
```

You should see:
```
✅ Successfully reloaded 7 application (/) commands.
```

---

## 🚀 Part 8: Start Bot with PM2

### Step 1: Start Bot

```bash
# Start bot with PM2
pm2 start index.js --name hydroxbot

# Check status
pm2 status
```

You should see:
```
┌─────┬──────────────┬─────────┬─────────┬─────────┐
│ id  │ name         │ status  │ restart │ uptime  │
├─────┼──────────────┼─────────┼─────────┼─────────┤
│ 0   │ hydroxbot    │ online  │ 0       │ 5s      │
└─────┴──────────────┴─────────┴─────────┴─────────┘
```

### Step 2: View Logs

```bash
# View live logs
pm2 logs hydroxbot

# You should see:
# ✅ Bot is online as HYDROX Bot#5619
# 📊 Started tracking users...
```

Press `Ctrl + C` to exit logs.

### Step 3: Configure Auto-Start on Reboot

```bash
# Save PM2 configuration
pm2 save

# Generate startup script
pm2 startup

# PM2 will show a command like:
# sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u hydroxbot --hp /home/hydroxbot

# Copy and run that command (exit to ubuntu user first)
exit  # Exit from hydroxbot user back to ubuntu

# Run the command PM2 showed you (paste it)
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u hydroxbot --hp /home/hydroxbot

# Switch back to hydroxbot user
sudo su - hydroxbot
cd bot
```

### Step 4: Test Auto-Restart

```bash
# Test if bot restarts on crash
pm2 restart hydroxbot

# Check status
pm2 status

# Should show bot is online again
```

---

## ✅ Part 9: Verify Everything Works

### On the Server

```bash
# Check bot status
pm2 status

# View recent logs
pm2 logs hydroxbot --lines 50

# Monitor resources
pm2 monit
# Press Ctrl+C to exit
```

### In Discord

1. ✅ Check bot is online (green status)
2. ✅ Try `/ping` command
3. ✅ Try `/stats` command
4. ✅ Join a voice channel - bot should track time
5. ✅ Check your log channel for bot messages

---

## 🔄 Part 10: Update Bot (When You Make Changes)

### On Your Local Computer

```powershell
# Make your code changes
# Test locally

# Commit changes
git add .
git commit -m "Description of changes"
git push origin main
```

### On Oracle Cloud Server

```bash
# Switch to bot user
sudo su - hydroxbot
cd bot

# Stop bot
pm2 stop hydroxbot

# Pull latest changes from GitHub
git pull origin main

# Install any new dependencies
npm install

# Restart bot
pm2 restart hydroxbot

# Check logs
pm2 logs hydroxbot --lines 20
```

That's it! Your bot is updated! 🎉

---

## 📊 Part 11: Useful Commands

### PM2 Management

```bash
# View status
pm2 status

# View logs (live)
pm2 logs hydroxbot

# View logs (last 100 lines)
pm2 logs hydroxbot --lines 100

# Restart bot
pm2 restart hydroxbot

# Stop bot
pm2 stop hydroxbot

# Start bot
pm2 start hydroxbot

# Monitor resources
pm2 monit

# View detailed info
pm2 show hydroxbot
```

### System Monitoring

```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check system resources
htop
# Install if needed: sudo apt install htop

# Check bot process
ps aux | grep node
```

### Git Commands

```bash
# Check current status
git status

# View commit history
git log --oneline

# Pull latest changes
git pull origin main

# View remote URL
git remote -v

# Discard local changes (careful!)
git reset --hard origin/main
```

### Database Management

```bash
# View database
sqlite3 data/bot.db

# SQL commands:
.tables                          # List tables
SELECT * FROM voice_activity;    # View voice data
SELECT * FROM role_grants;       # View granted roles
.exit                           # Exit sqlite3
```

---

## 🔐 Part 12: Security Best Practices

### Secure SSH

```bash
# Edit SSH config
sudo nano /etc/ssh/sshd_config

# Find and change:
PermitRootLogin no
PasswordAuthentication no

# Save and restart SSH
sudo systemctl restart sshd
```

### Set Up Automatic Updates

```bash
# Install unattended-upgrades
sudo apt install unattended-upgrades -y

# Enable automatic security updates
sudo dpkg-reconfigure -plow unattended-upgrades
# Select "Yes"
```

### Regular Backups

```bash
# Create backup script
nano ~/backup.sh
```

Paste this:

```bash
#!/bin/bash
BACKUP_DIR="/home/hydroxbot/backups"
BOT_DIR="/home/hydroxbot/bot"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
cp $BOT_DIR/data/bot.db $BACKUP_DIR/bot.db.$DATE

# Keep only last 7 backups
cd $BACKUP_DIR
ls -t bot.db.* | tail -n +8 | xargs -r rm

echo "Backup completed: bot.db.$DATE"
```

Make executable and schedule:

```bash
# Make executable
chmod +x ~/backup.sh

# Test backup
~/backup.sh

# Schedule daily backups (2 AM)
crontab -e
# Select nano (option 1)
# Add this line:
0 2 * * * /home/hydroxbot/backup.sh

# Save and exit
```

---

## 🆘 Part 13: Troubleshooting

### Bot Won't Start

```bash
# Check logs for errors
pm2 logs hydroxbot --lines 100

# Try running manually to see errors
cd /home/hydroxbot/bot
node index.js
# Press Ctrl+C to stop

# Check .env file exists
ls -la .env

# Check file permissions
ls -la

# Reinstall dependencies
rm -rf node_modules
npm install
```

### Can't Connect via SSH

1. Check instance is running in Oracle Cloud Console
2. Verify public IP address is correct
3. Check security list allows port 22
4. Verify SSH key path is correct
5. Try verbose mode: `ssh -v -i key.key ubuntu@IP`

### Git Pull Fails

```bash
# Check git status
git status

# If you have local changes, stash them
git stash

# Pull again
git pull origin main

# Apply stashed changes (if needed)
git stash pop
```

### Bot Crashes Frequently

```bash
# Check system resources
free -h
df -h

# Check PM2 logs
pm2 logs hydroxbot --lines 200

# Restart with memory limit
pm2 delete hydroxbot
pm2 start index.js --name hydroxbot --max-memory-restart 300M
pm2 save
```

### Database Locked

```bash
# Check for multiple instances
pm2 status
ps aux | grep node

# Stop all instances
pm2 delete all

# Start fresh
pm2 start index.js --name hydroxbot
pm2 save
```

---

## 📋 Complete Deployment Checklist

### GitHub Setup
- [ ] .gitignore configured (excludes .env, node_modules, data/)
- [ ] GitHub repository created (private recommended)
- [ ] Code pushed to GitHub
- [ ] Verified .env is NOT in GitHub

### Oracle Cloud Setup
- [ ] Oracle Cloud account created
- [ ] Compute instance created (Ubuntu 22.04)
- [ ] Public IP address noted
- [ ] SSH key downloaded and saved securely
- [ ] Security list configured (port 22 open)

### Server Configuration
- [ ] Connected via SSH
- [ ] System updated (apt update && upgrade)
- [ ] Node.js 18+ installed
- [ ] PM2 installed
- [ ] Firewall configured (ufw)
- [ ] Bot user created

### Bot Deployment
- [ ] Repository cloned from GitHub
- [ ] .env file created with correct values
- [ ] .env file permissions set (chmod 600)
- [ ] Dependencies installed (npm install)
- [ ] Commands deployed (npm run deploy)
- [ ] Bot started with PM2
- [ ] PM2 startup configured
- [ ] PM2 configuration saved

### Verification
- [ ] Bot shows "online" in PM2 status
- [ ] Bot appears online in Discord
- [ ] /ping command works
- [ ] /stats command works
- [ ] Voice tracking works
- [ ] Logs appear in Discord channel
- [ ] No errors in PM2 logs

### Security
- [ ] SSH secured (no root login, no password auth)
- [ ] Automatic updates enabled
- [ ] Backup script created and scheduled
- [ ] .env file secured (600 permissions)

---

## 🎉 Success!

Your HYDROX Bot is now:

✅ Hosted on Oracle Cloud (FREE!)
✅ Running 24/7 with PM2
✅ Auto-restarts on crash
✅ Auto-starts on server reboot
✅ Easy to update via GitHub
✅ Secure and production-ready
✅ Backed up automatically

### What You've Accomplished

- Professional deployment workflow
- Version control with GitHub
- Free cloud hosting
- Automatic process management
- Security best practices
- Easy update process

### Next Steps

1. Monitor bot for first 24 hours
2. Test all features in Discord
3. Set up monitoring/alerts (optional)
4. Share with your community!

---

## 📞 Quick Reference

### Important URLs
- Oracle Cloud Console: https://cloud.oracle.com/
- GitHub Repository: https://github.com/YOUR_USERNAME/hydroxbot
- Discord Developer Portal: https://discord.com/developers/applications

### Important Commands
```bash
# Connect to server
ssh -i key.key ubuntu@YOUR_IP

# Switch to bot user
sudo su - hydroxbot

# Navigate to bot
cd bot

# Check bot status
pm2 status

# View logs
pm2 logs hydroxbot

# Update bot
git pull && npm install && pm2 restart hydroxbot
```

### Important Files
- Bot code: `/home/hydroxbot/bot/`
- Database: `/home/hydroxbot/bot/data/bot.db`
- Logs: `pm2 logs hydroxbot`
- Backups: `/home/hydroxbot/backups/`

---

**Congratulations! Your bot is now professionally hosted on Oracle Cloud! 🚀**

Need help? Check the Troubleshooting section or review the logs with `pm2 logs hydroxbot`.
