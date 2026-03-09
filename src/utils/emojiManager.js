// Emoji Manager - Robust fetch and cache system
const emojiCache = new Map();
const emojiIdCache = new Map();

const EMOJI_CONFIG = {
    COIN: { name: 'coin', fallback: '🪙' },
    TROPHY: { name: 'trophy', fallback: '🏆' },
    LEVEL: { name: 'level', fallback: '⭐' },
    QUIZ: { name: 'quiz', fallback: '❓' },
    PROFILE: { name: 'profile', fallback: '👤' },
    GLOBE: { name: 'globe', fallback: '🌐' },
    MONEY: { name: 'money', fallback: '💰' },
    FIRE: { name: 'fire', fallback: '🔥' },
    ROCKET: { name: 'rocket', fallback: '🚀' },
    REFRESH: { name: 'refresh', fallback: '🔄' },
    CHART: { name: 'chart', fallback: '📊' },
    INFO: { name: 'info', fallback: 'ℹ️' },
    SUCCESS: { name: 'success', fallback: '✅' },
    ERROR: { name: 'error', fallback: '❌' },
    FIRST: { name: 'first', fallback: '🥇' },
    SECOND: { name: 'second', fallback: '🥈' },
    THIRD: { name: 'third', fallback: '🥉' },
    ONE: { name: 'one', fallback: '1️⃣' },
    TWO: { name: 'two', fallback: '2️⃣' },
    THREE: { name: 'three', fallback: '3️⃣' },
    FOUR: { name: 'four', fallback: '4️⃣' }
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
                // Cache by name and name lower
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
        // If env set but not found in cache, return the string as is (might be Unicode or raw name)
        return envVal;
    }

    // 2. Config check
    const config = EMOJI_CONFIG[key];
    if (config) {
        const record = resolveEmojiRecord(config.name);
        if (record) return record.formatted;
        return config.fallback;
    }

    return '❔';
}

function getComponentEmoji(key) {
    const envVal = process.env[`EMOJI_${key}`];
    if (envVal) {
        const record = resolveEmojiRecord(envVal);
        if (record) return { id: record.id, name: record.name, animated: record.animated };
        // If it's just unicode in env
        if (!/[:<>]/.test(envVal)) return envVal;
    }

    const config = EMOJI_CONFIG[key];
    if (config) {
        const record = resolveEmojiRecord(config.name);
        if (record) return { id: record.id, name: record.name, animated: record.animated };
        return config.fallback;
    }

    return '❔';
}

function getCustomEmoji(name) {
    const record = resolveEmojiRecord(name);
    return record ? record.formatted : name;
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
