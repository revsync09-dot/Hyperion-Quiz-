# 🛑 Critical Database Setup Required

Your bot is currently seeing this error:
`Could not find the table 'public.users' in the schema cache`

This means the table hasn't been created in your Supabase project yet.

### 📋 Steps to Fix:

1.  Go to your **[Supabase Dashboard](https://supabase.com/dashboard)**.
2.  Open the **SQL Editor** in the left sidebar.
3.  Click **"New Query"** and paste the code below:

```sql
-- Create the users table for Hyperion Quiz
create table if not exists public.users (
  "userId" text primary key,
  "guildId" text,
  username text,
  coins bigint default 0,
  level int default 1,
  "quizWins" int default 0,
  "totalPoints" bigint default 0,
  "correctAnswers" int default 0,
  "gamesPlayed" int default 0,
  "dailyStreak" int default 0,
  "lastDaily" timestamp with time zone,
  "updatedAt" timestamp with time zone default now()
);

-- (Optional) If you have RLS enabled, run this too:
alter table public.users enable row level security;
create policy "Allow all access" on public.users for all using (true) with check (true);
```

4.  Click **"Run"**.

---

### 🛠️ Also Fixed in Code:

- **Colors Corrected**: Fixed the "Accent Color" validation errors.
- **Port Conflicts**: Addressed Next.js port locking issues.
- **Fast Registration**: All commands now use guild-specific registration for instant updates on your server.
