# Fix Railway Data Loss - Add Persistent Volume

## The Problem

Your bot loses all data (voice hours, tags, invites) every time you deploy because Railway uses ephemeral storage by default.

## The Solution

Add a Railway Volume to persist your SQLite database across deployments.

## Step-by-Step Fix

### 1. Add Volume in Railway Dashboard

1. Go to https://railway.app
2. Click on your bot project
3. Click on your service (the bot)
4. Go to **"Settings"** tab
5. Scroll down to **"Volumes"** section
6. Click **"+ New Volume"**
7. Configure:
   - **Mount Path**: `/app/data`
   - **Size**: 1 GB (more than enough)
8. Click **"Add"**

### 2. Redeploy (One Last Time)

After adding the volume:
1. Go to **"Deployments"** tab
2. Click **"Deploy"** or push a new commit
3. This will be the LAST time your data resets

### 3. Verify It's Working

After deployment:
1. Use `/voicetime set @user 10` to add test data
2. Push a small change to GitHub (like updating README)
3. Wait for Railway to redeploy
4. Check if the data is still there with `/stats @user`
5. ✅ Data should persist!

## How Volumes Work

**Without Volume:**
```
Container (ephemeral)
├── /app/
│   ├── index.js
│   ├── data/
│   │   └── bot.db  ❌ DELETED on redeploy
```

**With Volume:**
```
Container (ephemeral)
├── /app/
│   ├── index.js
│   ├── data/ → Volume (persistent)
│   │   └── bot.db  ✅ PERSISTS across redeploys
```

## Alternative: Backup Before Deploy

If you can't use volumes (free tier limits), backup your database:

### Option 1: Download Database via Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Download database
railway run node -e "const fs = require('fs'); const db = require('./utils/database'); console.log('Database backed up');"

# Copy database file
railway run cat data/bot.db > backup.db
```

### Option 2: Export to JSON Before Deploy

Create a backup script:

**backup-db.js:**
```javascript
const db = require('./utils/database');
const fs = require('fs');

// Export all data
const voiceActivity = db.prepare('SELECT * FROM voice_activity').all();
const roleGrants = db.prepare('SELECT * FROM role_grants').all();
const tagReminders = db.prepare('SELECT * FROM tag_reminders').all();

const backup = {
    timestamp: new Date().toISOString(),
    voiceActivity,
    roleGrants,
    tagReminders
};

fs.writeFileSync('backup.json', JSON.stringify(backup, null, 2));
console.log('✅ Database backed up to backup.json');
```

**restore-db.js:**
```javascript
const db = require('./utils/database');
const fs = require('fs');

const backup = JSON.parse(fs.readFileSync('backup.json', 'utf8'));

console.log('Restoring database...');

// Restore voice activity
const voiceStmt = db.prepare(`
    INSERT OR REPLACE INTO voice_activity 
    (user_id, total_seconds, joined_at_ms, has_tag, last_updated_ms, session_count, last_session_seconds)
    VALUES (?, ?, ?, ?, ?, ?, ?)
`);

for (const row of backup.voiceActivity) {
    voiceStmt.run(
        row.user_id,
        row.total_seconds,
        row.joined_at_ms,
        row.has_tag,
        row.last_updated_ms,
        row.session_count,
        row.last_session_seconds
    );
}

// Restore role grants
const roleStmt = db.prepare(`
    INSERT OR IGNORE INTO role_grants (user_id, role_name, granted_at)
    VALUES (?, ?, ?)
`);

for (const row of backup.roleGrants) {
    roleStmt.run(row.user_id, row.role_name, row.granted_at);
}

console.log('✅ Database restored');
```

Run before deploy:
```bash
node backup-db.js
git add backup.json
git commit -m "Backup database"
git push
```

Then in Railway, run once after deploy:
```bash
railway run node restore-db.js
```

## Option 3: Use PostgreSQL (Advanced)

For production, consider using Railway's PostgreSQL:

1. In Railway, click **"New"** → **"Database"** → **"PostgreSQL"**
2. Install pg: `npm install pg`
3. Migrate from SQLite to PostgreSQL

But for your bot size, a Volume is simpler and sufficient.

## Recommended: Use Volume

For your use case:
- ✅ Simple setup (5 minutes)
- ✅ Automatic persistence
- ✅ No manual backups needed
- ✅ Works with free tier
- ✅ No code changes required

## Verify Volume is Working

After adding volume, check in Railway:

1. Go to **"Settings"** → **"Volumes"**
2. You should see:
   ```
   Volume: data
   Mount Path: /app/data
   Size: 1 GB
   Status: Active
   ```

3. Check logs after deploy:
   ```
   [Database] Database schema is up to date
   ```
   (Not "Fresh installation detected")

## Cost

Railway Volumes:
- **Free tier**: Included in $5/month credit
- **Cost**: ~$0.10/GB/month
- **Your usage**: 1 GB = $0.10/month
- **Total bot cost**: ~$1-2/month (well within free tier)

## Important Notes

1. **Add volume BEFORE next deploy** to prevent more data loss
2. **Volume persists** even if you delete the service (you can reattach it)
3. **Backups**: Railway doesn't auto-backup volumes, consider periodic manual backups
4. **Migration**: If you already lost data, you'll need to rebuild it (or restore from backup if you have one)

## Recovery Options (If Data Already Lost)

If you already lost data and don't have backups:

1. **Manual re-entry**: Use `/voicetime set` to restore hours for key members
2. **Announce to server**: Ask members to check their stats and report if incorrect
3. **Start fresh**: Accept the loss and ensure it doesn't happen again with volume

## Future-Proofing

After adding volume, consider:

1. **Periodic backups**: Run `node backup-db.js` weekly
2. **Git ignore backup.json**: Add to `.gitignore` if it contains sensitive data
3. **Monitor volume usage**: Check Railway dashboard monthly
4. **Test persistence**: After each deploy, verify data is still there

Your data will now persist across all future deployments! 🎉
