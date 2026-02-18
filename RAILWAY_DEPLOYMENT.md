# Railway.app Deployment Guide

Deploy your HYDROX Discord bot to Railway.app in minutes.

## Why Railway?

- ✅ Free $5/month credit (enough for small bots)
- ✅ Automatic deployments from GitHub
- ✅ Built-in environment variables
- ✅ Automatic restarts
- ✅ Easy logs viewing
- ✅ No credit card required for trial

## Prerequisites

1. GitHub account
2. Railway account (sign up at https://railway.app)
3. Your bot code pushed to GitHub

## Step 1: Prepare Your Repository

Make sure these files are in your GitHub repo:

### Create `.gitignore` (if not exists)
```
node_modules/
.env
data/
*.db
*.db-shm
*.db-wal
.DS_Store
```

### Commit and push to GitHub
```bash
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

## Step 2: Deploy to Railway

### Option A: Deploy via Railway Dashboard

1. Go to https://railway.app
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Authorize Railway to access your GitHub
5. Select your bot repository
6. Railway will automatically detect it's a Node.js project

### Option B: Deploy via Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

## Step 3: Configure Environment Variables

In Railway dashboard:

1. Click on your project
2. Go to "Variables" tab
3. Add these variables:

```
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
GUILD_ID=your_guild_id_here
LOG_CHANNEL_ID=your_log_channel_id_here
OWNER_ID=your_user_id_here
WELCOME_CHANNEL_ID=your_welcome_channel_id_here
WELCOME_BG_URL=https://i.postimg.cc/your-image-url.gif
RULES_CHANNEL_ID=your_rules_channel_id_here
ROLE_LOG_CHANNEL_ID=your_role_log_channel_id_here
DELETED_MESSAGES_LOG_CHANNEL_ID=your_deleted_messages_log_channel_id_here
```

**Note**: Don't include quotes around values in Railway.

## Step 4: Deploy Commands

After first deployment, you need to deploy slash commands:

### Option 1: Run Locally Once
```bash
npm run deploy
```

### Option 2: Via Railway CLI
```bash
railway run npm run deploy
```

### Option 3: Add to package.json (Automatic)

Update your `package.json`:
```json
{
  "scripts": {
    "start": "node index.js",
    "deploy": "node deploy-commands.js",
    "railway:start": "npm run deploy && npm start"
  }
}
```

Then in Railway, set the start command to:
```
npm run railway:start
```

## Step 5: Monitor Your Bot

### View Logs
1. Go to Railway dashboard
2. Click on your project
3. Click "Deployments" tab
4. Click on latest deployment
5. View real-time logs

### Check Status
- Green = Running
- Red = Crashed (check logs)

## Persistent Storage (Database)

Railway provides ephemeral storage by default. Your SQLite database will reset on redeploy.

### Option 1: Use Railway Volume (Recommended)

1. In Railway dashboard, go to your service
2. Click "Settings"
3. Scroll to "Volumes"
4. Click "Add Volume"
5. Mount path: `/app/data`
6. Size: 1 GB (more than enough)

This keeps your database persistent across deployments.

### Option 2: Use PostgreSQL (Advanced)

If you want a proper database:

1. In Railway, click "New" → "Database" → "PostgreSQL"
2. Install `pg` package: `npm install pg`
3. Update your code to use PostgreSQL instead of SQLite

## Automatic Deployments

Railway automatically redeploys when you push to GitHub:

```bash
git add .
git commit -m "Update bot"
git push origin main
```

Railway will:
1. Detect the push
2. Build your project
3. Deploy automatically
4. Restart the bot

## Custom Domain (Optional)

1. Go to "Settings" in Railway
2. Scroll to "Domains"
3. Click "Generate Domain"

Note: Discord bots don't need domains, but useful if you add a web dashboard later.

## Troubleshooting

### Bot Not Starting

Check logs for errors:
```bash
railway logs
```

Common issues:
- Missing environment variables
- Invalid Discord token
- Commands not deployed

### Canvas/SQLite Build Errors

Railway uses Ubuntu, so native modules should work. If issues occur:

Add to `package.json`:
```json
{
  "engines": {
    "node": "20.x",
    "npm": "10.x"
  }
}
```

### Out of Memory

Free tier has 512 MB RAM limit. Your bot uses ~200-300 MB, so should be fine.

If issues, optimize:
```javascript
// In index.js, add:
client.on('ready', () => {
    // Clear caches periodically
    setInterval(() => {
        client.guilds.cache.sweep(() => false);
    }, 3600000); // Every hour
});
```

### Database Resets on Deploy

Make sure you added a Volume (see Persistent Storage section above).

## Cost Estimation

Railway pricing (as of 2024):
- **Free tier**: $5 credit/month
- **Usage**: ~$0.50-2/month for small bot
- **Estimate**: Free tier should cover it

Your bot uses:
- ~200 MB RAM
- Minimal CPU
- ~100 MB disk

## Comparison: Railway vs Oracle Cloud

| Feature | Railway | Oracle Cloud |
|---------|---------|--------------|
| Setup Time | 5 minutes | 30-60 minutes |
| Free Tier | $5/month credit | Always free |
| Ease of Use | Very easy | Moderate |
| Auto Deploy | ✅ Yes | Manual/GitHub Actions |
| Logs | Built-in dashboard | SSH/journalctl |
| Persistent Storage | Volume (paid) | Included |
| Best For | Quick start, testing | Long-term, production |

## Railway CLI Commands

```bash
# View logs
railway logs

# Run commands
railway run npm run deploy

# Open dashboard
railway open

# Link to project
railway link

# Check status
railway status

# Environment variables
railway variables
```

## GitHub Actions (Optional)

For more control, use GitHub Actions:

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Railway

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install Railway CLI
        run: npm install -g @railway/cli
      
      - name: Deploy to Railway
        run: railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

Get Railway token:
```bash
railway login
railway whoami --token
```

Add token to GitHub Secrets as `RAILWAY_TOKEN`.

## Next Steps

1. ✅ Deploy to Railway
2. ✅ Add environment variables
3. ✅ Deploy slash commands
4. ✅ Add volume for database persistence
5. ✅ Monitor logs
6. ✅ Test bot in Discord

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Your bot logs: `railway logs`

## Pro Tips

1. **Use Railway for development/testing**, Oracle Cloud for production
2. **Enable volume** to keep database across deploys
3. **Monitor usage** in Railway dashboard to stay within free tier
4. **Use environment groups** if deploying to multiple servers
5. **Set up health checks** in Railway settings

Your bot should now be running on Railway! 🚀
