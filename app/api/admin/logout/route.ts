import { NextRequest, NextResponse } from 'next/server';
import { callEtosEdge } from '@/lib/etos-edge';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('x-etos-admin-token') || '';
    const result = await callEtosEdge(req, 'logoutAdmin', [], token);
    return NextResponse.json({ result: JSON.stringify(result || { status: 'success' }) });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Logout gagal.';
    const status = Number((error as { status?: number })?.status) || 400;
    return NextResponse.json({ error: message }, { status });
  }
}
