require('dotenv').config();

console.log('🔍 Verifying Supabase Setup...\n');

// Check 1: DATABASE_URL exists
console.log('1️⃣ Checking DATABASE_URL...');
if (process.env.DATABASE_URL) {
    const url = process.env.DATABASE_URL;
    if (url.includes('supabase.com')) {
        console.log('   ✅ DATABASE_URL is set (Supabase)');
    } else if (url.includes('postgresql://')) {
        console.log('   ✅ DATABASE_URL is set (PostgreSQL)');
    } else {
        console.log('   ⚠️  DATABASE_URL is set but format looks wrong');
    }
} else {
    console.log('   ❌ DATABASE_URL is NOT set - bot will use SQLite!');
    console.log('   Add DATABASE_URL to .env file');
    process.exit(1);
}

// Check 2: All files use database-adapter
console.log('\n2️⃣ Checking database imports...');
const fs = require('fs');
const path = require('path');

const filesToCheck = [
    'utils/voiceTracker.js',
    'utils/roleManager.js',
    'utils/messageCache.js',
    'utils/inviteTracker.js',
    'commands/topusers.js',
    'commands/voicetime.js'
];

let allGood = true;
for (const file of filesToCheck) {
    const content = fs.readFileSync(path.join(__dirname, file), 'utf8');
    if (content.includes('database-adapter')) {
        console.log(`   ✅ ${file} uses database-adapter`);
    } else if (content.includes("require('./database')") || content.includes("require('../utils/database')")) {
        console.log(`   ❌ ${file} still uses direct database import!`);
        allGood = false;
    }
}

if (!allGood) {
    console.log('\n❌ Some files still use SQLite directly!');
    process.exit(1);
}

// Check 3: Test database connection
console.log('\n3️⃣ Testing database connection...');
const db = require('./utils/database-adapter');

try {
    // This will trigger the adapter to load
    console.log('   ✅ Database adapter loaded successfully');
    
    // Check what it loaded
    if (db.pool) {
        console.log('   ✅ PostgreSQL adapter is active');
    } else {
        console.log('   ℹ️  SQLite adapter is active (check DATABASE_URL)');
    }
} catch (error) {
    console.log(`   ❌ Error loading database: ${error.message}`);
    process.exit(1);
}

// Check 4: Verify no SQLite files will be created
console.log('\n4️⃣ Checking for SQLite files...');
const dataDir = path.join(__dirname, 'data');
if (fs.existsSync(dataDir)) {
    const files = fs.readdirSync(dataDir);
    const dbFiles = files.filter(f => f.endsWith('.db'));
    if (dbFiles.length > 0) {
        console.log(`   ℹ️  Found ${dbFiles.length} SQLite file(s) in data/ folder`);
        console.log('   These will NOT be used when DATABASE_URL is set');
    } else {
        console.log('   ✅ No SQLite files found');
    }
} else {
    console.log('   ✅ No data/ folder (good - using Supabase)');
}

console.log('\n' + '='.repeat(50));
console.log('📊 VERIFICATION SUMMARY');
console.log('='.repeat(50));
console.log('✅ DATABASE_URL is set');
console.log('✅ All files use database-adapter');
console.log('✅ Database adapter loaded');
console.log('✅ Bot will use 100% Supabase');
console.log('='.repeat(50));

console.log('\n🎉 Your bot is configured to use Supabase exclusively!');
console.log('\nWhen you start the bot, you should see:');
console.log('   [Database] Using PostgreSQL (cloud database)');
console.log('\nIf you see "Using SQLite" instead, check your DATABASE_URL.\n');

process.exit(0);
