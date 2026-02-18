# 🎭 Quick Setup: Separate Role Logging

## What Changed?
Role changes (additions, removals, bot-granted) can now be logged to a **separate channel** from voice/member events.

## Quick Setup (3 Steps)

### 1️⃣ Create Role Log Channel
In Discord, create a new text channel:
- Name: `#role-logs` (or any name you prefer)
- Make it private (staff/admin only)

### 2️⃣ Get Channel ID
- Enable Developer Mode (Discord Settings > Advanced > Developer Mode)
- Right-click your new channel
- Click "Copy ID"

### 3️⃣ Add to .env File
Open your `.env` file and add this line:
```env
ROLE_LOG_CHANNEL_ID=paste_your_channel_id_here
```

Example:
```env
LOG_CHANNEL_ID=1472934610588537045
ROLE_LOG_CHANNEL_ID=1472934610588537099
```

### 4️⃣ Restart Bot
Restart your bot and you're done!

## What Gets Logged?

### In Role Log Channel:
✅ Role additions (manual or automatic)
✅ Role removals (manual or automatic)  
✅ Bot-granted roles from voice activity
✅ Who made the change (with mention)
✅ Complete audit trail

### In Main Log Channel:
✅ Voice joins/leaves
✅ Member joins/leaves
✅ Voice activities (mute, deafen, move, stream, camera)

## Premium Features

Each role log includes:
- 🎭 Role name
- 👤 Target user (with mention)
- 👮 Who made the change (with mention)
- 🕐 Timestamp
- 📋 Full details
- 🔧 Action type (manual vs automatic)

## Optional
If you don't set `ROLE_LOG_CHANNEL_ID`, all logs (including roles) will go to the main `LOG_CHANNEL_ID`.

## Need Help?
See `ROLE_LOGGING_SYSTEM.md` for complete documentation.
