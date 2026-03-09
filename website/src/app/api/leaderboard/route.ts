import { buildTimedLeaderboard } from '@/lib/leaderboard';
import { supabaseServer } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'total_points';
  const timeframe = searchParams.get('timeframe') || 'all';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 10;
  const skip = (page - 1) * limit;

  try {
    if (timeframe === 'weekly' || timeframe === 'monthly') {
      const days = timeframe === 'weekly' ? 7 : 30;
      const rankedUsers = await buildTimedLeaderboard(days);
      const users = rankedUsers.slice(skip, skip + limit);

      return NextResponse.json({
        users,
        total: rankedUsers.length,
        totalPages: Math.ceil(rankedUsers.length / limit),
      });
    }

    const { data: users, count, error } = await supabaseServer
      .from('users')
      .select('*', { count: 'exact' })
      .order(category, { ascending: false })
      .range(skip, skip + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      users,
      total: count,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
