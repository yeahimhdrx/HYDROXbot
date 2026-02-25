# Quick Setup: Cloud Database (5 Minutes)

Follow these steps to never lose data again, no matter where you run your bot.

## Step 1: Choose a Provider (Pick One)

### Option A: Supabase (Recommended - Free Forever)

1. Go to https://supabase.com
2. Sign up (free)
3. Click "New Project"
4. Fill in:
   - Name: `hydroxbot`
   - Database Password: (create a strong password)
   - Region: Choose closest to you
5. Wait 2 minutes for setup
6. Go to **Settings** → **Database**
7. Copy **Connection string** (URI format)
8. Replace `[YOUR-PASSWORD]` with your actual password

### Option B: Railway PostgreSQL (If using Railway)

1. Go to Railway dashboard
2. Click your project
3. Click **"+ New"** → **"Database"** → **"PostgreSQL"**
4. Click the PostgreSQL service
5. Go to **"Variables"** tab
6. Copy the **DATABASE_URL** value

### Option C: Neon (Serverless)

1. Go to https://neon.tech
2. Sign up (free)
3. Create new project
4. Copy the connection string from dashboard

## Step 2: Add to Your .env File

Add this line to your `.env` file:

```env
DATABASE_URL=postgresql://user:password@host:5432/database
```

Replace with your actual connection string from Step 1.

## Step 3: Install PostgreSQL Package

```bash
npm install pg
```

## Step 4: Migrate Your Existing Data

If you have existing data in SQLite:

```bash
node migrate-to-postgres.js
```

This will copy all your data to PostgreSQL.

## Step 5: Test Locally

```bash
npm start
```

You should see:
```
[Database] Using PostgreSQL (cloud database)
[Database] PostgreSQL schema initialized
```

## Step 6: Deploy to Railway

```bash
git add .
git commit -m "Add PostgreSQL support"
git push origin main
```

In Railway dashboard:
1. Go to your bot service
2. Click **"Variables"**
3. Add `DATABASE_URL` with your connection string
4. Railway will auto-redeploy

## Step 7: Verify It Works

1. Run bot locally: `npm start`
2. Add test data: `/voicetime set @user 10`
3. Stop bot
4. Check on Railway (or another PC)
5. Data should be there! ✅

## How It Works

The bot now automatically detects which database to use:

**Local Development (no DATABASE_URL)**:
```
[Database] Using SQLite (local file)
```

**Production (with DATABASE_URL)**:
```
[Database] Using PostgreSQL (cloud database)
```

## Benefits

✅ **Run anywhere**: Same data on all machines
✅ **No data loss**: Database is in cloud
✅ **Easy backups**: Cloud provider handles it
✅ **Multiple instances**: Run bot on multiple servers
✅ **Team access**: Share database with team

## Troubleshooting

### Connection Error

If you see connection errors:

1. Check DATABASE_URL is correct
2. Check your IP is allowed (Supabase: Settings → Database → Connection pooling)
3. Try adding `?sslmode=require` to connection string

### Migration Failed

If migration fails:

1. Make sure SQLite database exists: `data/bot.db`
2. Check PostgreSQL is accessible
3. Run with more details: `node migrate-to-postgres.js`

### Bot Still Using SQLite

Make sure:
1. DATABASE_URL is in `.env` file
2. No typos in variable name
3. Restart the bot after adding DATABASE_URL

## Cost

All recommended providers have free tiers:

- **Supabase**: 500 MB free forever
- **Railway**: $5 credit/month (enough for small DB)
- **Neon**: 0.5 GB free forever

Your bot database will use ~10-50 MB, so free tier is plenty!

## Next Steps

1. ✅ Set up cloud database
2. ✅ Migrate existing data
3. ✅ Test locally
4. ✅ Deploy to Railway
5. ✅ Add DATABASE_URL to Railway variables
6. 🎉 Never lose data again!

## Support

If you need help:
1. Check `CLOUD_DATABASE_SETUP.md` for detailed info
2. Check provider documentation
3. Make sure DATABASE_URL format is correct

Your data is now safe in the cloud! 🚀
