const { REST, Routes } = require('discord.js');
require('dotenv').config();

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('🔍 Fetching all registered commands...');

        // Fetch guild commands
        const guildCommands = await rest.get(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID)
        );

        console.log(`Found ${guildCommands.length} guild command(s)`);

        if (guildCommands.length > 0) {
            console.log('\n📋 Current guild commands:');
            guildCommands.forEach((cmd, index) => {
                console.log(`  ${index + 1}. ${cmd.name} (ID: ${cmd.id})`);
            });

            console.log('\n🗑️  Deleting all guild commands...');
            
            for (const command of guildCommands) {
                await rest.delete(
                    Routes.applicationGuildCommand(process.env.CLIENT_ID, process.env.GUILD_ID, command.id)
                );
                console.log(`  ✅ Deleted: ${command.name}`);
            }
        }

        // Fetch global commands
        const globalCommands = await rest.get(
            Routes.applicationCommands(process.env.CLIENT_ID)
        );

        console.log(`\nFound ${globalCommands.length} global command(s)`);

        if (globalCommands.length > 0) {
            console.log('\n📋 Current global commands:');
            globalCommands.forEach((cmd, index) => {
                console.log(`  ${index + 1}. ${cmd.name} (ID: ${cmd.id})`);
            });

            console.log('\n🗑️  Deleting all global commands...');
            
            for (const command of globalCommands) {
                await rest.delete(
                    Routes.applicationCommand(process.env.CLIENT_ID, command.id)
                );
                console.log(`  ✅ Deleted: ${command.name}`);
            }
        }

        console.log('\n✅ All commands cleared successfully!');
        console.log('\n📝 Next step: Run "node deploy-commands.js" to redeploy clean commands');

    } catch (error) {
        console.error('❌ Error clearing commands:', error);
    }
})();
