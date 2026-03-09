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
    FOUR: { name: 'four', fallback: '4️⃣' },
};

async function loadEmojis(client) {
    console.log(`[EMOJI] Loading emojis from all connected guilds...`);
    let totalLoaded = 0;

    for (const guild of client.guilds.cache.values()) {
        try {
            const emojis = await guild.emojis.fetch();
            emojis.forEach(emoji => {
                // Store ALL emojis from these guilds for potential use
                emojiCache.set(emoji.id, emoji.toString());
                if (emoji.name) {
                    emojiCache.set(emoji.name.toLowerCase(), emoji.toString());
                }
                // Also populate emojiIdCache for component usage
                emojiIdCache.set(emoji.id, {
                    id: emoji.id,
                    name: emoji.name,
                    animated: emoji.animated,
                    formatted: emoji.toString()
                });
            });
            totalLoaded += emojis.size;
            console.log(`[EMOJI] Loaded ${emojis.size} emojis from guild: ${guild.name}`);
        } catch (err) {
            console.warn(`[EMOJI] Could not load guild ${guild.id}:`, err.message);
        }
    }

    console.log(`[EMOJI] Total cached emojis: ${emojiCache.size}`);
}

function getEmoji(key) {
    const envKey = `EMOJI_${key}`;
    const envVal = process.env[envKey];
    
    if (envVal) {
        if (/^\d+$/.test(envVal)) {
            const cachedById = emojiIdCache.get(envVal);
            if (cachedById) return cachedById.formatted;

            const fallbackName = EMOJI_CONFIG[key]?.name || 'emoji';
            return `<:${fallbackName}:${envVal}>`;
        }

        const normalizedName = envVal.replace(/^:|:$/g, '').toLowerCase();
        if (emojiCache.has(normalizedName)) {
            return emojiCache.get(normalizedName);
        }

        return envVal;
    }

    // 2. Check guild cache
    const mappedName = EMOJI_CONFIG[key]?.name;
    if (mappedName && emojiCache.has(mappedName)) {
        return emojiCache.get(mappedName);
    }

    // 3. Fallback
    return EMOJI_CONFIG[key]?.fallback || '❔';
}

function getComponentEmoji(key) {
    const envKey = `EMOJI_${key}`;
    const envVal = process.env[envKey];
    
    if (envVal) {
        if (/^\d+$/.test(envVal)) {
            const cachedById = emojiIdCache.get(envVal);
            if (cachedById) {
                return { id: cachedById.id, name: cachedById.name, animated: cachedById.animated };
            }

            return { id: envVal, name: EMOJI_CONFIG[key]?.name || 'emoji' };
        }
        const normalizedName = envVal.replace(/^:|:$/g, '').toLowerCase();
        if (emojiCache.has(normalizedName)) {
            const cached = emojiCache.get(normalizedName);
            const match = cached.match(/<(a?):([^:]+):(\d+)>/);
            if (match) {
                return {
                    id: match[3],
                    name: match[2],
                    animated: Boolean(match[1])
                };
            }
        }

        return envVal;
    }

    const mappedName = EMOJI_CONFIG[key]?.name;
    if (mappedName && emojiCache.has(mappedName)) {
        const cached = emojiCache.get(mappedName);
        const match = cached.match(/<(a?):([^:]+):(\d+)>/);
        if (match) {
            return {
                id: match[3],
                name: match[2],
                animated: Boolean(match[1])
            };
        }
    }

    return EMOJI_CONFIG[key]?.fallback || '❔';
}

function getCustomEmoji(name) {
    const lowerName = name?.toLowerCase();
    if (process.env[`EMOJI_${name?.toUpperCase()}`]) {
        return process.env[`EMOJI_${name?.toUpperCase()}`];
    }
    return emojiCache.get(lowerName) || name;
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
