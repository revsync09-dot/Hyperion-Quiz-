// Emoji Manager - Robust fetch and cache system
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

function parseEmojiMarkup(value) {
    if (!value || typeof value !== 'string') return null;
    const match = value.trim().match(/^<(a?):([^:>]+):(\d+)>$/);
    if (!match) return null;
    return {
        id: match[3],
        name: match[2],
        animated: Boolean(match[1]),
        formatted: value.trim()
    };
}

function resolveEmojiRecord(keyOrValue) {
    if (!keyOrValue) return null;

    // 1. Try as Discord Markup
    const parsed = parseEmojiMarkup(keyOrValue);
    if (parsed) return parsed;

    // 2. Try as ID
    if (/^\d+$/.test(keyOrValue)) {
        return emojiIdCache.get(keyOrValue) || null;
    }

    // 3. Try as Name (normalized)
    const normalized = keyOrValue.replace(/^:|:$/g, '').toLowerCase();
    const formatted = emojiCache.get(normalized);
    if (formatted) return parseEmojiMarkup(formatted);

    return null;
}

async function loadEmojis(client) {
    console.log('[EMOJI] Initializing Global Metadata Sync...');
    let total = 0;
    
    // Clear caches
    emojiCache.clear();
    emojiIdCache.clear();

    const guildIds = (process.env.EMOJI_GUILD_IDS || '').split(',').map(id => id.trim()).filter(id => id);

    for (const guild of client.guilds.cache.values()) {
        try {
            const emojis = await guild.emojis.fetch();
            emojis.forEach(e => {
                const record = {
                    id: e.id,
                    name: e.name,
                    animated: e.animated,
                    formatted: e.toString()
                };
                emojiIdCache.set(e.id, record);
                emojiCache.set(e.name, record.formatted);
                emojiCache.set(e.name.toLowerCase(), record.formatted);
            });
            total += emojis.size;
            console.log(`[EMOJI] Synced ${emojis.size} units from: ${guild.name}`);
        } catch (err) {
            console.warn(`[EMOJI] Guild Sync Failed (${guild.id}):`, err.message);
        }
    }
    console.log(`[EMOJI] Sync Complete. ${total} units in local memory.`);
}

function getEmoji(key) {
    // 1. Env check
    const envVal = process.env[`EMOJI_${key}`];
    if (envVal) {
        const record = resolveEmojiRecord(envVal);
        if (record) return record.formatted;
        // If it's a raw ID but not in cache, we still return the ID as text 
        // to avoid incorrect fallbacks if the user specifically wanted that ID.
        return envVal;
    }

    // 2. Config check
    const config = EMOJI_CONFIG[key];
    if (config) {
        for (const name of config.names) {
            const record = resolveEmojiRecord(name);
            if (record) return record.formatted;
        }
        return config.fallback;
    }

    return '❔';
}

function getComponentEmoji(key) {
    const envVal = process.env[`EMOJI_${key}`];
    if (envVal) {
        const record = resolveEmojiRecord(envVal);
        if (record) return { id: record.id, name: record.name, animated: record.animated };
        if (!/[:<>]/.test(envVal)) return envVal;
    }

    const config = EMOJI_CONFIG[key];
    if (config) {
        for (const name of config.names) {
            const record = resolveEmojiRecord(name);
            if (record) return { id: record.id, name: record.name, animated: record.animated };
        }
        return config.fallback;
    }

    return '❔';
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
