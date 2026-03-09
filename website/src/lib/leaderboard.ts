import { supabaseServer } from '@/lib/supabase-server';
import { siteConfig } from '@/lib/siteConfig';

const PRIMARY_GUILD_ID = siteConfig.guildId;

type UserRow = {
  id: string;
  discord_id: string | null;
  username: string | null;
  avatar: string | null;
  coins: number | null;
  level: number | null;
  quiz_wins?: number | null;
  total_points?: number | null;
};

type QuizResultWithGame = {
  user_id: string | null;
  score: number | null;
  position: number | null;
  quiz_games: {
    ended_at: string | null;
    guild_id: string | null;
  } | Array<{
    ended_at: string | null;
    guild_id: string | null;
  }> | null;
};

export async function buildTimedLeaderboard(days: number) {
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (days - 1));

  const [usersResponse, resultsResponse] = await Promise.all([
    supabaseServer
      .from('users')
      .select('id, discord_id, username, avatar, coins, level, quiz_wins, total_points'),
    supabaseServer
      .from('quiz_results')
      .select('user_id, score, position, quiz_games!inner(ended_at, guild_id)')
      .eq('quiz_games.guild_id', PRIMARY_GUILD_ID)
      .gte('quiz_games.ended_at', since.toISOString())
  ]);

  if (usersResponse.error) throw usersResponse.error;
  if (resultsResponse.error) throw resultsResponse.error;

  const users = (usersResponse.data || []) as UserRow[];
  const results = (resultsResponse.data || []) as QuizResultWithGame[];
  const usersById = new Map(users.map((user) => [user.id, user]));
  const aggregate = new Map<string, { total_points: number; quiz_wins: number; games_played: number }>();

  for (const result of results) {
    if (!result.user_id || !usersById.has(result.user_id)) continue;
    const game = Array.isArray(result.quiz_games) ? result.quiz_games[0] : result.quiz_games;
    if (!game?.ended_at || game.guild_id !== PRIMARY_GUILD_ID) continue;

    const current = aggregate.get(result.user_id) || { total_points: 0, quiz_wins: 0, games_played: 0 };
    current.total_points += result.score || 0;
    current.games_played += 1;
    if (result.position === 1) {
      current.quiz_wins += 1;
    }
    aggregate.set(result.user_id, current);
  }

  return Array.from(aggregate.entries())
    .map(([userId, totals]) => {
      const user = usersById.get(userId);
      return {
        id: userId,
        discord_id: user?.discord_id || '',
        username: user?.username || 'Unknown',
        avatar: user?.avatar || null,
        coins: user?.coins || 0,
        level: user?.level || 1,
        total_points: totals.total_points,
        quiz_wins: totals.quiz_wins,
        games_played: totals.games_played
      };
    })
    .sort((left, right) => right.total_points - left.total_points);
}
