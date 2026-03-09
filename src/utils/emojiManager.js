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
    // First check cache by the mapped name
    const mappedName = EMOJI_NAMES[key];
    if (mappedName && emojiCache.has(mappedName)) {
        return emojiCache.get(mappedName);
    }

    // Check .env overrides
    const envKey = `EMOJI_${key}`;
    if (process.env[envKey]) {
        return process.env[envKey];
    }

    // Fallback
    return FALLBACKS[key] || '❔';
}

// Get any emoji by its custom name
function getCustomEmoji(name) {
    return emojiCache.get(name?.toLowerCase()) || name;
}

module.exports = {
    loadEmojis,
    getEmoji,
    getCustomEmoji,
    emojiCache
};
