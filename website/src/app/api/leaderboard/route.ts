import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'total_points';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 10;
  const skip = (page - 1) * limit;

  try {
    const { data: users, count, error } = await supabase
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
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
