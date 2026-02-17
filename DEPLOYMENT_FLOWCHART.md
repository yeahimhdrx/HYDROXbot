# Deployment Flowchart

Visual guide showing the complete deployment process.

---

## 🎯 Deployment Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR LOCAL COMPUTER                       │
│                                                              │
│  ┌──────────────┐                                           │
│  │  Bot Code    │                                           │
│  │  (Working)   │                                           │
│  └──────┬───────┘                                           │
│         │                                                    │
│         │ git push                                          │
│         ▼                                                    │
└─────────────────────────────────────────────────────────────┘
          │
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                         GITHUB                               │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Repository: hydroxbot                                │  │
│  │  - All code files                                     │  │
│  │  - package.json                                       │  │
│  │  - .env.example (NOT .env!)                          │  │
│  │  - Documentation                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
          │
          │ git clone
          ▼
┌─────────────────────────────────────────────────────────────┐
│                    ORACLE CLOUD SERVER                       │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Ubuntu 22.04 Instance                                │  │
│  │  - 2 CPUs, 12GB RAM (FREE!)                          │  │
│  │  - Public IP: 123.456.789.012                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  /home/hydroxbot/bot/                                 │  │
│  │  ├── index.js                                         │  │
│  │  ├── package.json                                     │  │
│  │  ├── .env (created manually)                         │  │
│  │  ├── commands/                                        │  │
│  │  ├── events/                                          │  │
│  │  ├── utils/                                           │  │
│  │  └── data/                                            │  │
│  │      └── bot.db (created automatically)              │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  PM2 Process Manager                                  │  │
│  │  - Keeps bot running 24/7                            │  │
│  │  - Auto-restart on crash                             │  │
│  │  - Auto-start on reboot                              │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
          │
          │ Discord API
          ▼
┌─────────────────────────────────────────────────────────────┐
│                         DISCORD                              │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  HYDROX Bot (Online 24/7)                            │  │
│  │  - Tracking voice activity                            │  │
│  │  - Granting roles                                     │  │
│  │  - Logging events                                     │  │
│  │  - Responding to commands                             │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Step-by-Step Process

### Step 1: Local Development
```
┌─────────────────┐
│ Write Code      │
│ Test Locally    │
│ Fix Bugs        │
└────────┬────────┘
         │
         ▼
```

### Step 2: Push to GitHub
```
┌─────────────────┐
│ git add .       │
│ git commit      │
│ git push        │
└────────┬────────┘
         │
         ▼
```

### Step 3: Create Oracle Cloud Instance
```
┌─────────────────────────┐
│ Sign up Oracle Cloud    │
│ Create Ubuntu Instance  │
│ Download SSH Key        │
│ Note Public IP          │
└────────┬────────────────┘
         │
         ▼
```

### Step 4: Connect to Server
```
┌─────────────────────────┐
│ ssh -i key ubuntu@IP    │
│ Update system           │
│ Install Node.js         │
│ Install PM2             │
└────────┬────────────────┘
         │
         ▼
```

### Step 5: Deploy Bot
```
┌─────────────────────────┐
│ git clone repository    │
│ Create .env file        │
│ npm install             │
│ npm run deploy          │
└────────┬────────────────┘
         │
         ▼
```

### Step 6: Start with PM2
```
┌─────────────────────────┐
│ pm2 start index.js      │
│ pm2 save                │
│ pm2 startup             │
└────────┬────────────────┘
         │
         ▼
```

### Step 7: Verify
```
┌─────────────────────────┐
│ pm2 status              │
│ pm2 logs                │
│ Test in Discord         │
└─────────────────────────┘
```

---

