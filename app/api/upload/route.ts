import { createHash } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { SUPABASE_URL } from '../../../lib/supabase';

export const runtime = 'nodejs';

function clientKey(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for') || '';
  const ip = forwarded.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
  const ua = request.headers.get('user-agent') || 'unknown';
  return createHash('sha256').update(`${ip}|${ua}`).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const args = Array.isArray(body?.args) ? body.args : [];
    const dataUrl = String(args[0] || body?.dataUrl || '');
    const fileName = String(args[1] || body?.fileName || 'image');
    const adminToken = request.headers.get('x-etos-admin-token') || '';

    if (!dataUrl.startsWith('data:image/')) {
      return NextResponse.json({ error: 'File harus berupa gambar.' }, { status: 400 });
    }

    // Reject obviously oversized payloads before forwarding to the Edge Function.
    // Base64 is ~4/3 of binary size; 14 MB safely covers the 10 MB storage limit.
    if (dataUrl.length > 14 * 1024 * 1024) {
      return NextResponse.json({ error: 'Ukuran gambar maksimal 10 MB.' }, { status: 413 });
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/etos-media-upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dataUrl,
        fileName,
        adminToken,
        clientKey: clientKey(request),
      }),
      cache: 'no-store',
    });

    const result = await response.json().catch(() => null);
    if (!response.ok || !result || result.status !== 'success') {
      const message = result?.message || 'Upload gambar gagal.';
      return NextResponse.json({ error: message }, { status: response.status || 500 });
    }

    // Preserve the Apps Script contract expected by the existing frontend.
    return NextResponse.json({
      result: JSON.stringify({
        status: 'success',
        url: result.url,
        fileId: result.fileId || '',
      }),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload gambar gagal.' },
      { status: 500 },
    );
  }
}
