import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'total_points';
  const timeframe = searchParams.get('timeframe') || 'all';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 10;
  const skip = (page - 1) * limit;

  let tableName = 'users';
  if (timeframe === 'weekly') tableName = 'leaderboard_weekly';
  else if (timeframe === 'monthly') tableName = 'leaderboard_monthly';

  try {
    const { data: users, count, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact' })
      .order(timeframe === 'all' ? category : 'total_points', { ascending: false })
      .range(skip, skip + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      users,
      total: count,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
