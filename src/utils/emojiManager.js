// Emoji Manager - Stable resolver for text and component payloads
const emojiCache = new Map();
const emojiIdCache = new Map();

const EMOJI_CONFIG = {
    COIN: { names: ['coin', 'coins', 'money'], fallback: '🪙' },
    TROPHY: { names: ['trophy', 'winner', 'cup'], fallback: '🏆' },
    LEVEL: { names: ['level', 'star', 'rank'], fallback: '⭐' },
    QUIZ: { names: ['quiz', 'question', 'faq'], fallback: '❓' },
    PROFILE: { names: ['profile', 'user', 'persona'], fallback: '👤' },
    GLOBE: { names: ['globe', 'world', 'web'], fallback: '🌐' },
    MONEY: { names: ['money', 'cash', 'dollars'], fallback: '💰' },
    FIRE: { names: ['fire', 'hot', 'streak'], fallback: '🔥' },
    ROCKET: { names: ['rocket', 'boost', 'fast'], fallback: '🚀' },
    REFRESH: { names: ['refresh', 'reload', 'sync'], fallback: '🔄' },
    CHART: { names: ['chart', 'charts', 'stats', 'analytics'], fallback: '📊' },
    INFO: { names: ['info', 'help', 'details'], fallback: 'ℹ️' },
    SUCCESS: { names: ['success', 'check', 'done'], fallback: '✅' },
    ERROR: { names: ['error', 'cross', 'fail'], fallback: '❌' },
    FIRST: { names: ['first', 'gold', '1st'], fallback: '🥇' },
    SECOND: { names: ['second', 'silver', '2nd'], fallback: '🥈' },
    THIRD: { names: ['third', 'bronze', '3rd'], fallback: '🥉' },
    ONE: { names: ['one', '1', 'circle1', 'number1'], fallback: '1️⃣' },
    TWO: { names: ['two', '2', 'circle2', 'number2'], fallback: '2️⃣' },
    THREE: { names: ['three', '3', 'circle3', 'number3'], fallback: '3️⃣' },
    FOUR: { names: ['four', '4', 'circle4', 'number4'], fallback: '4️⃣' }
};

function getFallbackEmoji(key) {
    return EMOJI_CONFIG[key]?.fallback || '❔';
}

function parseEmojiMarkup(value) {
    if (typeof value !== 'string') return null;

    const match = value.trim().match(/^<(a?):([^:>]+):(\d+)>$/);
    if (!match) return null;

    return {
        id: match[3],
        name: match[2],
        animated: Boolean(match[1]),
        formatted: value.trim()
    };
}

function resolveCachedEmojiByName(name) {
    if (!name) return null;

    const normalizedName = name.replace(/^:|:$/g, '').trim().toLowerCase();
    if (!normalizedName) return null;

    const cached = emojiCache.get(normalizedName);
    if (!cached) return null;

    return parseEmojiMarkup(cached);
}

function resolveEnvEmoji(key) {
    const envVal = process.env[`EMOJI_${key}`]?.trim();
    if (!envVal) return null;

    if (/^\d+$/.test(envVal)) {
        return emojiIdCache.get(envVal) || { id: envVal };
    }

    const parsed = parseEmojiMarkup(envVal);
    if (parsed) return parsed;

    return resolveCachedEmojiByName(envVal);
}

async function loadEmojis(client) {
    console.log('[EMOJI] Initializing Global Metadata Sync...');
    let total = 0;

    emojiCache.clear();
    emojiIdCache.clear();

    for (const guild of client.guilds.cache.values()) {
        try {
            const emojis = await guild.emojis.fetch();
            emojis.forEach((emoji) => {
                const record = {
                    id: emoji.id,
                    name: emoji.name,
                    animated: emoji.animated,
                    formatted: emoji.toString()
                };

                emojiIdCache.set(emoji.id, record);
                if (emoji.name) {
                    emojiCache.set(emoji.name.toLowerCase(), record.formatted);
                }
            });
            total += emojis.size;
            console.log(`[EMOJI] Synced ${emojis.size} units from: ${guild.name}`);
        } catch (error) {
            console.warn(`[EMOJI] Guild Sync Failed (${guild.id}):`, error.message);
        }
    }

    console.log(`[EMOJI] Sync Complete. ${total} units in local memory.`);
}

function getEmoji(key) {
    const envEmoji = resolveEnvEmoji(key);
    if (envEmoji?.formatted) {
        return envEmoji.formatted;
    }

    const names = EMOJI_CONFIG[key]?.names || [];
    for (const name of names) {
        const cached = resolveCachedEmojiByName(name);
        if (cached?.formatted) {
            return cached.formatted;
        }
    }

    return getFallbackEmoji(key);
}

function getComponentEmoji(key) {
    const envEmoji = resolveEnvEmoji(key);
    if (envEmoji?.id) {
        return { id: envEmoji.id };
    }

    const names = EMOJI_CONFIG[key]?.names || [];
    for (const name of names) {
        const cached = resolveCachedEmojiByName(name);
        if (cached?.id) {
            return { id: cached.id };
        }
    }

    return getFallbackEmoji(key);
}

function getCustomEmoji(name) {
    const upperName = name?.toUpperCase();
    if (upperName && process.env[`EMOJI_${upperName}`]) {
        return getEmoji(upperName);
    }

    const cached = resolveCachedEmojiByName(name);
    return cached?.formatted || name;
}

module.exports = {
    EMOJI_CONFIG,
    loadEmojis,
    getEmoji,
    getComponentEmoji,
    getCustomEmoji,
    emojiCache,
    emojiIdCache
};
