-- SQL script to create the new database tables for the "Hyperion" project.
-- Run this in your Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS users (
  id uuid primary key default gen_random_uuid(),
  discord_id text unique not null,
  username text,
  avatar text,
  coins integer default 0,
  level integer default 1,
  quiz_wins integer default 0,
  total_points integer default 0,
  correct_answers integer default 0,
  games_played integer default 0,
  last_daily timestamp with time zone,
  daily_streak integer default 0,
  created_at timestamp with time zone default now()
);

CREATE TABLE IF NOT EXISTS quiz_games (
  id uuid primary key default gen_random_uuid(),
  guild_id text not null,
  started_at timestamp with time zone default now(),
  ended_at timestamp with time zone,
  difficulty_rounds integer default 5
);

CREATE TABLE IF NOT EXISTS quiz_results (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid references quiz_games(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  score integer default 0,
  position integer
);

CREATE TABLE IF NOT EXISTS economy_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  type text not null,
  amount integer not null,
  created_at timestamp with time zone default now()
);

CREATE TABLE IF NOT EXISTS system_status (
  id text primary key,
  bot_status text default 'offline',
  last_heartbeat timestamp with time zone default now(),
  active_games integer default 0
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE economy_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_status ENABLE ROW LEVEL SECURITY;

-- Create policies safely
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all to Service Role' AND tablename = 'users') THEN
        CREATE POLICY "Allow all to Service Role" ON users FOR ALL USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all to Service Role' AND tablename = 'quiz_games') THEN
        CREATE POLICY "Allow all to Service Role" ON quiz_games FOR ALL USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all to Service Role' AND tablename = 'quiz_results') THEN
        CREATE POLICY "Allow all to Service Role" ON quiz_results FOR ALL USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all to Service Role' AND tablename = 'economy_logs') THEN
        CREATE POLICY "Allow all to Service Role" ON economy_logs FOR ALL USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all to Service Role' AND tablename = 'system_status') THEN
        CREATE POLICY "Allow all to Service Role" ON system_status FOR ALL USING (true);
    END IF;
END
$$;
