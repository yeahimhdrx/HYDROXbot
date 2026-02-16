# 🚀 Free 24/7 Bot Hosting Guide

## Best Free Hosting Options

### 1. 🥇 Railway.app (RECOMMENDED)
**Free Tier:** 500 hours/month + $5 credit
**Best for:** Discord bots, easy setup, reliable

#### Setup Steps:

1. **Create Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Prepare Your Project**
   ```bash
   # Make sure .env is in .gitignore
   echo ".env" >> .gitignore
   echo "node_modules/" >> .gitignore
   echo "data/" >> .gitignore
   
   # Commit your code
   git add .
   git commit -m "Prepare for Railway deployment"
   git push
   ```

3. **Deploy on Railway**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your HYDROXbot repository
   - Railway will auto-detect Node.js

4. **Add Environment Variables**
   - Go to your project → Variables
   - Add each variable from your .env file:
     - `DISCORD_TOKEN`
     - `CLIENT_ID`
     - `GUILD_ID`
     - `LOG_CHANNEL_ID`
     - `OWNER_ID`

5. **Deploy**
   - Railway will automatically deploy
   - Bot will be online 24/7!

**Pros:**
- ✅ Very easy setup
- ✅ Auto-deploys on git push
- ✅ Free $5 credit monthly
- ✅ Reliable uptime
- ✅ Good for beginners

**Cons:**
- ⚠️ Limited free hours (500/month)
- ⚠️ Requires credit card after trial

---

### 2. 🥈 Render.com
**Free Tier:** Unlimited (with sleep after 15min inactivity)
**Best for:** Simple bots, no credit card needed

#### Setup Steps:

1. **Create Account**
   - Go to https://render.com
   - Sign up with GitHub

2. **Create Web Service**
   - Dashboard → New → Web Service
   - Connect your GitHub repository
   - Select HYDROXbot

3. **Configure**
   - Name: `hydrox-bot`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: `Free`

4. **Add Environment Variables**
   - Go to Environment tab
   - Add all variables from .env

5. **Deploy**
   - Click "Create Web Service"
   - Bot will deploy automatically

**Keep-Alive Solution:**
Since Render sleeps after 15min, add this to keep it awake:
- Use UptimeRobot (free) to ping your bot every 5 minutes
- Or upgrade to paid plan ($7/month)

**Pros:**
- ✅ No credit card required
- ✅ Easy GitHub integration
- ✅ Free SSL
- ✅ Auto-deploys

**Cons:**
- ⚠️ Sleeps after 15min inactivity (free tier)
- ⚠️ Slower cold starts

---

### 3. 🥉 Replit
**Free Tier:** Always-on with Replit Core (paid) or use keep-alive
**Best for:** Quick testing, easy debugging

#### Setup Steps:

1. **Create Account**
   - Go to https://replit.com
   - Sign up

2. **Import from GitHub**
   - Click "Create Repl"
   - Select "Import from GitHub"
   - Paste your repository URL

3. **Configure Secrets**
   - Click "Secrets" (lock icon)
   - Add all environment variables

4. **Run**
   - Click "Run" button
   - Bot will start

**Keep-Alive Solution:**
Add UptimeRobot to ping your Repl URL every 5 minutes

**Pros:**
- ✅ Easy to use
- ✅ Built-in code editor
- ✅ Good for testing
- ✅ No credit card

**Cons:**
- ⚠️ Sleeps without keep-alive
- ⚠️ Limited resources
- ⚠️ Can be slow

---

### 4. 💎 Heroku (Paid Now)
**Note:** Heroku removed free tier in November 2022
**Cost:** $5-7/month minimum

---

### 5. 🆓 Oracle Cloud (Advanced)
**Free Tier:** Always free, generous limits
**Best for:** Advanced users, maximum control

#### Setup Steps:

1. **Create Account**
   - Go to https://cloud.oracle.com
   - Sign up (requires credit card for verification)

2. **Create VM Instance**
   - Compute → Instances → Create Instance
   - Choose "Always Free" eligible shape
   - Select Ubuntu 22.04

3. **Connect via SSH**
   ```bash
   ssh ubuntu@your-instance-ip
   ```

4. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo npm install -g pm2
   ```

5. **Upload Your Bot**
   ```bash
   git clone https://github.com/yourusername/HYDROXbot.git
   cd HYDROXbot
   npm install
   ```

6. **Create .env File**
   ```bash
   nano .env
   # Paste your environment variables
   # Ctrl+X, Y, Enter to save
   ```

7. **Start with PM2**
   ```bash
   pm2 start index.js --name hydrox-bot
   pm2 save
   pm2 startup
   ```

**Pros:**
- ✅ Truly free forever
- ✅ Generous resources
- ✅ Full control
- ✅ No sleep/downtime

**Cons:**
- ⚠️ Requires technical knowledge
- ⚠️ Manual setup
- ⚠️ Need to manage server

---

## 🎯 Recommended Setup (Railway)

### Step-by-Step Railway Deployment

1. **Prepare .gitignore**
   ```
   node_modules/
   .env
   data/
   *.log
   .DS_Store
   ```

2. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

3. **Deploy on Railway**
   - Visit https://railway.app
   - New Project → Deploy from GitHub
   - Select HYDROXbot
   - Add environment variables
   - Deploy!

4. **Monitor**
   - Check logs in Railway dashboard
   - Bot should be online 24/7

---

## 📊 Comparison Table

| Platform | Free Tier | Always On | Easy Setup | Credit Card |
|----------|-----------|-----------|------------|-------------|
| Railway | 500h/month | ✅ | ⭐⭐⭐⭐⭐ | After trial |
| Render | Unlimited* | ⚠️ Sleeps | ⭐⭐⭐⭐ | No |
| Replit | Limited | ⚠️ Sleeps | ⭐⭐⭐⭐⭐ | No |
| Oracle | Unlimited | ✅ | ⭐⭐ | Yes (verify) |

*Sleeps after 15min inactivity

---

## 🔧 Required Files for Deployment

### package.json (already have)
```json
{
  "name": "hydroxbot",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### .gitignore (create if missing)
```
node_modules/
.env
data/
*.log
.DS_Store
```

---

## 🚨 Important Notes

### Security
- ⚠️ **NEVER commit .env file**
- ⚠️ **Use environment variables on hosting platform**
- ⚠️ **Keep bot token secret**

### Database
- Your SQLite database (`data/bot.db`) will reset on some platforms
- Consider using a persistent database for production:
  - PostgreSQL (free on Railway/Render)
  - MongoDB Atlas (free tier)

### Monitoring
- Check logs regularly
- Set up error notifications
- Monitor uptime

---

## 🎓 My Recommendation

**For You (Beginner-Friendly):**

1. **Start with Railway** (easiest, most reliable)
   - 500 hours = ~20 days/month
   - Perfect for testing
   - Easy to upgrade later

2. **If Railway runs out:**
   - Use Render with UptimeRobot
   - Or upgrade Railway ($5/month)

3. **For long-term:**
   - Learn Oracle Cloud (free forever)
   - Or pay for Railway/Render ($5-7/month)

---

## 📝 Quick Start (Railway)

```bash
# 1. Ensure .gitignore exists
echo "node_modules/
.env
data/" > .gitignore

# 2. Commit and push
git add .
git commit -m "Deploy to Railway"
git push

# 3. Go to railway.app
# 4. Deploy from GitHub
# 5. Add environment variables
# 6. Done! Bot is online 24/7
```

---

## 🆘 Troubleshooting

### Bot Not Starting
- Check environment variables are set
- Verify DISCORD_TOKEN is correct
- Check logs for errors

### Bot Keeps Crashing
- Check memory usage
- Review error logs
- Ensure all dependencies installed

### Database Issues
- SQLite may not persist on some platforms
- Consider PostgreSQL for production
- Backup data regularly

---

## 📚 Additional Resources

- Railway Docs: https://docs.railway.app
- Render Docs: https://render.com/docs
- Discord.js Guide: https://discordjs.guide
- PM2 Docs: https://pm2.keymetrics.io

---

## 💡 Pro Tips

1. **Use PM2 for local development**
   ```bash
   npm install -g pm2
   pm2 start index.js --name hydrox-bot
   pm2 logs
   ```

2. **Set up auto-restart**
   - Most platforms do this automatically
   - For VPS: use PM2 or systemd

3. **Monitor uptime**
   - Use UptimeRobot (free)
   - Set up Discord webhooks for alerts

4. **Regular backups**
   - Backup your database
   - Keep code in GitHub
   - Export important data

---

## 🎉 You're Ready!

Choose a platform and deploy your bot. Railway is the easiest to start with!

Need help? Check the platform's documentation or Discord.js community.
