import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { supabaseServer } from '@/lib/supabase';

export const runtime = 'nodejs';

function clientKey(req: NextRequest) {
  const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '';
  const raw = forwarded || req.headers.get('x-real-ip') || req.headers.get('user-agent') || 'unknown';
  return createHash('sha256').update(raw).digest('hex').slice(0, 48);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const args = Array.isArray(body?.args) ? body.args : [];
    const db = supabaseServer();
    const { data, error } = await db.rpc('etos_open_admin_session', {
      p_username: String(args[0] || ''),
      p_password: String(args[1] || ''),
      p_client_key: clientKey(req),
    });
    if (error) throw error;
    return NextResponse.json({ result: JSON.stringify(data || { status: 'error', message: 'Login gagal.' }) });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login gagal.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
