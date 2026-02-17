const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const VoiceTracker = require('./utils/voiceTracker');
const RoleManager = require('./utils/roleManager');
const Validator = require('./utils/validator');
const rateLimiter = require('./utils/rateLimiter');
const config = require('./config');
require('dotenv').config();

// Validate environment variables before starting
try {
    Validator.validateEnv();
} catch (error) {
    console.error('❌ Environment validation failed:', error.message);
    process.exit(1);
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildModeration,
    ]
});

client.commands = new Collection();

// Load commands
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        }
    }
}

// Load events
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    
    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }
}

// Periodic voice activity update
setInterval(() => {
    try {
        VoiceTracker.updateActiveUsers();
    } catch (error) {
        console.error('❌ Error updating active users:', error);
    }
}, config.updateInterval * 1000);

// Periodic role check
setInterval(async () => {
    try {
        for (const [, guild] of client.guilds.cache) {
            await RoleManager.checkAllMembers(guild);
        }
    } catch (error) {
        console.error('❌ Error checking roles:', error);
    }
}, config.checkInterval * 60 * 1000);

// Periodic rate limiter cleanup
setInterval(() => {
    rateLimiter.cleanup();
}, 300000); // Every 5 minutes

// Validate environment variables before starting
if (!process.env.DISCORD_TOKEN) {
    console.error('❌ DISCORD_TOKEN is not set in .env file!');
    process.exit(1);
}

if (!process.env.CLIENT_ID) {
    console.error('❌ CLIENT_ID is not set in .env file!');
    process.exit(1);
}

if (!process.env.GUILD_ID) {
    console.error('❌ GUILD_ID is not set in .env file!');
    process.exit(1);
}

// Handle uncaught errors gracefully
process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled promise rejection:', error);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught exception:', error);
    process.exit(1);
});

client.login(process.env.DISCORD_TOKEN).catch(error => {
    console.error('❌ Failed to login:', error);
    process.exit(1);
});
