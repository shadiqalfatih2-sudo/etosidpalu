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

    // Vercel enforces a smaller request-body cap before this handler runs.
    // Client compression targets 2.5 MiB binary / 3.4 MiB Base64.
    // Keep an additional hard limit below the hosting request limit.
    if (dataUrl.length > 3.9 * 1024 * 1024) {
      return NextResponse.json({ error: 'Foto terlalu besar untuk diunggah. Gunakan optimasi otomatis dan coba lagi.' }, { status: 413 });
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
