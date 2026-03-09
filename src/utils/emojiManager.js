// Emoji Manager - Fetches custom emojis from Discord servers
// Guild IDs configured in .env
const emojiCache = new Map();

const EMOJI_NAMES = {
    COIN: 'coin',
    TROPHY: 'trophy',
    LEVEL: 'level',
    QUIZ: 'quiz',
    FIRST: 'first',
    SECOND: 'second',
    THIRD: 'third',
    ONE: 'one',
    TWO: 'two',
    THREE: 'three',
    FOUR: 'four',
};

// Fallback unicode emojis
const FALLBACKS = {
    COIN: '🪙',
    TROPHY: '🏆',
    LEVEL: '⭐',
    QUIZ: '❓',
    FIRST: '🥇',
    SECOND: '🥈',
    THIRD: '🥉',
    ONE: '1️⃣',
    TWO: '2️⃣',
    THREE: '3️⃣',
    FOUR: '4️⃣',
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
        // If it's just a numeric ID, format it (assuming it's a static emoji for now, or just use ID if client handles it)
        // Usually, to display, we need <:name:id>. If we only have ID, we might need a generic name.
        if (/^\d+$/.test(envVal)) {
            return `<:emoji:${envVal}>`;
        }
        return envVal;
    }

    // 2. Check guild cache
    const mappedName = EMOJI_NAMES[key];
    if (mappedName && emojiCache.has(mappedName)) {
        return emojiCache.get(mappedName);
    }

    // 3. Fallback
    return FALLBACKS[key] || '❔';
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
    loadEmojis,
    getEmoji,
    getCustomEmoji,
    emojiCache
};
