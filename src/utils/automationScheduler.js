const supabase = require('../database/supabase');
const QuizManager = require('../quiz/QuizManager');

const runningGuilds = new Set();

async function claimAutoQuizSlot(config) {
    const intervalMinutes = Math.max(1, Number(config.quiz_interval_minutes) || 0);
    const cutoffIso = new Date(Date.now() - intervalMinutes * 60 * 1000).toISOString();
    const claimIso = new Date().toISOString();

    const { data, error } = await supabase
        .from('guild_config')
        .update({ last_auto_quiz: claimIso })
        .eq('guild_id', config.guild_id)
        .eq('is_auto_quiz_enabled', true)
        .or(`last_auto_quiz.is.null,last_auto_quiz.lte.${cutoffIso}`)
        .select('guild_id,last_auto_quiz')
        .maybeSingle();

    if (error) {
        throw error;
    }

    return Boolean(data);
}

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
            if (runningGuilds.has(config.guild_id)) {
                continue;
            }

            const lastQuiz = config.last_auto_quiz ? new Date(config.last_auto_quiz) : new Date(0);
            const intervalMinutes = Math.max(1, Number(config.quiz_interval_minutes) || 0);
            const intervalMs = intervalMinutes * 60 * 1000;

            if (now - lastQuiz < intervalMs) {
                continue;
            }

            const guild = client.guilds.cache.get(config.guild_id);
            if (!guild) continue;

            const channel = guild.channels.cache.get(config.quiz_channel_id);
            if (!channel) continue;

            // PRE-FLIGHT CHECK: Avoid overlaps if a game is already active in memory
            if (QuizManager.isGameActive && QuizManager.isGameActive(channel.id)) {
                continue;
            }

            runningGuilds.add(config.guild_id);
            console.log(`[AUTO-QUIZ] Temporal window open for ${guild.name}. Checking slot availability...`);

            try {
                const claimed = await claimAutoQuizSlot(config);
                if (!claimed) {
                    continue;
                }

                let lastMessage = null;

                const fakeInteraction = {
                    isAutoDeploy: true,
                    channelId: channel.id,
                    channel,
                    user: client.user,
                    guildId: config.guild_id,
                    reply: async (payload) => {
                        lastMessage = await channel.send(payload);
                        return lastMessage;
                    },
                    followUp: async (payload) => {
                        lastMessage = await channel.send(payload);
                        return lastMessage;
                    },
                    fetchReply: async () => lastMessage,
                    deferReply: async () => {},
                    editReply: async (payload) => {
                        lastMessage = await channel.send(payload);
                        return lastMessage;
                    }
                };

                console.log(`[AUTO-QUIZ] Initiating protocol in ${guild.name} (#${channel.name})`);
                await QuizManager.startLobby(fakeInteraction);
            } catch (error) {
                console.error('[AUTO-QUIZ] Scheduler Failure:', error.message);
            } finally {
                runningGuilds.delete(config.guild_id);
            }
        }
    } catch (error) {
        console.error('[AUTO-QUIZ] Scheduler Failure:', error.message);
    }
}

function initScheduler(client) {
    setInterval(() => checkAutomatedQuizzes(client), 10000);
}

module.exports = { initScheduler };
