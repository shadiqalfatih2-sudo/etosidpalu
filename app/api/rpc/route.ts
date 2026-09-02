import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
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
  'saveProgramAdmin',
  'saveHeroAdmin',
  'updateArtikelStatus',
]);

const PUBLIC_WRITE_METHODS = new Set([
  'saveAwardeeAdmin',
  'saveProgramPhotoAdmin',
  'saveBeritaAdmin',
  'saveArtikelReview',
  'saveProgramAdmin',
  'saveHeroAdmin',
  'updateArtikelStatus',
]);

function invalidatePublicCache(fn: string) {
  if (!PUBLIC_WRITE_METHODS.has(fn)) return;

  revalidateTag('public-home', 'max');
  revalidatePath('/', 'page');

  if (fn === 'saveProgramAdmin' || fn === 'saveProgramPhotoAdmin') {
    revalidateTag('public-programs', 'max');
    revalidatePath('/program', 'page');
  }

  if (fn === 'saveAwardeeAdmin') {
    revalidateTag('public-awardees', 'max');
    revalidatePath('/awardee', 'page');
  }
}

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
    invalidatePublicCache(fn);
    return NextResponse.json({ result: JSON.stringify(result) });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request gagal.';
    const status = Number((error as { status?: number })?.status) || 400;
    return NextResponse.json({ error: message }, { status });
  }
}
