# 🌐 Oracle Cloud Free Hosting - Complete Guide

## Overview
Oracle Cloud offers **truly free forever** hosting with generous resources. Perfect for Discord bots!

**What You Get (FREE):**
- 2 AMD VMs (1/8 OCPU, 1GB RAM each)
- OR 4 ARM VMs (1 OCPU, 6GB RAM each) - BETTER!
- 200GB storage
- 10TB bandwidth/month
- Always free, no time limit

---

## 📋 Prerequisites

- Credit/debit card (for verification only, won't be charged)
- Email address
- Phone number
- Your bot files ready

---

## Part 1: Create Oracle Cloud Account

### Step 1: Sign Up

1. Go to https://www.oracle.com/cloud/free/
2. Click **"Start for free"**
3. Fill in your details:
   - Country
   - Name
   - Email
   - Password (save this!)

4. Click **"Verify my email"**
5. Check your email and click verification link

### Step 2: Complete Registration

1. Choose **"Individual"** account type
2. Fill in address details
3. Add payment method (credit/debit card)
   - ⚠️ This is for verification only
   - You won't be charged
   - Oracle will do a $1 authorization (refunded)

4. Agree to terms
5. Click **"Start my free trial"**

### Step 3: Wait for Approval

- Usually takes 5-30 minutes
- Check your email for confirmation
- You'll receive login credentials

---

## Part 2: Create a Virtual Machine

### Step 1: Login to Console

1. Go to https://cloud.oracle.com
2. Click **"Sign in to Cloud"**
3. Enter your **Cloud Account Name** (from email)
4. Click **"Next"**
5. Enter your email and password
6. Click **"Sign In"**

### Step 2: Create Compute Instance

1. From the dashboard, click **"Create a VM instance"**
   - Or go to: Menu (☰) → Compute → Instances → **"Create Instance"**

2. **Name your instance:**
   ```
   hydrox-discord-bot
   ```

3. **Choose Compartment:**
   - Leave as default (root)

4. **Placement:**
   - Leave as default

5. **Image and Shape:**
   
   **Image:**
   - Click **"Change Image"**
   - Select **"Canonical Ubuntu"**
   - Choose **"22.04"** (latest)
   - Click **"Select Image"**

   **Shape:**
   - Click **"Change Shape"**
   - Select **"Ampere"** (ARM-based)
   - Choose **"VM.Standard.A1.Flex"**
   - Set:
     - OCPU: **1**
     - Memory: **6 GB**
   - Click **"Select Shape"**
   
   ⚠️ **Important:** ARM shape is better and free!

6. **Networking:**
   - Leave **"Create new virtual cloud network"** selected
   - Leave **"Assign a public IPv4 address"** checked
   - ✅ This gives your VM a public IP

7. **Add SSH Keys:**
   
   **Option A - Generate New Keys (Recommended):**
   - Select **"Generate a key pair for me"**
   - Click **"Save Private Key"**
   - Click **"Save Public Key"**
   - ⚠️ **SAVE THESE FILES!** You need them to connect
   - Save as: `oracle-ssh-key.key` and `oracle-ssh-key.pub`

   **Option B - Use Existing Keys:**
   - If you have SSH keys, paste public key

8. **Boot Volume:**
   - Leave default (50GB is fine)

9. Click **"Create"**

### Step 3: Wait for Instance Creation

- Status will show **"PROVISIONING"** (orange)
- Wait 2-3 minutes
- Status will change to **"RUNNING"** (green)
- ✅ Your VM is ready!

### Step 4: Note Your Public IP

1. On the instance details page, find:
   - **Public IP Address:** (e.g., 123.456.789.012)
   - ⚠️ **SAVE THIS IP!** You'll need it

---

## Part 3: Configure Firewall

### Step 1: Open Port 22 (SSH)

1. On your instance page, scroll down to **"Primary VNIC"**
2. Click on the **Subnet** link
3. Click on the **Default Security List**
4. Click **"Add Ingress Rules"**

5. Add SSH rule:
   - Source CIDR: `0.0.0.0/0`
   - IP Protocol: `TCP`
   - Destination Port Range: `22`
   - Description: `SSH Access`
   - Click **"Add Ingress Rules"**

### Step 2: Configure Ubuntu Firewall

We'll do this after connecting via SSH.

---

## Part 4: Connect to Your Server

### For Windows Users:

#### Option A: Using PowerShell (Built-in)

1. Open **PowerShell**
2. Navigate to where you saved the SSH key:
   ```powershell
   cd C:\Users\YourUsername\Downloads
   ```

3. Set correct permissions on key:
   ```powershell
   icacls oracle-ssh-key.key /inheritance:r
   icacls oracle-ssh-key.key /grant:r "%username%:R"
   ```

4. Connect to your server:
   ```powershell
   ssh -i oracle-ssh-key.key ubuntu@YOUR_PUBLIC_IP
   ```
   Replace `YOUR_PUBLIC_IP` with your actual IP

5. Type `yes` when asked about fingerprint

#### Option B: Using PuTTY

1. Download PuTTY: https://www.putty.org/
2. Download PuTTYgen (comes with PuTTY)

3. Convert key:
   - Open PuTTYgen
   - Click **"Load"**
   - Select your `oracle-ssh-key.key`
   - Click **"Save private key"**
   - Save as `oracle-ssh-key.ppk`

4. Connect:
   - Open PuTTY
   - Host Name: `ubuntu@YOUR_PUBLIC_IP`
   - Port: `22`
   - Connection → SSH → Auth → Browse
   - Select your `.ppk` file
   - Click **"Open"**

---

## Part 5: Install Node.js and Setup Bot

### Step 1: Update System

```bash
# Update package list
sudo apt update

# Upgrade packages
sudo apt upgrade -y
```

### Step 2: Install Node.js 18

```bash
# Download Node.js setup script
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Install Node.js
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

You should see:
```
v18.x.x
9.x.x
```

### Step 3: Install PM2 (Process Manager)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Verify installation
pm2 --version
```

### Step 4: Install Git

```bash
# Install git
sudo apt install git -y

# Verify
git --version
```

---

## Part 6: Upload Your Bot

### Option A: Using Git (Recommended)

1. **Push your code to GitHub first** (from your local PC):
   ```bash
   # On your local PC
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Clone on server** (in SSH session):
   ```bash
   # Clone your repository
   git clone https://github.com/YOUR_USERNAME/HYDROXbot.git
   
   # Enter directory
   cd HYDROXbot
   ```

### Option B: Using SCP (Manual Upload)

**From your local PC:**

```powershell
# Windows PowerShell
scp -i oracle-ssh-key.key -r C:\Users\equipo\Documents\HYDROXbot ubuntu@YOUR_PUBLIC_IP:~/
```

**Then on server:**
```bash
cd HYDROXbot
```

---

## Part 7: Configure Bot

### Step 1: Install Dependencies

```bash
# Install all npm packages
npm install
```

### Step 2: Create .env File

```bash
# Create .env file
nano .env
```

**Paste your configuration:**
```env
DISCORD_TOKEN=MTQ3MjkxMTQzNjE5OTIzNTc1NQ.GVJThb.NNreU1rkfm26JFWPEeSOqh2_NapJc2rG3XLv3Q
CLIENT_ID=1472911436199235755
GUILD_ID=587371752884011049
LOG_CHANNEL_ID=1472934610588537045
OWNER_ID=473087068302606338
```

**Save and exit:**
- Press `Ctrl + X`
- Press `Y`
- Press `Enter`

### Step 3: Test Bot

```bash
# Test run
node index.js
```

You should see:
```
✅ Bot is online as HYDROX Bot#5619
📊 Started tracking users...
[BOT_READY]
```

**Stop the test:**
- Press `Ctrl + C`

---

## Part 8: Run Bot 24/7 with PM2

### Step 1: Start Bot with PM2

```bash
# Start bot
pm2 start index.js --name hydrox-bot

# You should see:
# [PM2] Process successfully started
```

### Step 2: Configure Auto-Restart

```bash
# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup

# Copy and run the command it shows
# It will look like:
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

### Step 3: Verify Bot is Running

```bash
# Check status
pm2 status

# View logs
pm2 logs hydrox-bot

# View last 100 lines
pm2 logs hydrox-bot --lines 100
```

---

## Part 9: Useful PM2 Commands

### Managing Your Bot

```bash
# View status
pm2 status

# View logs (live)
pm2 logs hydrox-bot

# Stop bot
pm2 stop hydrox-bot

# Restart bot
pm2 restart hydrox-bot

# Delete from PM2
pm2 delete hydrox-bot

# View detailed info
pm2 show hydrox-bot

# Monitor resources
pm2 monit
```

### Updating Your Bot

```bash
# Stop bot
pm2 stop hydrox-bot

# Pull latest changes (if using git)
git pull

# Install new dependencies
npm install

# Restart bot
pm2 restart hydrox-bot

# Or restart all
pm2 restart all
```

---

## Part 10: Configure Ubuntu Firewall

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

## Part 11: Monitoring & Maintenance

### Check Bot Status

```bash
# SSH into server
ssh -i oracle-ssh-key.key ubuntu@YOUR_PUBLIC_IP

# Check PM2 status
pm2 status

# View logs
pm2 logs hydrox-bot --lines 50
```

### Monitor Resources

```bash
# Check CPU and RAM usage
pm2 monit

# Or use htop
sudo apt install htop
htop
```

### Backup Database

```bash
# Create backup
cp data/bot.db data/bot.db.backup

# Download to local PC (from your PC)
scp -i oracle-ssh-key.key ubuntu@YOUR_PUBLIC_IP:~/HYDROXbot/data/bot.db ./bot-backup.db
```

---

## 🎉 You're Done!

Your bot is now running 24/7 on Oracle Cloud for FREE!

### ✅ Checklist

- [x] Oracle Cloud account created
- [x] VM instance running
- [x] Node.js installed
- [x] Bot uploaded
- [x] Dependencies installed
- [x] .env configured
- [x] PM2 running bot
- [x] Auto-restart enabled
- [x] Bot online in Discord

---

## 🆘 Troubleshooting

### Can't Connect via SSH

**Problem:** Connection refused or timeout

**Solutions:**
1. Check instance is **RUNNING** (green)
2. Verify you're using correct IP
3. Check SSH key permissions
4. Wait 5 minutes after instance creation
5. Try from different network

### Bot Not Starting

**Problem:** PM2 shows error or stopped

**Check logs:**
```bash
pm2 logs hydrox-bot --lines 100
```

**Common issues:**
- Missing .env file
- Wrong token in .env
- Missing dependencies (run `npm install`)
- Port already in use

### Bot Crashes

**Check logs:**
```bash
pm2 logs hydrox-bot --err --lines 50
```

**Restart bot:**
```bash
pm2 restart hydrox-bot
```

### Out of Memory

**Check usage:**
```bash
free -h
pm2 monit
```

**Solution:**
- Upgrade to 2 OCPU / 12GB RAM (still free)
- Or optimize bot code

### Can't Access After Reboot

**PM2 not starting:**
```bash
# Check PM2 status
pm2 status

# If empty, restore
pm2 resurrect

# Or restart manually
cd HYDROXbot
pm2 start index.js --name hydrox-bot
pm2 save
```

---

## 💡 Pro Tips

### 1. Setup Automatic Updates

```bash
# Create update script
nano update-bot.sh
```

Paste:
```bash
#!/bin/bash
cd ~/HYDROXbot
git pull
npm install
pm2 restart hydrox-bot
```

Make executable:
```bash
chmod +x update-bot.sh
```

Run when needed:
```bash
./update-bot.sh
```

### 2. Setup Monitoring

```bash
# Install monitoring
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 3. Secure Your Server

```bash
# Change SSH port (optional)
sudo nano /etc/ssh/sshd_config
# Change Port 22 to Port 2222
sudo systemctl restart sshd

# Disable password authentication
# In same file, set: PasswordAuthentication no
```

### 4. Setup Swap (if needed)

```bash
# Create 2GB swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## 📊 Resource Usage

Your bot should use:
- **RAM:** ~100-200MB
- **CPU:** <5% normally
- **Disk:** ~500MB with node_modules
- **Network:** Minimal

Oracle Free Tier gives you:
- **RAM:** 6GB (plenty!)
- **CPU:** 1 OCPU
- **Disk:** 50GB
- **Network:** 10TB/month

You have **plenty of resources** for this bot!

---

## 🔄 Quick Reference

### Connect to Server
```bash
ssh -i oracle-ssh-key.key ubuntu@YOUR_PUBLIC_IP
```

### Check Bot Status
```bash
pm2 status
pm2 logs hydrox-bot
```

### Restart Bot
```bash
pm2 restart hydrox-bot
```

### Update Bot
```bash
cd HYDROXbot
git pull
npm install
pm2 restart hydrox-bot
```

### View Logs
```bash
pm2 logs hydrox-bot --lines 100
```

---

## 🎓 Next Steps

1. **Setup monitoring alerts**
   - Use UptimeRobot to monitor your bot
   - Get notified if it goes down

2. **Regular backups**
   - Backup database weekly
   - Keep code in GitHub

3. **Security updates**
   - Run `sudo apt update && sudo apt upgrade` monthly
   - Keep Node.js updated

4. **Optimize performance**
   - Monitor resource usage
   - Optimize database queries if needed

---

## 📞 Need Help?

- Oracle Cloud Docs: https://docs.oracle.com/en-us/iaas/
- PM2 Docs: https://pm2.keymetrics.io/docs/
- Discord.js Guide: https://discordjs.guide/

---

## 🎉 Congratulations!

Your Discord bot is now hosted on Oracle Cloud **FREE FOREVER** with 24/7 uptime!

Enjoy your bot! 🚀
