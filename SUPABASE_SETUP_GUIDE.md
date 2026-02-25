# Complete Supabase PostgreSQL Setup Guide

Step-by-step guide to set up Supabase as your bot's database.

## Why Supabase?

✅ **Free forever** - 500 MB database storage
✅ **Automatic backups** - Daily backups included
✅ **Access from anywhere** - Cloud-based
✅ **Fast setup** - 5 minutes
✅ **No credit card required**

---

## Step 1: Create Supabase Account

1. Go to https://supabase.com
2. Click **"Start your project"**
3. Sign up with:
   - GitHub account (recommended)
   - Or email/password
4. Verify your email if needed

---

## Step 2: Create New Project

1. After login, click **"New Project"**
2. Fill in the details:

   **Organization**: 
   - If first time: Create new organization (any name)
   - If existing: Select your organization

   **Project Name**: 
   - Enter: `hydroxbot` (or any name you like)

   **Database Password**: 
   - Click "Generate a password" (recommended)
   - **⚠️ COPY AND SAVE THIS PASSWORD IMMEDIATELY!**
   - You'll need it for the connection string
   - Store it somewhere safe (password manager, notepad)

   **Region**: 
   - Choose closest to you:
     - `East US (North Virginia)` - For US East Coast
     - `West US (Oregon)` - For US West Coast
     - `Central EU (Frankfurt)` - For Europe
     - `Southeast Asia (Singapore)` - For Asia
     - etc.

   **Pricing Plan**: 
   - Select **"Free"** (default)

