import { NextRequest, NextResponse } from 'next/server';
import { callEtosEdge } from '@/lib/etos-edge';
import { supabaseServer } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const db = supabaseServer();
  const { error: databaseError } = await db.from('hero_slides').select('id', { head: true, count: 'exact' });

  let gatewayError: string | null = null;
  let gatewayOk = false;
  try {
    const hero = await callEtosEdge(req, 'getPublicData', ['hero']);
    gatewayOk = Array.isArray(hero);
  } catch (error) {
    gatewayError = error instanceof Error ? error.message : 'Gateway check gagal.';
  }

  const ok = !databaseError && gatewayOk;
  return NextResponse.json({
    ok,
    runtime: 'vercel',
    database: !databaseError ? 'supabase:ok' : 'supabase:error',
    gateway: gatewayOk ? 'etos-rpc:ok' : 'etos-rpc:error',
    error: databaseError?.message || gatewayError,
  }, { status: ok ? 200 : 503 });
}
