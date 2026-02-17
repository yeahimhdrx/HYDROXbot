# Oracle Cloud Deployment Guide - HYDROX Bot

Complete step-by-step guide to deploy your Discord bot on Oracle Cloud Free Tier.

---

## 📋 Prerequisites

- [ ] Oracle Cloud account (free tier available)
- [ ] Bot working locally (already done ✅)
- [ ] .env file configured with your credentials
- [ ] SSH client (PuTTY for Windows or built-in terminal for Mac/Linux)

---

## 🚀 Part 1: Create Oracle Cloud Instance

### Step 1: Sign Up for Oracle Cloud

1. Go to https://www.oracle.com/cloud/free/
2. Click "Start for free"
3. Fill in your details (email, country, etc.)
4. Verify your email
5. Add payment method (required but won't be charged for free tier)
6. Complete account setup

### Step 2: Create a Compute Instance

1. **Login to Oracle Cloud Console**
   - Go to https://cloud.oracle.com/
   - Sign in with your credentials

2. **Navigate to Compute Instances**
   - Click hamburger menu (☰) top left
   - Click "Compute" → "Instances"

3. **Create Instance**
   - Click "Create Instance" button
   
4. **Configure Instance**
   
   **Name:**
   ```
   hydroxbot
   ```
   
   **Placement:**
   - Leave default (Availability Domain)
   
   **Image and Shape:**
   - Click "Change Image"
   - Select "Canonical Ubuntu" (22.04 recommended)
   - Click "Select Image"
   
   - Click "Change Shape"
   - Select "Ampere" or "AMD" (free tier eligible)
   - Choose: VM.Standard.A1.Flex (Ampere) - FREE
     - OCPUs: 1 or 2 (up to 4 free)
     - Memory: 6 GB (up to 24 GB free)
   - Click "Select Shape"

5. **Networking**
   - Leave "Create new virtual cloud network" selected
   - Leave "Assign a public IPv4 address" checked
   - ✅ Make sure public IP is enabled!

6. **Add SSH Keys**
   
   **Option A: Generate SSH Key Pair (Recommended)**
   - Click "Generate a key pair for me"
   - Click "Save Private Key" - IMPORTANT! Save this file!
   - Click "Save Public Key" (optional)
   - Save as: `hydroxbot-ssh-key.key`
   
   **Option B: Use Your Own SSH Key**
   - If you have an existing SSH key, paste the public key

7. **Boot Volume**
   - Leave default (50 GB is plenty)

8. **Create Instance**
   - Click "Create" button
   - Wait 1-2 minutes for instance to provision
   - Status will change from "PROVISIONING" to "RUNNING"

9. **Note Your Instance Details**
   - Copy the **Public IP Address** (you'll need this!)
   - Example: `123.456.789.012`

---

## 🔐 Part 2: Configure Firewall Rules

### Step 1: Configure Security List

1. **From Instance Details Page**
   - Click on the "Subnet" link (under Primary VNIC)
   
2. **Edit Security List**
   - Click on the "Default Security List" link
   - Click "Add Ingress Rules"

3. **Add SSH Rule** (if not already present)
   - Source CIDR: `0.0.0.0/0`
   - IP Protocol: `TCP`
   - Destination Port Range: `22`
   - Description: `SSH Access`
   - Click "Add Ingress Rules"

### Step 2: Configure Ubuntu Firewall (Later)

We'll do this after connecting to the server.

---

## 💻 Part 3: Connect to Your Server

### For Windows Users (Using PuTTY)

1. **Download PuTTY**
   - Go to https://www.putty.org/
   - Download and install PuTTY

2. **Convert SSH Key (if needed)**
   - Open PuTTYgen (installed with PuTTY)
   - Click "Load"
   - Select your `hydroxbot-ssh-key.key` file
   - Click "Save private key"
   - Save as `hydroxbot-ssh-key.ppk`

3. **Connect with PuTTY**
   - Open PuTTY
   - Host Name: `ubuntu@YOUR_PUBLIC_IP`
   - Port: `22`
   - Connection type: `SSH`
   - In left menu: Connection → SSH → Auth → Credentials
   - Browse and select your `.ppk` file
   - Click "Open"
   - Click "Accept" for the security alert (first time only)

### For Mac/Linux Users (Using Terminal)

1. **Set Key Permissions**
   ```bash
   chmod 400 ~/Downloads/hydroxbot-ssh-key.key
   ```

2. **Connect via SSH**
   ```bash
   ssh -i ~/Downloads/hydroxbot-ssh-key.key ubuntu@YOUR_PUBLIC_IP
   ```
   
   Replace `YOUR_PUBLIC_IP` with your actual IP address.

3. **Accept Fingerprint**
   - Type `yes` when asked about authenticity

---

## 🛠️ Part 4: Set Up the Server

### Step 1: Update System

```bash
# Update package list
sudo apt update

# Upgrade installed packages
sudo apt upgrade -y
```

This may take 2-5 minutes.

### Step 2: Install Node.js 18

```bash
# Download Node.js setup script
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

You should see:
- Node: v18.x.x or higher
- npm: 9.x.x or higher

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

# Check status
sudo ufw status
```

Type `y` when asked to proceed.

### Step 5: Create Bot User (Security)

```bash
# Create dedicated user for the bot
sudo useradd -m -s /bin/bash hydroxbot

# Set password (optional but recommended)
sudo passwd hydroxbot

# Add to necessary groups
sudo usermod -aG sudo hydroxbot
```

---

## 📦 Part 5: Upload Your Bot Files

### Method 1: Using SCP (Recommended)

**From Your Local Computer (Windows PowerShell or Mac/Linux Terminal):**

```bash
# Navigate to your bot directory
cd C:\Users\Alumno 2\Documents\HydroxBot\HYDROXbot

# Create a zip file first (easier to transfer)
# Windows PowerShell:
Compress-Archive -Path * -DestinationPath hydroxbot.zip

# Upload to server
scp -i path\to\hydroxbot-ssh-key.key hydroxbot.zip ubuntu@YOUR_PUBLIC_IP:/home/ubuntu/
```

**On the Server:**

```bash
# Install unzip
sudo apt install unzip -y

# Create directory for bot
sudo mkdir -p /home/hydroxbot/bot
sudo chown hydroxbot:hydroxbot /home/hydroxbot/bot

# Unzip files
sudo unzip /home/ubuntu/hydroxbot.zip -d /home/hydroxbot/bot/

# Set ownership
sudo chown -R hydroxbot:hydroxbot /home/hydroxbot/bot/

# Clean up
rm /home/ubuntu/hydroxbot.zip
```

### Method 2: Using Git (Alternative)

**On the Server:**

```bash
# Install git
sudo apt install git -y

# Switch to bot user
sudo su - hydroxbot

# Clone your repository (if you have one)
git clone YOUR_REPO_URL bot

# Or create directory and upload files manually
mkdir -p bot
cd bot
```

Then use SFTP client like FileZilla to upload files.

### Method 3: Manual File Creation (For Small Files)

**On the Server:**

```bash
# Switch to bot user
sudo su - hydroxbot

# Create bot directory
mkdir -p bot
cd bot

# Create .env file
nano .env
```

Then paste your .env content and save (Ctrl+X, Y, Enter).

---

## 🔧 Part 6: Install Bot Dependencies

```bash
# Switch to bot user (if not already)
sudo su - hydroxbot

# Navigate to bot directory
cd /home/hydroxbot/bot

# Install dependencies
npm install

# Verify installation
ls node_modules/
```

You should see folders like `discord.js`, `better-sqlite3`, etc.

---

## 🚀 Part 7: Deploy and Start the Bot

### Step 1: Deploy Commands

```bash
# Still as hydroxbot user in /home/hydroxbot/bot
npm run deploy
```

You should see:
```
✅ Successfully reloaded 7 application (/) commands.
```

### Step 2: Test Bot Manually (Optional)

```bash
# Test run
node index.js
```

You should see:
```
✅ Bot is online as HYDROX Bot#5619
```

Press `Ctrl+C` to stop.

### Step 3: Start with PM2

```bash
# Start bot with PM2
pm2 start index.js --name hydroxbot

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup

# Copy and run the command PM2 shows you
# It will look like:
# sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u hydroxbot --hp /home/hydroxbot
```

### Step 4: Verify Bot is Running

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs hydroxbot

# Monitor in real-time
pm2 monit
```

Press `Ctrl+C` to exit monitoring.

---

## 📊 Part 8: Verify Everything Works

### On the Server

```bash
# Check bot status
pm2 status

# Should show:
# ┌─────┬──────────────┬─────────┬─────────┬─────────┐
# │ id  │ name         │ status  │ restart │ uptime  │
# ├─────┼──────────────┼─────────┼─────────┼─────────┤
# │ 0   │ hydroxbot    │ online  │ 0       │ 2m      │
# └─────┴──────────────┴─────────┴─────────┴─────────┘

# View recent logs
pm2 logs hydroxbot --lines 50
```

### In Discord

1. Check bot is online (green status)
2. Try commands:
   ```
   /ping
   /stats
   ```
3. Join a voice channel - bot should track time
4. Check your log channel for bot messages

---

## 🔄 Part 9: Managing Your Bot

### Useful PM2 Commands

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

# Delete from PM2
pm2 delete hydroxbot
```

### Update Bot Code

```bash
# Switch to bot user
sudo su - hydroxbot
cd /home/hydroxbot/bot

# Stop bot
pm2 stop hydroxbot

# Update files (upload new files via SCP or git pull)
# ... upload your updated files ...

# Install any new dependencies
npm install

# Restart bot
pm2 restart hydroxbot

# Check logs
pm2 logs hydroxbot
```

### View Database

```bash
# Install sqlite3
sudo apt install sqlite3 -y

# View database
sqlite3 /home/hydroxbot/bot/data/bot.db

# SQL commands:
.tables                          # List tables
SELECT * FROM voice_activity;    # View voice data
SELECT * FROM role_grants;       # View granted roles
.exit                           # Exit sqlite3
```

---

## 🔐 Part 10: Security Hardening

### Step 1: Secure SSH

```bash
# Edit SSH config
sudo nano /etc/ssh/sshd_config

# Find and change these lines:
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes

# Save and exit (Ctrl+X, Y, Enter)

# Restart SSH
sudo systemctl restart sshd
```

### Step 2: Set Up Automatic Updates

```bash
# Install unattended-upgrades
sudo apt install unattended-upgrades -y

# Enable automatic updates
sudo dpkg-reconfigure -plow unattended-upgrades
```

Select "Yes" when prompted.

### Step 3: Configure Fail2Ban (Optional)

```bash
# Install fail2ban
sudo apt install fail2ban -y

# Start and enable
sudo systemctl start fail2ban
sudo systemctl enable fail2ban

# Check status
sudo fail2ban-client status
```

---

## 📦 Part 11: Backup Strategy

### Manual Backup

```bash
# Backup database
cp /home/hydroxbot/bot/data/bot.db /home/hydroxbot/bot/data/bot.db.backup.$(date +%Y%m%d)

# Download backup to your computer
# From your local computer:
scp -i path\to\key.key ubuntu@YOUR_PUBLIC_IP:/home/hydroxbot/bot/data/bot.db.backup.* ./
```

### Automatic Backup Script

```bash
# Create backup script
nano /home/hydroxbot/backup.sh
```

Paste this:

```bash
#!/bin/bash
BACKUP_DIR="/home/hydroxbot/backups"
BOT_DIR="/home/hydroxbot/bot"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
cp $BOT_DIR/data/bot.db $BACKUP_DIR/bot.db.$DATE

# Keep only last 7 backups
cd $BACKUP_DIR
ls -t bot.db.* | tail -n +8 | xargs -r rm

echo "Backup completed: bot.db.$DATE"
```

Save and make executable:

```bash
chmod +x /home/hydroxbot/backup.sh

# Test backup
/home/hydroxbot/backup.sh

# Add to crontab (daily at 2 AM)
crontab -e

# Add this line:
0 2 * * * /home/hydroxbot/backup.sh
```

---

## 🆘 Troubleshooting

### Bot Won't Start

```bash
# Check logs
pm2 logs hydroxbot --lines 100

# Check if .env file exists
ls -la /home/hydroxbot/bot/.env

# Check file permissions
ls -la /home/hydroxbot/bot/

# Try running manually to see errors
cd /home/hydroxbot/bot
node index.js
```

### Can't Connect via SSH

1. Check instance is running in Oracle Cloud Console
2. Verify public IP address
3. Check security list allows port 22
4. Verify SSH key is correct
5. Try: `ssh -v -i key.key ubuntu@IP` for verbose output

### Bot Crashes Frequently

```bash
# Check system resources
free -h
df -h
top

# Check PM2 logs
pm2 logs hydroxbot --lines 200

# Increase memory if needed (edit PM2 config)
pm2 delete hydroxbot
pm2 start index.js --name hydroxbot --max-memory-restart 300M
pm2 save
```

### Database Locked Error

```bash
# Check if multiple instances are running
pm2 status
ps aux | grep node

# Kill duplicate processes
pm2 delete all
pm2 start index.js --name hydroxbot
```

### Firewall Blocking

```bash
# Check firewall status
sudo ufw status

# Check if bot can reach Discord
curl -I https://discord.com

# Check DNS
nslookup discord.com
```

---

## 📊 Monitoring

### Set Up Monitoring

```bash
# Install htop for better monitoring
sudo apt install htop -y

# View system resources
htop

# Check disk usage
df -h

# Check memory usage
free -h

# Check bot logs
pm2 logs hydroxbot
```

### PM2 Web Dashboard (Optional)

```bash
# Install PM2 web interface
pm2 install pm2-server-monit

# Access at: http://YOUR_PUBLIC_IP:9615
# (You'll need to open port 9615 in firewall)
```

---

## ✅ Deployment Checklist

- [ ] Oracle Cloud instance created
- [ ] SSH connection working
- [ ] System updated
- [ ] Node.js 18+ installed
- [ ] PM2 installed
- [ ] Bot files uploaded
- [ ] .env file configured
- [ ] Dependencies installed (npm install)
- [ ] Commands deployed (npm run deploy)
- [ ] Bot started with PM2
- [ ] PM2 startup configured
- [ ] Bot online in Discord
- [ ] Commands working
- [ ] Voice tracking working
- [ ] Logs appearing in Discord
- [ ] Firewall configured
- [ ] SSH secured
- [ ] Backup strategy in place

---

## 🎉 Success!

Your HYDROX Bot is now running 24/7 on Oracle Cloud!

### What You've Accomplished

✅ Free hosting on Oracle Cloud
✅ Bot runs 24/7 automatically
✅ Auto-restarts on crash
✅ Auto-starts on server reboot
✅ Secure configuration
✅ Easy to manage with PM2
✅ Backup strategy in place

### Next Steps

1. Monitor bot for first 24 hours
2. Set up automated backups
3. Join your Discord and test all features
4. Share with your community!

---

## 📞 Need Help?

Common issues and solutions are in the Troubleshooting section above.

For Oracle Cloud specific issues:
- Oracle Cloud Documentation: https://docs.oracle.com/
- Oracle Cloud Support: https://www.oracle.com/support/

For bot issues:
- Check PM2 logs: `pm2 logs hydroxbot`
- Check Discord Developer Portal
- Review SECURITY.md and DEPLOYMENT_CHECKLIST.md

---

**Congratulations! Your bot is now hosted on Oracle Cloud! 🚀**
