# Hyperion Ecosystem: Bot & Website

Welcome to the **Hyperion** core. A high-end, professional Discord quiz and economy system exclusively locked to the Hyperion Server Guild.

## 🛠️ Key Components

### 1. The Discord Bot (`src/`)

- **Components V2 Engine**: A custom DSL (`uiBuilders.js`) that produces premium-quality, terminal-inspired Discord UIs.
- **Server Lock**: Strictly enforces interactions only within Guild ID: `1422969507734884374`.
- **Engagement Protocol (Quiz)**: 5 rounds of escalating difficulty (Easy → Extreme) with custom choice emojis (1-4).
- **Global Heartbeat**: Reports live bot status and active games to Supabase every 60 seconds.

### 2. The Website Terminal (`website/`)

- **Next.js 16 (Turbopack)**: Blazing fast performance for live statistics.
- **Live Status Badge**: Visual indicator in the Navbar showing if the bot is "System Live" or under "Maintenance".
- **Dynamic Leaderboards**: Real-time rankings pulled directly from the Hyperion Database.
- **Player Profiles**: Detailed activity and accuracy charts for every authenticated player.

## ⚙️ Configuration (.env)

Ensure these variables are set in your root `.env`:

```env
DISCORD_TOKEN=your_token
CLIENT_ID=your_client_id
PRIMARY_GUILD_ID=1422969507734884374

SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key

# Custom Emojis (Provide Guild IDs where emojis are located)
EMOJI_GUILD_IDS=guild_id_1,guild_id_2

# Bot Emoji Overrides (Optional: Discord emoji IDs or unicode)
EMOJI_COIN=
EMOJI_TROPHY=
EMOJI_LEVEL=
EMOJI_QUIZ=
EMOJI_PROFILE=
EMOJI_GLOBE=
EMOJI_MONEY=
EMOJI_FIRE=
EMOJI_ROCKET=
EMOJI_REFRESH=
EMOJI_CHART=
EMOJI_INFO=
EMOJI_SUCCESS=
EMOJI_ERROR=
EMOJI_FIRST=
EMOJI_SECOND=
EMOJI_THIRD=
EMOJI_ONE=
EMOJI_TWO=
EMOJI_THREE=
EMOJI_FOUR=

# Website Public Emoji Overrides (Optional: Discord emoji IDs or unicode)
NEXT_PUBLIC_EMOJI_COIN=
NEXT_PUBLIC_EMOJI_TROPHY=
NEXT_PUBLIC_EMOJI_LEVEL=
NEXT_PUBLIC_EMOJI_QUIZ=
NEXT_PUBLIC_EMOJI_FIRST=
NEXT_PUBLIC_EMOJI_SECOND=
NEXT_PUBLIC_EMOJI_THIRD=
```

## 🚀 Deployment

1. **Database**: Run the `DB_MIGRATION.sql` script in your Supabase SQL Editor.
2. **Website**: Deploy the `website/` folder to **Vercel**. Connect your GitHub repository.
3. **Bot**: Run the bot via `npm run dev` or host it on a VPS (PM2 recommended).

---

_Developed for the Hyperion Server Guild._ 🛡️✨
