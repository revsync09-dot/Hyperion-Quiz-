import { buildTimedLeaderboard } from '@/lib/leaderboard';
import { supabaseServer } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const authHeader = request.headers.get('authorization');
  
  // Basic protection for manual triggers, in production use a CRON_SECRET env
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const type = searchParams.get('type'); // 'weekly' or 'monthly'

  if (!['weekly', 'monthly'].includes(type || '')) {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }

  try {
    const table = type === 'weekly' ? 'leaderboard_weekly' : 'leaderboard_monthly';
    const days = type === 'weekly' ? 7 : 30;
    const rankedUsers = await buildTimedLeaderboard(days);

    // 1. Clear current temporary snapshot
    await supabaseServer.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // 3. Insert into snapshot table
    if (rankedUsers.length > 0) {
      const inserts = rankedUsers.slice(0, 100).map((user, i) => ({
        discord_id: user.discord_id,
        username: user.username,
        avatar: user.avatar,
        total_points: user.total_points,
        coins: user.coins,
        level: user.level,
        rank: i + 1,
        captured_at: new Date().toISOString()
      }));
      const { error: insertError } = await supabaseServer.from(table).insert(inserts);
      if (insertError) throw insertError;
    }

    return NextResponse.json({ success: true, count: rankedUsers.length });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
