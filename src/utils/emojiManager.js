// Emoji Manager - Fetches custom emojis from Discord servers
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
        return emojiIdCache.get(envVal) || null;
    }

    const parsed = parseEmojiMarkup(envVal);
    if (parsed) {
        return parsed;
    }

    return resolveCachedEmojiByName(envVal);
}

async function loadEmojis(client) {
    console.log('[EMOJI] Loading emojis from all connected guilds...');
    let totalLoaded = 0;

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
                emojiCache.set(emoji.id, record.formatted);

                if (emoji.name) {
                    emojiCache.set(emoji.name.toLowerCase(), record.formatted);
                }
            });
            totalLoaded += emojis.size;
            console.log(`[EMOJI] Loaded ${emojis.size} emojis from guild: ${guild.name}`);
        } catch (err) {
            console.warn(`[EMOJI] Could not load guild ${guild.id}:`, err.message);
        }
    }

    console.log(`[EMOJI] Total cached emojis: ${totalLoaded}`);
}

function getEmoji(key) {
    const envEmoji = resolveEnvEmoji(key);
    if (envEmoji?.formatted) {
        return envEmoji.formatted;
    }

    const mappedName = EMOJI_CONFIG[key]?.name;
    const cachedDefault = resolveCachedEmojiByName(mappedName);
    if (cachedDefault?.formatted) {
        return cachedDefault.formatted;
    }

    return getFallbackEmoji(key);
}

function getComponentEmoji(key) {
    const envEmoji = resolveEnvEmoji(key);
    if (envEmoji?.id) {
        return { id: envEmoji.id };
    }

    const mappedName = EMOJI_CONFIG[key]?.name;
    const cachedDefault = resolveCachedEmojiByName(mappedName);
    if (cachedDefault?.id) {
        return { id: cachedDefault.id };
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
