import { supabaseServer } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // id is Discord ID

  try {
    // 1. Fetch User by discord_id
    const { data: user, error: userErr } = await supabaseServer
      .from('users')
      .select('*')
      .eq('discord_id', id)
      .single();

    if (userErr || !user) {
      return NextResponse.json({ error: 'Player not identified in Hyperion database' }, { status: 404 });
    }

    // 2. Calculate Rank
    const { count: rankCount, error: rankErr } = await supabaseServer
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gt('total_points', user.total_points || 0);

    if (rankErr) {
      throw rankErr;
    }

    const rank = (rankCount || 0) + 1;

    // 3. Dynamic History
    const { data: history, error: historyErr } = await supabaseServer
      .from('quiz_results')
      .select('*, quiz_games(started_at)')
      .eq('user_id', user.id)
      .order('id', { ascending: false })
      .limit(10);

    if (historyErr) {
      throw historyErr;
    }

    return NextResponse.json({
      success: true,
      player: { ...user, rank },
      history: history || []
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
