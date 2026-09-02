import { createHash } from 'node:crypto';
import type { NextRequest } from 'next/server';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from './supabase';

export function etosClientKey(req: NextRequest) {
  const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '';
  const ip = forwarded || req.headers.get('x-real-ip') || 'unknown';
  const ua = req.headers.get('user-agent') || 'unknown';
  return createHash('sha256').update(`${ip}|${ua}`).digest('hex');
}

export async function callEtosEdge(
  req: NextRequest,
  method: string,
  args: unknown[] = [],
  token = '',
) {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/etos-rpc`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_PUBLISHABLE_KEY,
      'X-Etos-Client-Key': etosClientKey(req),
      ...(token ? { 'X-Etos-Session': token } : {}),
    },
    body: JSON.stringify({ method, args }),
    cache: 'no-store',
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.ok) {
    const error = new Error(payload?.error || `Etos gateway gagal (${response.status}).`);
    Object.assign(error, { status: response.status || 500 });
    throw error;
  }
  return payload.result;
}
