const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

const commands = [];
const commandsPath = path.join(__dirname, '..', 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	if ('data' in command && 'execute' in command) {
		commands.push(command.data.toJSON());
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// Use guild-specific deployment for instant updates (Hyperion Guild)
        const client_id = process.env.CLIENT_ID;
        const guild_id = '1422969507734884374'; 
        
        if(!client_id) {
            console.error("Please provide a CLIENT__ID in your .env file to deploy commands.");
            return;
        }

		console.log(`Started refreshing ${commands.length} application (/) commands for guild: ${guild_id}`);

		const data = await rest.put(
			Routes.applicationGuildCommands(client_id, guild_id),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands instantly!`);
	} catch (error) {
		console.error("Check your CLIENT_ID and TOKEN in .env!");
		console.error(error);
	}
})();
