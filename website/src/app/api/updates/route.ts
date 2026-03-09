import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

function buildUpdateSignature(update: {
  version?: string;
  title?: string;
  category?: string;
  content?: string;
  is_major?: boolean;
}) {
  return [
    String(update.version || '').trim(),
    String(update.title || '').trim(),
    String(update.category || '').trim(),
    String(update.content || '').trim(),
    update.is_major ? '1' : '0',
  ].join('|');
}

export async function GET() {
  try {
    const { data: updates, error } = await supabase
      .from('system_updates')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    const seen = new Set<string>();
    const dedupedUpdates = (updates || []).filter((update) => {
      const signature = buildUpdateSignature(update);
      if (seen.has(signature)) return false;
      seen.add(signature);
      return true;
    });

    return NextResponse.json({
      success: true,
      updates: dedupedUpdates
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
