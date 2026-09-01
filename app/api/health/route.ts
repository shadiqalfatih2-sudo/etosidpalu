import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function GET() {
  const db = supabaseServer();
  const { error } = await db.from('hero_slides').select('id', { head: true, count: 'exact' });
  return NextResponse.json({ ok: !error, runtime: 'vercel', database: 'supabase', error: error?.message || null });
}
