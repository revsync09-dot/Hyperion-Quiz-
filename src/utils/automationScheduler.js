const supabase = require('../database/supabase');
const QuizManager = require('../quiz/QuizManager');

const runningGuilds = new Set();

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
            const intervalMs = config.quiz_interval_minutes * 1000;

            if (now - lastQuiz < intervalMs) {
                continue;
            }

            const guild = client.guilds.cache.get(config.guild_id);
            if (!guild) continue;

            const channel = guild.channels.cache.get(config.quiz_channel_id);
            if (!channel) continue;

            runningGuilds.add(config.guild_id);

            try {
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

                const { error: updateError } = await supabase
                    .from('guild_config')
                    .update({ last_auto_quiz: new Date().toISOString() })
                    .eq('guild_id', config.guild_id);

                if (updateError) {
                    throw updateError;
                }
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