## 🔄 Update Process Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    MAKE CHANGES                              │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  LOCAL: git add . && git commit && git push                 │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  GITHUB: Code updated in repository                         │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  SERVER: pm2 stop hydroxbot                                 │
│          git pull origin main                               │
│          npm install                                        │
│          pm2 restart hydroxbot                              │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  DISCORD: Bot updated and running with new code!            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    ORACLE CLOUD SERVER                       │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │                  PM2 Process Manager                │    │
│  │                                                      │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │         HYDROX Bot Process                    │  │    │
│  │  │                                               │  │    │
│  │  │  ┌─────────────┐  ┌─────────────┐           │  │    │
│  │  │  │  Discord.js │  │  Database   │           │  │    │
│  │  │  │   Client    │  │  (SQLite)   │           │  │    │
│  │  │  └──────┬──────┘  └──────┬──────┘           │  │    │
│  │  │         │                 │                   │  │    │
│  │  │         │                 │                   │  │    │
│  │  │  ┌──────▼─────────────────▼──────┐           │  │    │
│  │  │  │      Bot Core Logic            │           │  │    │
│  │  │  │  - Voice Tracking              │           │  │    │
│  │  │  │  - Role Management             │           │  │    │
│  │  │  │  - Command Handling            │           │  │    │
│  │  │  │  - Event Logging               │           │  │    │
│  │  │  └────────────────────────────────┘           │  │    │
│  │  │                                               │  │    │
│  │  └───────────────────┬───────────────────────────┘  │    │
│  │                      │                              │    │
│  └──────────────────────┼──────────────────────────────┘    │
│                         │                                   │
└─────────────────────────┼───────────────────────────────────┘
                          │
                          │ HTTPS/WebSocket
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      DISCORD API                             │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Gateway    │  │   REST API   │  │  Voice API   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    YOUR DISCORD SERVER                       │
│                                                              │
│  👥 Users  →  🎤 Voice Channels  →  📊 Bot Tracks Time     │
│                                                              │
│  🎭 Roles  ←  🤖 Bot Grants Roles  ←  ⏱️ Time Requirements │
│                                                              │
│  📝 Logs   ←  📢 Bot Sends Logs    ←  🔔 Events Occur      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                           │
│                                                              │
│  Layer 1: Oracle Cloud Firewall                             │
│  ├─ Only port 22 (SSH) open                                │
│  └─ Public IP with security list                           │
│                                                              │
│  Layer 2: Ubuntu Firewall (UFW)                            │
│  ├─ Only SSH allowed                                        │
│  └─ All other ports blocked                                │
│                                                              │
│  Layer 3: SSH Key Authentication                            │
│  ├─ No password login                                       │
│  ├─ Private key required                                    │
│  └─ No root login                                           │
│                                                              │
│  Layer 4: Dedicated Bot User                                │
│  ├─ Bot runs as 'hydroxbot' user                           │
│  ├─ Limited permissions                                     │
│  └─ Isolated from system                                    │
│                                                              │
│  Layer 5: Environment Variables                             │
│  ├─ .env file with 600 permissions                         │
│  ├─ Not in git repository                                   │
│  └─ Only bot user can read                                 │
│                                                              │
│  Layer 6: Application Security                              │
│  ├─ Input validation                                        │
│  ├─ Rate limiting                                           │
│  ├─ Permission checks                                       │
│  └─ Error handling                                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER JOINS VOICE                          │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Discord sends voiceStateUpdate event                       │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Bot receives event → voiceStateUpdate.js                   │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  VoiceTracker.joinVoice(userId)                             │
│  - Records join timestamp in database                       │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Logger.log('VOICE_JOIN', data)                             │
│  - Sends embed to log channel                               │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  User stays in voice...                                     │
│  (Periodic updates every 60 seconds)                        │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  USER LEAVES VOICE                                          │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  VoiceTracker.leaveVoice(userId)                            │
│  - Calculates session duration                              │
│  - Updates total_minutes in database                        │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  RoleManager.checkAndGrantRoles(member)                     │
│  - Checks if user meets role requirements                   │
│  - Grants eligible roles                                    │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  If role granted:                                           │
│  - Send celebration DM to user                              │
│  - Log role grant to channel                                │
│  - Mark role as granted in database                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Quick Reference

### Files Location
```
/home/hydroxbot/bot/
├── index.js              # Main bot file
├── config.js             # Role configuration
├── package.json          # Dependencies
├── .env                  # Credentials (NOT in git!)
├── commands/             # Slash commands
├── events/               # Discord events
├── utils/                # Helper functions
└── data/                 # Database
    └── bot.db           # SQLite database
```

### Important Commands
```
pm2 status               # Check if bot is running
pm2 logs hydroxbot       # View bot logs
pm2 restart hydroxbot    # Restart bot
git pull                 # Update code from GitHub
npm install              # Install new dependencies
```

### Connection Flow
```
Your Computer → GitHub → Oracle Cloud → Discord
     ↓              ↓           ↓            ↓
  Develop        Store      Host Bot    Serve Users
```

---

## 📚 Documentation Files

1. **QUICK_DEPLOY_GUIDE.md** - Fast 30-minute setup
2. **ORACLE_CLOUD_GITHUB_DEPLOYMENT.md** - Complete detailed guide
3. **DEPLOYMENT_FLOWCHART.md** - This file (visual guide)
4. **SECURITY.md** - Security best practices
5. **BOT_PERMISSIONS.md** - Permission management

---

**Follow the flowcharts above for a visual understanding of the deployment process!**
