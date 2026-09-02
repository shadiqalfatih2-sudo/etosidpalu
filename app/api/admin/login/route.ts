import { NextRequest, NextResponse } from 'next/server';
import { callEtosEdge } from '@/lib/etos-edge';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const args = Array.isArray(body?.args) ? body.args : [];
    const result = await callEtosEdge(req, 'loginAdmin', args);
    return NextResponse.json({ result: JSON.stringify(result || { status: 'error', message: 'Login gagal.' }) });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login gagal.';
    const status = Number((error as { status?: number })?.status) || 400;
    return NextResponse.json({ error: message }, { status });
  }
}
