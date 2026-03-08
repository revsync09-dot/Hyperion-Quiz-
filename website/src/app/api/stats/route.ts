import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

const PRIMARY_GUILD_ID = '1422969507734884374';

export async function GET() {
  try {
    // 1. Fetch Aggregates
    const { data: users, error: userErr } = await supabase
      .from('users')
      .select('total_points, quiz_wins, games_played, coins, correct_answers');

    if (userErr) throw userErr;

    let totalPoints = 0, totalWins = 0, totalGames = 0, totalCoins = 0, correct = 0;
    users.forEach((u: any) => {
      totalPoints += (u.total_points || 0);
      totalWins += (u.quiz_wins || 0);
      totalGames += (u.games_played || 0);
      totalCoins += (u.coins || 0);
      correct += (u.correct_answers || 0);
    });

    // 2. Exact Games Count
    const { count: realGamesCount, error: gamesErr } = await supabase
      .from('quiz_games')
      .select('*', { count: 'exact', head: true })
      .eq('guild_id', PRIMARY_GUILD_ID);

    return NextResponse.json({
      stats: {
        totalPlayers: users.length,
        totalGamesPlayed: realGamesCount || totalGames,
        totalCoins: totalCoins,
        totalPoints: totalPoints,
        globalAccuracy: totalGames > 0 ? ((correct / (totalGames * 5)) * 100).toFixed(1) : 0,
        activeServers: 1
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