3. Click **"Create new project"**
4. Wait 2-3 minutes for setup (you'll see a loading screen)

---

## Step 3: Get Your Connection String

Once your project is ready:

1. In the left sidebar, click **"Project Settings"** (gear icon at bottom)
2. Click **"Database"** in the settings menu
3. Scroll down to **"Connection string"** section
4. Select **"URI"** tab (not "Session mode" or "Transaction mode")
5. You'll see something like:

```
postgresql://postgres.zouteqawftafavpopgmz:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

6. **Copy this entire string**
7. **Replace `[YOUR-PASSWORD]`** with the password you saved in Step 2

**Example:**
If your password was `MySecurePass123`, the final string would be:
```
postgresql://postgres.zouteqawftafavpopgmz:MySecurePass123@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

---

## Step 4: Update Your .env File

1. Open your `.env` file
2. Find the line with `DATABASE_URL=`
3. Replace it with your Supabase connection string:

```env
DATABASE_URL=postgresql://postgres.xxx:YOUR_PASSWORD@aws-0-region.pooler.supabase.com:5432/postgres
```

**Full example .env:**
```env
# ===== DATABASE (OPTIONAL) =====
DATABASE_URL=postgresql://postgres.zouteqawftafavpopgmz:MySecurePass123@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

⚠️ **Important**: 
- No spaces before or after the `=`
- No quotes around the URL
- Make sure password has no special characters that need escaping

---

## Step 5: Install PostgreSQL Package

If you haven't already:

```bash
npm install
```

This installs the `pg` package needed for PostgreSQL.

---

## Step 6: Migrate Your Data

Run the migration script to copy your SQLite data to Supabase:

```bash
node migrate-to-postgres.js
```

You should see:
```
🔄 Starting migration from SQLite to PostgreSQL...

📥 Reading data from SQLite...
   - Voice Activity: X records
   - Role Grants: X records
   - Tag Reminders: X records
   - Voice Sessions: X records

📤 Migrating voice_activity...
   ✅ Migrated X voice activity records
📤 Migrating role_grants...
   ✅ Migrated X role grants
📤 Migrating tag_reminders...
   ✅ Migrated X tag reminders
📤 Migrating voice_sessions...
   ✅ Migrated X voice sessions

🎉 Migration completed successfully!
```

---

## Step 7: Test Your Bot

Start your bot:

```bash
npm start
```

You should see:
```
[Database] Using PostgreSQL (cloud database)
[Database] PostgreSQL schema initialized
🤖 Logged in as YourBot#1234
```

Test with a command:
```
/stats
```

If it works, your Supabase database is connected! 🎉

---

## Step 8: Verify Data in Supabase

1. Go back to Supabase dashboard
2. Click **"Table Editor"** in the left sidebar
3. You should see your tables:
   - `voice_activity`
   - `role_grants`
   - `tag_reminders`
   - `voice_sessions`
   - `message_cache`
4. Click on any table to see your data

---

## Using Supabase from Multiple Locations

Now you can run your bot from anywhere:

### On Your PC:
```bash
npm start
```

### On Railway:
1. Go to Railway dashboard
2. Click your bot service
3. Go to **"Variables"** tab
4. Add variable:
   - Name: `DATABASE_URL`
   - Value: Your Supabase connection string
5. Redeploy

### On Oracle Cloud:
1. SSH into your server
2. Edit `.env` file
3. Add your Supabase DATABASE_URL
4. Restart bot

**All locations will use the same database!** ✅

---

## Supabase Dashboard Features

### View Data
- **Table Editor**: Browse and edit data
- **SQL Editor**: Run custom SQL queries

### Monitor Usage
- **Database**: See storage usage (500 MB free)
- **API**: See API requests

### Backups
- **Settings** → **Database** → **Backups**
- Daily automatic backups (7 days retention on free tier)

### Download Backup
1. Go to **Settings** → **Database**
2. Scroll to **Backups**
3. Click **"Download"** on any backup

---

## Troubleshooting

### Error: "getaddrinfo ENOTFOUND"

**Problem**: Can't connect to Supabase

**Solutions**:
1. Check your internet connection
2. Verify the connection string is correct
3. Make sure you replaced `[YOUR-PASSWORD]` with actual password
4. Check if Supabase project is active (not paused)
5. Try restarting your Supabase project:
   - Go to Project Settings → General
   - Click "Pause project" then "Resume project"

### Error: "password authentication failed"

**Problem**: Wrong password

**Solutions**:
1. Go to Supabase → Settings → Database
2. Scroll to "Reset database password"
3. Generate new password
4. Update your .env file with new password

### Error: "database does not exist"

**Problem**: Wrong database name

**Solution**:
- Make sure connection string ends with `/postgres`
- Don't change the database name in the URL

### Error: "too many connections"

**Problem**: Free tier has connection limit

**Solutions**:
1. Make sure you're closing connections properly
2. Restart your bot
3. Use connection pooling (already configured in our code)

### Migration fails with "relation already exists"

**Problem**: Tables already exist

**Solution**:
This is normal if you ran migration before. The migration will update existing data.

---

## Connection String Format Explained

```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

Breaking down your Supabase URL:
```
postgresql://                                    ← Protocol
postgres.zouteqawftafavpopgmz                   ← User
:MySecurePass123                                 ← Password
@aws-0-us-east-1.pooler.supabase.com           ← Host
:5432                                            ← Port
/postgres                                        ← Database name
```

---

## Security Best Practices

1. **Never commit .env to Git**
   - Already in `.gitignore`
   - Double-check before pushing

2. **Use environment variables in production**
   - Railway: Add in Variables tab
   - Oracle Cloud: Use .env file with restricted permissions

3. **Rotate passwords periodically**
   - Change password every 3-6 months
   - Update in all locations

4. **Enable Row Level Security (Optional)**
   - For extra security
   - Not required for Discord bot

---

## Free Tier Limits

Supabase Free Tier includes:
- ✅ 500 MB database storage
- ✅ 2 GB bandwidth per month
- ✅ 50,000 monthly active users
- ✅ 500 MB file storage
- ✅ Daily backups (7 days retention)
- ✅ Community support

**Your bot will use:**
- ~10-50 MB storage (plenty of room)
- Minimal bandwidth
- Well within free limits! 🎉

---

## Upgrading (Optional)

If you need more:
- **Pro Plan**: $25/month
  - 8 GB database
  - 50 GB bandwidth
  - 14 days backup retention
  - Email support

But free tier is more than enough for most Discord bots!

---

## Next Steps

1. ✅ Create Supabase account
2. ✅ Create project and save password
3. ✅ Get connection string
4. ✅ Update .env file
5. ✅ Run migration
6. ✅ Test bot
7. ✅ Deploy to production with same DATABASE_URL

Your data is now in the cloud and accessible from anywhere! 🚀

---

## Support

- **Supabase Docs**: https://supabase.com/docs
- **Supabase Discord**: https://discord.supabase.com
- **Status Page**: https://status.supabase.com

If you have issues, check the Troubleshooting section above or ask for help!
