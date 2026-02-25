require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildInvites,
    ],
});

client.once('ready', async () => {
    console.log('🤖 Bot is ready!\n');
    
    const guild = client.guilds.cache.first();
    
    if (!guild) {
        console.error('❌ Bot is not in any server!');
        process.exit(1);
    }
    
    console.log(`📊 Testing invite tracking for: ${guild.name}\n`);
    
    // Test 1: Check bot permissions
    console.log('1️⃣ Checking bot permissions...');
    const botMember = guild.members.me;
    const hasManageGuild = botMember.permissions.has('ManageGuild');
    const hasManageChannels = botMember.permissions.has('ManageChannels');
    
    console.log(`   Manage Server: ${hasManageGuild ? '✅' : '❌ MISSING'}`);
    console.log(`   Manage Channels: ${hasManageChannels ? '✅' : '❌'}`);
    
    if (!hasManageGuild) {
        console.log('\n⚠️  WARNING: Bot needs "Manage Server" permission to track invites!');
        console.log('   Go to Discord → Server Settings → Roles → Your Bot Role');
        console.log('   Enable "Manage Server" permission\n');
    }
    
    // Test 2: Try to fetch invites
    console.log('\n2️⃣ Testing invite fetch...');
    try {
        const invites = await guild.invites.fetch();
        console.log(`   ✅ Successfully fetched ${invites.size} invites`);
        
        if (invites.size > 0) {
            console.log('\n   📋 Current invites:');
            invites.forEach(invite => {
                console.log(`      - ${invite.code} by ${invite.inviter?.tag || 'Unknown'} (${invite.uses} uses)`);
            });
        } else {
            console.log('   ℹ️  No invites found. Create an invite to test tracking.');
        }
    } catch (error) {
        console.log(`   ❌ Failed to fetch invites: ${error.message}`);
        
        if (error.code === 50013) {
            console.log('\n   💡 Solution: Give bot "Manage Server" permission');
            console.log('      1. Go to Server Settings → Roles');
            console.log('      2. Find your bot\'s role');
            console.log('      3. Enable "Manage Server" permission');
            console.log('      4. Restart the bot');
        }
    }
    
    // Test 3: Check database
    console.log('\n3️⃣ Checking database...');
    const db = require('./utils/database');
    
    try {
        const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='invites'").all();
        
        if (tables.length > 0) {
            console.log('   ✅ Invites table exists');
            
            const count = db.prepare('SELECT COUNT(*) as count FROM invites').get();
            console.log(`   📊 Current invite records: ${count.count}`);
            
            if (count.count > 0) {
                const topInviters = db.prepare('SELECT user_id, valid_invites FROM invites ORDER BY valid_invites DESC LIMIT 5').all();
                console.log('\n   🏆 Top inviters:');
                topInviters.forEach((row, i) => {
                    console.log(`      ${i + 1}. User ${row.user_id}: ${row.valid_invites} invites`);
                });
            }
        } else {
            console.log('   ❌ Invites table does not exist!');
            console.log('   💡 The database schema might be outdated');
        }
    } catch (error) {
        console.log(`   ❌ Database error: ${error.message}`);
    }
    
    // Test 4: Check intents
    console.log('\n4️⃣ Checking Discord intents...');
    console.log('   ✅ GuildInvites intent is enabled in code');
    console.log('   ℹ️  Make sure it\'s also enabled in Discord Developer Portal:');
    console.log('      https://discord.com/developers/applications');
    console.log('      → Your Application → Bot → Privileged Gateway Intents');
    console.log('      → Enable "Server Members Intent"');
    
    console.log('\n✅ Diagnostic complete!');
    console.log('\nNext steps:');
    console.log('1. Fix any ❌ issues above');
    console.log('2. Restart your bot');
    console.log('3. Create a test invite and have someone join');
    console.log('4. Check if invites are tracked with /invites command\n');
    
    process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
