# 🏗️ Hyperion: Full System Overhaul Plan

This plan outlines the complete conversion of "Quiz Meister" into the **Hyperion** system, strictly limited to Guild ID `1422969507734884374`.

## 1. Database Schema Update (Supabase)

We will migrate to the new relational schema provided:

- **`users`**: Core player data using UUIDs and Discord IDs.
- **`quiz_games`**: Tracks every quiz session.
- **`quiz_results`**: Links users to their performance in specific games.
- **`economy_logs`**: Audit trail for all coin transactions.

## 2. Bot Logic & Security

- **Strict Guild Gate**: Every interaction and event will check `interaction.guildId === '1422969507734884374'`.
- **Legacy UI Removal**: Audit all commands to ensure 100% usage of Components V2 Builders.
- **Economy Middleware**: Centralized logging for every coin update.

## 3. Quiz System Evolution

- **Round Scaling**: 5 rounds (Easy → Extreme).
- **Dynamic Content**: Integration with **OpenTriviaDB** for fresh questions.
- **Category Rotation**: Randomly picking from Gaming, Anime, General Knowledge, Movies, and Music.

## 4. Leaderboard & Profile Overhaul

- **Performance**: Optimized SQL queries for 3000+ members.
- **Accuracy Tracking**: Calculating `%` based on `correct_answers` / `questions_attempted`.
- **Pagination**: High-performance pagination for both Bot and Website.

## 5. Website Redesign

- **Hyperion Identity**: Dark gaming theme, glassmorphism, and soft glows.
- **Live Stats**: Direct connection to the optimized API endpoints.
- **Player Pages**: Detailed charts and activity history for every Hyperion member.

---

### Step-by-Step Execution:

1.  **Phase 1**: Apply the new SQL schema in Supabase.
2.  **Phase 2**: Update `src/database/` models to use the new column names (`discord_id`, `total_points`, etc.).
3.  **Phase 4**: Implement the 5-round logic and OpenTriviaDB fetcher in `QuizManager`.
4.  **Phase 5**: Refactor all commands to strictly enforce the Guild ID rule.
5.  **Phase 6**: Update API endpoints and Website frontend to match the new schema and branding.
