# Complete Supabase Setup - All Features Working

This guide ensures ALL bot features work with Supabase and shows you how to backup/restore data.

## ✅ Features That Work with Supabase

All these features now save to Supabase automatically:

1. **Voice Activity Tracking**
   - Join/leave voice channels
   - Time tracking (seconds precision)
   - Session history
   - `/stats` command
   - `/topusers` leaderboard

2. **Voice Roles System**
   - Automatic role granting based on hours
   - 7 role tiers (FRIENDS → MYTHIC)
   - HDRX tag tracking
   - `/checkroles` command
   - `/voicetime add/set` commands

3. **Invite Tracking System**
   - Automatic invite counting
   - Valid/left/fake invite tracking
   - `/invites` command
   - `/inviteleaderboard` command
   - `/addinvites` command (admin)
   - 6 invite role tiers (SCOUT → SOVEREIGN)

4. **Message Logging**
   - Deleted message cache
   - Message content backup
   - Attachment tracking

5. **Welcome System**
   - Welcome cards
   - Member join tracking
   - Invite attribution

## Current Setup Status

✅ All database files updated to use Supabase
✅ Migration completed (19 voice records, 14 sessions)
✅ PostgreSQL adapter configured
✅ Auto-detection (uses Supabase when DATABASE_URL is set)

## How to Backup Your Current Data

### Option 1: Backup from Supabase (Recommended)

Run this command to backup everything:

```bash
node backup-supabase.js
```

This creates:
- `backups/supabase-backup-2026-02-18.json` (dated backup)
- `backups/supabase-latest.json` (always latest)

The backup includes:
- All voice activity data
- All invite data
- All role grants
- All sessions
- Everything!

### Option 2: Backup from Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Click your project
3. Go to **Settings** → **Database**
4. Scroll to **Backups**
5. Click **"Download"** on any backup
6. Supabase keeps 7 days of automatic backups (free tier)

### Option 3: Export as SQL

```bash
# Install PostgreSQL tools first
# Then run:
pg_dump "postgresql://postgres:password@host:5432/postgres" > backup.sql
```

## How to Restore Data

### Restore from JSON Backup

```bash
node restore-supabase.js backups/supabase-latest.json
```

Or just:
```bash
node restore-supabase.js
```
(Uses latest backup automatically)

### Restore from SQL Backup

```bash
psql "postgresql://postgres:password@host:5432/postgres" < backup.sql
```

## Verify Everything Works

### 1. Start Bot and Check Database

```bash
npm start
```

You should see:
```
[Database] Using PostgreSQL (cloud database)
[Database] PostgreSQL schema initialized
```

### 2. Test Voice Tracking

1. Join a voice channel
2. Wait 10 seconds
3. Leave voice channel
4. Run `/stats`
5. Check Supabase dashboard → voice_activity table
6. Your data should be there!

### 3. Test Invite Tracking

1. Create an invite link
2. Have someone join with it
3. Run `/invites`
4. Check Supabase dashboard → invites table
5. Invite count should increase!

### 4. Test Commands

```
/stats - Shows your voice time
/topusers - Shows leaderboard
/invites - Shows your invites
/inviteleaderboard - Shows top inviters
```

All should work and show real-time data from Supabase!

## Automatic Backups Schedule

### Daily Backup (Recommended)

Create a scheduled task to backup daily:

**Windows (Task Scheduler):**
1. Open Task Scheduler
2. Create Basic Task
3. Trigger: Daily at 3 AM
4. Action: Start a program
5. Program: `node`
6. Arguments: `C:\path\to\HYDROXbot\backup-supabase.js`

**Linux/Mac (Cron):**
```bash
# Edit crontab
crontab -e

# Add this line (runs daily at 3 AM)
0 3 * * * cd /path/to/HYDROXbot && node backup-supabase.js
```

### Before Every Deploy

Always backup before deploying:

```bash
# 1. Backup
node backup-supabase.js

# 2. Commit and push
git add .
git commit -m "Update bot"
git push

# 3. If something breaks, restore:
node restore-supabase.js
```

## Deploy to Railway with Supabase

### 1. Add DATABASE_URL to Railway

1. Go to Railway dashboard
2. Click your bot service
3. Go to **"Variables"** tab
4. Add variable:
   - Name: `DATABASE_URL`
   - Value: Your Supabase connection string
5. Click **"Add"**

### 2. Deploy

```bash
git add .
git commit -m "Use Supabase for all data"
git push origin main
```

Railway will auto-deploy and use Supabase!

### 3. Verify on Railway

Check Railway logs:
```
[Database] Using PostgreSQL (cloud database)
```

## Run Bot from Multiple Locations

Now you can run the bot anywhere:

### Your PC:
```bash
npm start
```

### Railway:
- Just push to GitHub
- Auto-deploys with Supabase

### Oracle Cloud:
1. SSH to server
2. Update .env with DATABASE_URL
3. `npm start`

### Another PC:
1. Clone repo
2. Copy .env with DATABASE_URL
3. `npm install`
4. `npm start`

**All locations use the same Supabase database!** 🎉

## Data Safety Checklist

✅ DATABASE_URL in .env (local)
✅ DATABASE_URL in Railway variables (production)
✅ Backup script created (backup-supabase.js)
✅ Restore script created (restore-supabase.js)
✅ Automatic daily backups (Supabase)
✅ Manual backup before deploys
✅ Backup files in backups/ folder
✅ .gitignore excludes backups/ (safe)

## Troubleshooting

### Bot still uses SQLite

Check startup logs. If you see:
```
[Database] Using SQLite (local file)
```

Fix:
1. Make sure DATABASE_URL is in .env
2. Restart bot
3. Should see: `[Database] Using PostgreSQL (cloud database)`

### Data not saving to Supabase

1. Check bot logs for errors
2. Verify DATABASE_URL is correct
3. Test connection: `node test-connection.js`
4. Check Supabase project is active (not paused)

### Backup fails

1. Check DATABASE_URL is set
2. Check internet connection
3. Verify Supabase project is accessible
4. Check you have read permissions

### Restore fails

1. Make sure backup file exists
2. Check DATABASE_URL is correct
3. Verify you have write permissions to Supabase
4. Check backup file format is valid JSON

## Summary

✅ All features work with Supabase
✅ Data saves automatically to cloud
✅ Accessible from anywhere
✅ Easy backup/restore system
✅ No more data loss!

Your bot is now fully cloud-enabled with Supabase! 🚀

## Quick Commands Reference

```bash
# Backup current data
node backup-supabase.js

# Restore from backup
node restore-supabase.js

# Test connection
node test-connection.js

# Start bot
npm start

# Deploy to Railway
git push origin main
```

Keep your backups safe and backup before major changes!
