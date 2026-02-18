# Railway Deployment Fix

## The Problem

Railway was using Node 18 Alpine (minimal image) which:
- Doesn't have Python (needed for native modules)
- Doesn't have build tools (needed for canvas and sqlite3)
- Node 18 is too old for better-sqlite3 v12

## The Solution

Created proper configuration files for Railway deployment.

## Files Added/Updated

1. **Dockerfile** - Custom Docker image with:
   - Node 20 (required by better-sqlite3)
   - Python 3 and build tools
   - Canvas system dependencies
   - Proper user permissions

2. **.dockerignore** - Excludes unnecessary files from Docker build

3. **railway.json** - Railway configuration:
   - Uses custom Dockerfile
   - Sets restart policy
   - Defines start command

4. **package.json** - Updated:
   - Changed `@napi-rs/canvas` to `canvas` (better compatibility)
   - Node version requirement: >=20.0.0

## Steps to Deploy

### 1. Update Local Dependencies

```bash
# Remove old dependencies
rm -rf node_modules package-lock.json

# Install new dependencies
npm install

# Test locally
npm start
```

### 2. Commit and Push to GitHub

```bash
git add .
git commit -m "Fix Railway deployment with custom Dockerfile"
git push origin main
```

### 3. Railway Will Auto-Deploy

Railway will detect the changes and:
- Use your custom Dockerfile
- Install all dependencies correctly
- Start the bot

### 4. Monitor Deployment

Watch the logs in Railway dashboard. You should see:
```
✅ Installing system dependencies...
✅ Installing npm packages...
✅ Building native modules...
✅ Starting bot...
🤖 Logged in as YourBot#1234
✅ Successfully registered X application commands
```

## If Still Having Issues

### Option 1: Redeploy from Scratch

In Railway dashboard:
1. Delete the current deployment
2. Click "New Project"
3. Select your GitHub repo again
4. Railway will use the new Dockerfile

### Option 2: Check Environment Variables

Make sure all required variables are set in Railway:
- DISCORD_TOKEN
- CLIENT_ID
- GUILD_ID
- LOG_CHANNEL_ID
- (and all others from .env.example)

### Option 3: Add Volume for Database

1. Go to Railway project settings
2. Click "Volumes"
3. Add volume with mount path: `/app/data`
4. This persists your SQLite database

## Verify It's Working

After deployment, check:

1. **Logs show bot is online**:
   ```
   🤖 Logged in as YourBot#1234
   ```

2. **Bot appears online in Discord**

3. **Commands work**:
   ```
   /ping
   /stats
   ```

4. **Welcome messages work** when someone joins

## Alternative: Use Railway Template

If custom Dockerfile doesn't work, you can also:

1. Remove the Dockerfile
2. Let Railway auto-detect Node.js
3. Add build command in Railway settings:
   ```
   npm install --build-from-source
   ```

But the Dockerfile approach is more reliable.

## Cost on Railway

With this setup:
- Build time: ~2-3 minutes (first time)
- Runtime: ~$1-2/month
- Free tier: $5/month credit
- You're covered! ✅

## Troubleshooting Commands

```bash
# View Railway logs
railway logs

# Force redeploy
railway up --detach

# Check service status
railway status

# Run commands in Railway environment
railway run npm run deploy
```

## Success Indicators

✅ Build completes without errors
✅ Bot shows as "Running" in Railway
✅ Logs show "Logged in as..."
✅ Bot is online in Discord
✅ Commands respond
✅ Welcome cards generate properly

Your bot should now deploy successfully on Railway! 🚀
