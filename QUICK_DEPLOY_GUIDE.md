# Quick Deploy Guide - Oracle Cloud + GitHub

Fast track guide to get your bot running on Oracle Cloud in under 30 minutes!

---

## 🚀 Quick Overview

1. Push code to GitHub (5 min)
2. Create Oracle Cloud instance (5 min)
3. Connect and set up server (10 min)
4. Clone and start bot (10 min)

**Total time: ~30 minutes**

---

## Part 1: GitHub (5 minutes)

### Push Your Code

```powershell
# In your bot directory
cd "C:\Users\Alumno 2\Documents\HydroxBot\HYDROXbot"

# Initialize and push
git init
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/hydroxbot.git
git branch -M main
git push -u origin main
```

**Create repository first at:** https://github.com/new
- Name: `hydroxbot`
- Private repository
- Don't initialize with anything

---

## Part 2: Oracle Cloud (5 minutes)

### Create Instance

1. Go to https://cloud.oracle.com/
2. Compute → Instances → Create Instance
3. **Name:** `hydroxbot`
4. **Image:** Ubuntu 22.04
5. **Shape:** VM.Standard.A1.Flex (2 OCPUs, 12GB RAM)
6. **SSH Keys:** Generate and download key
7. **Create** and wait for "RUNNING" status
8. **Copy Public IP Address**

### Configure Firewall

1. Click Subnet → Default Security List
2. Add Ingress Rule:
   - Source: `0.0.0.0/0`
   - Port: `22`

---

## Part 3: Connect & Setup (10 minutes)

### Connect

```powershell
# Windows
ssh -i "path\to\key.key" ubuntu@YOUR_PUBLIC_IP
```

### Setup Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs git

# Install PM2
sudo npm install -g pm2

# Configure firewall
sudo ufw allow 22/tcp
sudo ufw enable

# Create bot user
sudo useradd -m -s /bin/bash hydroxbot
sudo su - hydroxbot
```

---

## Part 4: Deploy Bot (10 minutes)

### Clone and Configure

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/hydroxbot.git bot
cd bot

# Create .env file
nano .env
```

Paste your config:
```env
DISCORD_TOKEN=your_token_here
CLIENT_ID=your_client_id
GUILD_ID=your_guild_id
LOG_CHANNEL_ID=your_log_channel_id
OWNER_ID=your_owner_id
```

Save: `Ctrl+X`, `Y`, `Enter`

### Install and Start

```bash
# Secure .env
chmod 600 .env

# Install dependencies
npm install

# Deploy commands
npm run deploy

# Start with PM2
pm2 start index.js --name hydroxbot
pm2 save
pm2 startup
# Copy and run the command PM2 shows (exit to ubuntu user first)
```

### Configure Auto-Start

```bash
# Exit to ubuntu user
exit

# Run the PM2 startup command it showed you
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u hydroxbot --hp /home/hydroxbot
```

---

## ✅ Verify

```bash
# Switch back to bot user
sudo su - hydroxbot
cd bot

# Check status
pm2 status

# View logs
pm2 logs hydroxbot
```

**In Discord:**
- Bot should be online
- Try `/ping`
- Try `/stats`
- Join voice channel

---

## 🔄 Update Bot Later

### On Your Computer

```powershell
# Make changes, then:
git add .
git commit -m "Update description"
git push origin main
```

### On Server

```bash
sudo su - hydroxbot
cd bot
pm2 stop hydroxbot
git pull origin main
npm install
pm2 restart hydroxbot
pm2 logs hydroxbot
```

---

## 📊 Useful Commands

```bash
# Connect to server
ssh -i key.key ubuntu@YOUR_IP

# Switch to bot user
sudo su - hydroxbot
cd bot

# Bot management
pm2 status              # Check status
pm2 logs hydroxbot      # View logs
pm2 restart hydroxbot   # Restart bot
pm2 monit              # Monitor resources

# Update bot
git pull && npm install && pm2 restart hydroxbot
```

---

## 🆘 Troubleshooting

### Bot won't start
```bash
pm2 logs hydroxbot --lines 100
node index.js  # Run manually to see errors
```

### Can't connect SSH
- Check instance is running
- Verify IP address
- Check key file path
- Try: `ssh -v -i key.key ubuntu@IP`

### Git pull fails
```bash
git stash
git pull origin main
git stash pop
```

---

## 🎉 Done!

Your bot is now:
- ✅ Running 24/7 on Oracle Cloud
- ✅ Auto-restarts on crash
- ✅ Auto-starts on reboot
- ✅ Easy to update via GitHub

**For detailed instructions, see:** `ORACLE_CLOUD_GITHUB_DEPLOYMENT.md`

---

## 📞 Quick Reference

**Connect:** `ssh -i key.key ubuntu@YOUR_IP`
**Bot user:** `sudo su - hydroxbot`
**Bot directory:** `cd bot`
**Check status:** `pm2 status`
**View logs:** `pm2 logs hydroxbot`
**Update:** `git pull && npm install && pm2 restart hydroxbot`

**Need help?** Check the full deployment guide or PM2 logs!
