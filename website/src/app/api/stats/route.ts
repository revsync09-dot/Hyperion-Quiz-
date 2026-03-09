import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

const PRIMARY_GUILD_ID = '1422969507734884374';
const DAYS = 14;

type UserRow = {
  total_points: number | null;
  quiz_wins: number | null;
  games_played: number | null;
  coins: number | null;
  correct_answers: number | null;
};

type QuizGameRow = {
  id: string;
  ended_at: string | null;
};

type EconomyLogRow = {
  created_at: string | null;
  amount: number | null;
};

type QuizResultRow = {
  user_id: string | null;
  quiz_games: Array<{ ended_at: string | null }> | null;
};

function dayKeyFromDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function buildDaySeries() {
  const today = new Date();
  const days: Array<{ key: string; label: string }> = [];

  for (let offset = DAYS - 1; offset >= 0; offset -= 1) {
    const current = new Date(today);
    current.setHours(0, 0, 0, 0);
    current.setDate(current.getDate() - offset);
    days.push({
      key: dayKeyFromDate(current),
      label: current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    });
  }

  return days;
}

export async function GET() {
  try {
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    since.setDate(since.getDate() - (DAYS - 1));
    const sinceIso = since.toISOString();

    const [usersResponse, gamesResponse, economyResponse, resultsResponse] = await Promise.all([
      supabase.from('users').select('total_points, quiz_wins, games_played, coins, correct_answers'),
      supabase
        .from('quiz_games')
        .select('id, ended_at')
        .eq('guild_id', PRIMARY_GUILD_ID)
        .gte('ended_at', sinceIso)
        .order('ended_at', { ascending: true }),
      supabase
        .from('economy_logs')
        .select('created_at, amount')
        .gte('created_at', sinceIso)
        .order('created_at', { ascending: true }),
      supabase
        .from('quiz_results')
        .select('user_id, quiz_games(ended_at)')
        .gte('quiz_games.ended_at', sinceIso)
        .order('id', { ascending: true }),
    ]);

    if (usersResponse.error) throw usersResponse.error;
    if (gamesResponse.error) throw gamesResponse.error;
    if (economyResponse.error) throw economyResponse.error;
    if (resultsResponse.error) throw resultsResponse.error;

    const users = (usersResponse.data || []) as UserRow[];
    const quizGames = (gamesResponse.data || []) as QuizGameRow[];
    const economyLogs = (economyResponse.data || []) as EconomyLogRow[];
    const quizResults = (resultsResponse.data || []) as QuizResultRow[];

    let totalPoints = 0;
    let totalWins = 0;
    let totalGames = 0;
    let totalCoins = 0;
    let totalCorrectAnswers = 0;

    users.forEach((user) => {
      totalPoints += user.total_points || 0;
      totalWins += user.quiz_wins || 0;
      totalGames += user.games_played || 0;
      totalCoins += user.coins || 0;
      totalCorrectAnswers += user.correct_answers || 0;
    });

    const days = buildDaySeries();
    const gamesByDay = new Map(days.map((day) => [day.key, 0]));
    const coinsByDay = new Map(days.map((day) => [day.key, 0]));
    const activePlayersByDay = new Map(days.map((day) => [day.key, new Set<string>()]));

    quizGames.forEach((game) => {
      if (!game.ended_at) return;
      const key = game.ended_at.slice(0, 10);
      if (gamesByDay.has(key)) {
        gamesByDay.set(key, (gamesByDay.get(key) || 0) + 1);
      }
    });

    economyLogs.forEach((entry) => {
      if (!entry.created_at) return;
      const key = entry.created_at.slice(0, 10);
      if (coinsByDay.has(key)) {
        coinsByDay.set(key, (coinsByDay.get(key) || 0) + (entry.amount || 0));
      }
    });

    quizResults.forEach((result) => {
      const endedAt = result.quiz_games?.[0]?.ended_at;
      if (!endedAt || !result.user_id) return;
      const key = endedAt.slice(0, 10);
      if (activePlayersByDay.has(key)) {
        activePlayersByDay.get(key)?.add(result.user_id);
      }
    });

    const gamesPerDay = days.map((day) => ({
      day: day.label,
      games: gamesByDay.get(day.key) || 0,
    }));

    const coinsEarnedDaily = days.map((day) => ({
      day: day.label,
      coins: coinsByDay.get(day.key) || 0,
    }));

    const activePlayersDaily = days.map((day) => ({
      day: day.label,
      players: activePlayersByDay.get(day.key)?.size || 0,
    }));

    return NextResponse.json({
      stats: {
        totalUsers: users.length,
        totalGamesPlayed: totalGames,
        totalCoins,
        totalPoints,
        totalQuizWins: totalWins,
        totalCorrectAnswers,
        globalAccuracy: totalGames > 0 ? ((totalCorrectAnswers / (totalGames * 5)) * 100).toFixed(1) : 0,
        activeServers: 1,
        gamesPerDay,
        coinsEarnedDaily,
        activePlayersDaily,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
