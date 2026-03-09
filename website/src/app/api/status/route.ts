import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('system_status')
      .select('*')
      .eq('id', 'hyperion_bot')
      .single();

    if (error || !data) {
      return NextResponse.json({ status: 'offline', active_games: 0 });
    }

    // Check if heartbeat is within last 2 minutes
    const lastHeartbeat = new Date(data.last_heartbeat).getTime();
    const now = Date.now();
    const isOnline = (now - lastHeartbeat) < 120000;

    return NextResponse.json({
      status: isOnline ? 'online' : 'offline',
      active_games: data.active_games || 0,
      last_seen: data.last_heartbeat
    });
  } catch (err: any) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}
