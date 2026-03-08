# Quiz Meister - Competitive Discord Bot & Web Platform

A high-end, professional Discord quiz bot built with **Discord Components V2** and a matching **Next.js & React** gaming dashboard.

## 🚀 Quick Start

1.  **Configure Environment**: Open the `.env` file in the root directory and replace the placeholders with your actual credentials:
    ```env
    DISCORD_TOKEN=your_bot_token
    CLIENT_ID=your_client_id
    SUPABASE_URL=your_supabase_project_url
    SUPABASE_KEY=your_supabase_service_role_key
    ```
2.  **Install Dependencies**:
    ```bash
    npm install
    cd website && npm install && cd ..
    ```
3.  **Deploy Commands**:
    ```bash
    npm run deploy-commands
    ```
4.  **Run Development Mode**:
    ```bash
    npm run dev
    ```
    _This starts the Bot (Port 3001) and the Website (Port 3000) simultaneously._

## 🛠️ Features

- **Discord Bot**:
  - Dynamic 5-round Quiz system with progressive difficulty.
  - Full economy: earn coins, level up, and track stats.
  - Modern V2 UI for all interactions.
  - Emoji manager fetching directly from your guilds.
- **Web Dashboard**:
  - **Live Statistics**: Real-time charts of player activity and global economy.
  - **Global Leaderboards**: Rank players by points, coins, or wins.
  - **Player Profiles**: Detailed stats, charts, and achievements for every user.
  - **Responsive Design**: Fully optimized for desktop and mobile.

## 🏗️ Technology Stack

- **Bot**: Discord.js v14+, Express, Supabase.
- **Website**: Next.js 15, Tailwind v4, Framer Motion, Recharts.
- **Database**: Supabase (PostgreSQL).

---

Made with ❤️ by Hyperion
