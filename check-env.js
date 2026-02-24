// Quick script to verify environment variables are loaded correctly
require('dotenv').config();

console.log('=== Environment Variables Check ===\n');

const requiredVars = [
    'DISCORD_TOKEN',
    'CLIENT_ID',
    'GUILD_ID',
    'LOG_CHANNEL_ID',
    'ROLE_LOG_CHANNEL_ID',
    'DELETED_MESSAGES_LOG_CHANNEL_ID',
    'OWNER_ID'
];

let allGood = true;

for (const varName of requiredVars) {
    const value = process.env[varName];
    const status = value ? '✅' : '❌';
    const display = value ? (varName.includes('TOKEN') ? '[HIDDEN]' : value) : 'NOT SET';
    
    console.log(`${status} ${varName}: ${display}`);
    
    if (!value) {
        allGood = false;
    }
}

console.log('\n=== Channel IDs ===');
console.log(`Main Log Channel: ${process.env.LOG_CHANNEL_ID || 'NOT SET'}`);
console.log(`Role Log Channel: ${process.env.ROLE_LOG_CHANNEL_ID || 'NOT SET'}`);
console.log(`Deleted Messages Channel: ${process.env.DELETED_MESSAGES_LOG_CHANNEL_ID || 'NOT SET'}`);

console.log('\n=== Result ===');
if (allGood) {
    console.log('✅ All required environment variables are set!');
    console.log('\nYou can now start the bot with: npm start');
} else {
    console.log('❌ Some environment variables are missing!');
    console.log('Please check your .env file.');
}
