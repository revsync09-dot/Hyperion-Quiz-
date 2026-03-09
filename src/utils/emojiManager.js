// Emoji Manager - Fetches custom emojis from Discord servers
// Guild IDs configured in .env
const emojiCache = new Map();

const EMOJI_CONFIG = {
    COIN: { name: 'coin', fallback: '🪙' },
    TROPHY: { name: 'trophy', fallback: '🏆' },
    LEVEL: { name: 'level', fallback: '⭐' },
    QUIZ: { name: 'quiz', fallback: '❓' },
    FIRST: { name: 'first', fallback: '🥇' },
    SECOND: { name: 'second', fallback: '🥈' },
    THIRD: { name: 'third', fallback: '🥉' },
    ONE: { name: 'one', fallback: '1️⃣' },
    TWO: { name: 'two', fallback: '2️⃣' },
    THREE: { name: 'three', fallback: '3️⃣' },
    FOUR: { name: 'four', fallback: '4️⃣' },
};

async function loadEmojis(client) {
    const guildIds = (process.env.EMOJI_GUILD_IDS || '').split(',').map(id => id.trim()).filter(Boolean);
    
    if (guildIds.length === 0) {
        console.log('[EMOJI] No guild IDs provided. Using fallback emojis.');
        return;
    }

    console.log(`[EMOJI] Loading emojis from ${guildIds.length} guilds...`);

    for (const guildId of guildIds) {
        try {
            const guild = await client.guilds.fetch(guildId);
            if (!guild) continue;
            
            const emojis = await guild.emojis.fetch();
            
            emojis.forEach(emoji => {
                // Store ALL emojis from these guilds for potential use
                emojiCache.set(emoji.name?.toLowerCase(), emoji.toString());
            });
            
            console.log(`[EMOJI] Loaded ${emojis.size} emojis from guild: ${guild.name}`);
        } catch (err) {
            console.warn(`[EMOJI] Could not load guild ${guildId}:`, err.message);
        }
    }

    console.log(`[EMOJI] Total cached emojis: ${emojiCache.size}`);
}

function getEmoji(key) {
    // 1. Check .env overrides FIRST (High Priority)
    const envKey = `EMOJI_${key}`;
    const envVal = process.env[envKey];
    
    if (envVal) {
        if (/^\d+$/.test(envVal)) {
            // Find the actual emoji in the cached guild emojis to get correct animated state and name
            for (const formatted of emojiCache.values()) {
                if (formatted.includes(envVal)) return formatted;
            }
            return `<:e:${envVal}>`; // standard fallback
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

function getCustomEmoji(name) {
    const lowerName = name?.toLowerCase();
    // Check .env for dynamic keys like EMOJI_MYCUSTOM
    if (process.env[`EMOJI_${name?.toUpperCase()}`]) {
        return process.env[`EMOJI_${name?.toUpperCase()}`];
    }
    return emojiCache.get(lowerName) || name;
}

module.exports = {
    EMOJI_CONFIG,
    loadEmojis,
    getEmoji,
    getCustomEmoji,
    emojiCache
};
