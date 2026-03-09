const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

const api = require('./api/server');
const { renderLeaderboard } = require('./commands/leaderboard');
const QuizManager = require('./quiz/QuizManager');
const { loadEmojis } = require('./utils/emojiManager');
const { startHeartbeat } = require('./utils/statusManager');
const { buildError, buildInfo } = require('./utils/uiBuilders');

const PRIMARY_GUILD_ID = '1422969507734884374';

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildEmojisAndStickers
    ] 
});

client.commands = new Collection();

// Load Commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    }
}

client.once(Events.ClientReady, async (c) => {
    console.log(`[BOT] Ready! Logged in as ${c.user.tag}`);
    
    try {
        // Load custom emojis
        await loadEmojis(client);
    } catch (err) {
        console.error('[CORE] Failed to load emojis:', err);
    }

    // Start Bot Heartbeat for Website Status
    startHeartbeat(() => QuizManager.getActiveGamesCount());

    try {
        const { initScheduler } = require('./utils/automationScheduler');
        initScheduler(c);
        console.log('[CORE] Automation Scheduler Initialized.');
    } catch (err) {
        console.error('[CORE] Failed to init scheduler:', err);
    }
    
    // Web API is moving to Next.js for Vercel support
    // api.startServer();
});

// Robust Error Handling
client.on('error', (error) => {
    console.error('[DISCORD] Client Error:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('[CRASH] Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('[CRASH] Uncaught Exception:', error);
    // Be careful here, you might want to restart the process
});

client.on(Events.InteractionCreate, async interaction => {
    // SECURITY GATE: Only allow Hyperion Guild
    if (interaction.guildId !== PRIMARY_GUILD_ID) {
        const errorView = buildError("This bot only works inside the Hyperion server.");
        if (interaction.isRepliable()) {
          return interaction.reply({ ...errorView.toJSON(), ephemeral: true }).catch(() => {});
        }
        return;
    }

    // 1. Handle Slash Commands
    if (interaction.isChatInputCommand()) {
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error('[CORE] Command Error:', error);
            const errorView = buildError('An unexpected error occurred in the Hyperion core.');
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ ...errorView.toJSON(), ephemeral: true });
            } else {
                await interaction.reply({ ...errorView.toJSON(), ephemeral: true });
            }
        }
    } 
    
    // 2. Handle Button Interactions
    else if (interaction.isButton()) {
        const { customId } = interaction;

        try {
            // Leaderboard Pagination logic
            if (customId.startsWith('lb_')) {
                const parts = customId.split('_');
                const type = parts[1]; // next or prev
                const category = parts[2];
                let page = parseInt(parts[3]);

                if (type === 'next') page++;
                else if (type === 'prev') page--;

                await renderLeaderboard(interaction, category, page, true);
                return;
            }

            // Global Actions
            if (customId === 'btn_view_leaderboard') {
                const lbCmd = client.commands.get('leaderboard');
                if (lbCmd) await lbCmd.execute(interaction);
                return;
            }

            if (customId === 'btn_view_profile') {
                const profCmd = client.commands.get('profile');
                if (profCmd) await profCmd.execute(interaction);
                return;
            }

            if (customId === 'btn_play_quiz' || customId === 'btn_play_again') {
                await QuizManager.startLobby(interaction);
                return;
            }

            if (customId === 'btn_view_stats') {
                const infoView = buildInfo("Global Analytics", "Detailed activity dashboards and historical logs are available on our official website terminal.");
                await interaction.reply({ ...infoView.toJSON(), ephemeral: true });
                return;
            }
        } catch (err) {
            console.error('[CORE] Interaction Error:', err);
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
