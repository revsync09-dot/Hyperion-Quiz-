import { supabase } from '@/lib/supabase';
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

    // 1. Clear current temporary snapshot
    await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // 2. Fetch top users based on points (you could also do this via a DB function/RPC for better performance)
    const { data: topUsers, error: fetchError } = await supabase
      .from('users')
      .select('discord_id, username, avatar, total_points, coins, level')
      .order('total_points', { ascending: false })
      .limit(100);

    if (fetchError) throw fetchError;

    // 3. Insert into snapshot table
    if (topUsers && topUsers.length > 0) {
      const inserts = topUsers.map((u, i) => ({
        ...u,
        rank: i + 1,
        captured_at: new Date().toISOString()
      }));
      const { error: insertError } = await supabase.from(table).insert(inserts);
      if (insertError) throw insertError;
    }

    return NextResponse.json({ success: true, count: topUsers?.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
