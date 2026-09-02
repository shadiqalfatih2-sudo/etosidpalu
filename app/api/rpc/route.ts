import { NextRequest, NextResponse } from 'next/server';
import { callEtosEdge } from '@/lib/etos-edge';

export const runtime = 'nodejs';

const ALLOWED_METHODS = new Set([
  'getPublicData',
  'getDetailBySlug',
  'submitArtikelUser',
  'getAdminData',
  'getAdminProgramPhotos',
  'saveAwardeeAdmin',
  'saveProgramPhotoAdmin',
  'saveBeritaAdmin',
  'saveArtikelReview',
  'updateArtikelStatus',
]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const fn = String(body?.fn || '');
    const args = Array.isArray(body?.args) ? body.args : [];

    if (!ALLOWED_METHODS.has(fn)) {
      return NextResponse.json({ error: `RPC ${fn || '(kosong)'} tidak didukung.` }, { status: 400 });
    }

    const token = req.headers.get('x-etos-admin-token') || '';
    const result = await callEtosEdge(req, fn, args, token);
    return NextResponse.json({ result: JSON.stringify(result) });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request gagal.';
    const status = Number((error as { status?: number })?.status) || 400;
    return NextResponse.json({ error: message }, { status });
  }
}
