# Hosting Guide for HYDROX Bot

Discord bots need to run 24/7 with a persistent connection. Here are your options:

## ❌ Won't Work
- **Vercel** - Serverless, no persistent connections
- **Netlify** - Same issue as Vercel
- **GitHub Pages** - Static hosting only

## ✅ Best Free Options

### 1. Railway.app (Recommended - Easiest)
**Free Tier:** $5 credit/month (enough for small bots)

**Setup:**
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your bot repository
5. Add environment variables:
   - `DISCORD_TOKEN`
   - `CLIENT_ID`
   - `GUILD_ID`
   - `LOG_CHANNEL_ID`
6. Railway auto-detects Node.js and runs `npm start`

**Pros:**
- Super easy setup
- Auto-deploys on git push
- Free $5/month credit
- Great dashboard

**Cons:**
- Free tier limited to $5/month usage

---

### 2. Render.com
**Free Tier:** Yes, with limitations

**Setup:**
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New" → "Web Service"
4. Connect your GitHub repo
5. Settings:
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
6. Add environment variables in dashboard
7. Deploy

**Pros:**
- Completely free tier
- Easy to use
- Auto-deploys

**Cons:**
- Free tier spins down after 15 min inactivity (bot will disconnect)
- Need paid plan ($7/mo) for 24/7 uptime

---

### 3. Fly.io
**Free Tier:** 3 small VMs free

**Setup:**
1. Install flyctl: `npm install -g flyctl`
2. Sign up: `fly auth signup`
3. In your bot folder: `fly launch`
4. Follow prompts (say yes to Dockerfile generation)
5. Set secrets:
   ```bash
   fly secrets set DISCORD_TOKEN=your_token
   fly secrets set CLIENT_ID=your_client_id
   fly secrets set GUILD_ID=your_guild_id
   fly secrets set LOG_CHANNEL_ID=your_log_channel_id
   ```
6. Deploy: `fly deploy`

**Pros:**
- True 24/7 free hosting
- Good free tier
- Fast deployment

**Cons:**
- Requires CLI tool
- Slightly more technical

---

### 4. Oracle Cloud (Always Free)
**Free Tier:** 2 VMs forever free

**Setup:**
1. Sign up at [oracle.com/cloud/free](https://www.oracle.com/cloud/free/)
2. Create a VM instance (Ubuntu)
3. SSH into your VM
4. Install Node.js:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```
5. Clone your bot:
   ```bash
   git clone your-repo-url
   cd your-bot-folder
   npm install
   ```
6. Create .env file:
   ```bash
   nano .env
   # Paste your environment variables
   # Ctrl+X, Y, Enter to save
   ```
7. Install PM2 to keep bot running:
   ```bash
   sudo npm install -g pm2
   pm2 start index.js --name hydrox-bot
   pm2 startup
   pm2 save
   ```

**Pros:**
- Completely free forever
- Full VM control
- True 24/7 hosting

**Cons:**
- More technical setup
- Need to manage server yourself

---

### 5. Google Cloud Platform (Free Trial)
**Free Tier:** $300 credit for 90 days, then always-free tier

**Setup:**
1. Go to [cloud.google.com](https://cloud.google.com)
2. Create new project
3. Enable Compute Engine
4. Create VM instance (e2-micro is free tier)
5. SSH into VM (click SSH button in console)
6. Follow same steps as Oracle Cloud above

**Pros:**
- Generous free trial
- Always-free tier available
- Reliable infrastructure

**Cons:**
- Requires credit card
- Can charge after free tier

---

### 6. Your Own Computer (Development/Testing)
**Cost:** Free (electricity)

**Setup:**
1. Keep your computer running 24/7
2. Run bot with PM2:
   ```bash
   npm install -g pm2
   pm2 start index.js --name hydrox-bot
   pm2 startup
   pm2 save
   ```

**Pros:**
- Completely free
- Full control
- No external dependencies

**Cons:**
- Computer must stay on 24/7
- Uses your internet/electricity
- Not reliable if power/internet goes out

---

## 🏆 Recommended Setup

**For Beginners:** Railway.app
- Easiest setup
- Just connect GitHub and deploy
- $5/month free credit is enough for small bots

**For Free 24/7:** Fly.io or Oracle Cloud
- Fly.io if you want easy CLI deployment
- Oracle Cloud if you want full VM control

**For Production:** Railway.app ($5-10/mo) or DigitalOcean ($4/mo)
- More reliable
- Better support
- Worth the small cost

---

## Files Needed for Deployment

Most platforms need these files (already included):

### package.json
Make sure you have:
```json
{
  "scripts": {
    "start": "node index.js",
    "deploy": "node deploy-commands.js"
  }
}
```

### .gitignore
Make sure .env is ignored:
```
node_modules/
.env
data/
*.log
```

### For Railway/Render
No extra files needed - they auto-detect Node.js

### For Fly.io
Run `fly launch` and it creates Dockerfile automatically

---

## After Deployment

1. **Deploy commands** (one-time):
   - If using Railway/Render: Add a manual deploy command or run locally
   - Run: `node deploy-commands.js`

2. **Check logs** to verify bot is online

3. **Test** with `/ping` command in Discord

4. **Monitor** your log channel for activity

---

## Database Persistence

Your bot uses SQLite (better-sqlite3). Important notes:

- **Railway/Render/Fly.io:** Database resets on redeploy
  - Solution: Use persistent volumes or external database
  - For Railway: Add a volume in settings
  
- **Oracle/GCP VM:** Database persists automatically

- **For production:** Consider PostgreSQL or MongoDB for better persistence

---

## Cost Comparison

| Platform | Free Tier | 24/7 Free | Paid Option |
|----------|-----------|-----------|-------------|
| Railway | $5 credit/mo | No | $5-20/mo |
| Render | Yes | No | $7/mo |
| Fly.io | 3 VMs | Yes | $1.94/mo+ |
| Oracle Cloud | 2 VMs | Yes | Free |
| Vercel | ❌ Won't work | - | - |

---

## Quick Start: Railway (Recommended)

1. Push your code to GitHub
2. Go to railway.app
3. "New Project" → "Deploy from GitHub"
4. Select repo
5. Add environment variables
6. Deploy!

Done in 5 minutes! 🚀
