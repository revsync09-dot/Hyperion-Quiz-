const supabase = require('../database/supabase');
const QuizManager = require('../quiz/QuizManager');

async function checkAutomatedQuizzes(client) {
    try {
        const { data: configs, error } = await supabase
            .from('guild_config')
            .select('*')
            .eq('is_auto_quiz_enabled', true);

        if (error) throw error;
        if (!configs || configs.length === 0) return;

        const now = new Date();

        for (const config of configs) {
            const lastQuiz = config.last_auto_quiz ? new Date(config.last_auto_quiz) : new Date(0);
            const intervalMs = config.quiz_interval_minutes * 1000; // stored as seconds now

            if (now - lastQuiz >= intervalMs) {
                const guild = client.guilds.cache.get(config.guild_id);
                if (!guild) continue;

                const channel = guild.channels.cache.get(config.quiz_channel_id);
                if (!channel) continue;

                // Mocking an interaction for startLobby
                const fakeInteraction = {
                    isAutoDeploy: true,
                    channelId: channel.id,
                    channel: channel,
                    user: client.user,
                    guildId: config.guild_id,
                    reply: async (msg) => channel.send(msg).catch(() => {}), // Ignore send errors
                    followUp: async (msg) => channel.send(msg).catch(() => {}),
                    fetchReply: async () => {}, // mock
                    deferReply: async () => {}, // mock
                    editReply: async (msg) => channel.send(msg).catch(() => {}), // mock
                };
                console.log(`[AUTO-QUIZ] Initiating protocol in ${guild.name} (#${channel.name})`);
                await QuizManager.startLobby(fakeInteraction);

                // Update last run time
                await supabase
                    .from('guild_config')
                    .update({ last_auto_quiz: now })
                    .eq('guild_id', config.guild_id);
            }
        }
    } catch (err) {
        console.error('[AUTO-QUIZ] Scheduler Failure:', err.message);
    }
}

function initScheduler(client) {
    // Check every 10 seconds
    setInterval(() => checkAutomatedQuizzes(client), 10000);
}

module.exports = { initScheduler };
