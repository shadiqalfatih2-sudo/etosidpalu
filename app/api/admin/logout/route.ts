import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const token = req.headers.get('x-etos-admin-token') || '';
  try {
    if (token) {
      const db = supabaseServer();
      const { error } = await db.rpc('etos_close_admin_session', { p_token: token });
      if (error) throw error;
    }
    return NextResponse.json({ result: JSON.stringify({ status: 'success' }) });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Logout gagal.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
