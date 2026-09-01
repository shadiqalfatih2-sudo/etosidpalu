import { gunzipSync } from 'node:zlib';
import { NextRequest } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

function esc(value: unknown) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c] as string)); }
function strip(value: unknown) { return String(value||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim(); }
function driveImage(url:string){ const m=String(url||'').match(/(?:\/d\/|[?&]id=)([a-zA-Z0-9_-]{10,})/); return m?.[1]?`https://lh3.googleusercontent.com/d/${m[1]}=w2000`:url; }

export const runtime = 'nodejs';

const FRONTEND_REF = '250c2643563287a4da7c9a2d8c37ae5d1204a2a1';
const FRONTEND_BASE = `https://raw.githubusercontent.com/shadiqalfatih2-sudo/etosidpalu/${FRONTEND_REF}/public/packed`;
const PACKED_PARTS = [
  'part-01.txt','part-02a.txt','part-02b.txt','part-03.txt','part-04.txt','part-05.txt','part-06.txt',
] as const;

let frontendPromise: Promise<string> | null = null;

async function fetchPackedPart(name: string) {
  const response = await fetch(`${FRONTEND_BASE}/${name}`, { cache: 'force-cache' });
  if (!response.ok) throw new Error(`Frontend bundle ${name} gagal dimuat (${response.status}).`);
  return response.text();
}

async function loadFrontendHtml() {
  if (!frontendPromise) {
    frontendPromise = Promise.all(PACKED_PARTS.map(fetchPackedPart)).then((chunks) =>
      gunzipSync(Buffer.from(chunks.join('').replace(/\s+/g, ''), 'base64')).toString('utf8')
    ).catch((error) => {
      frontendPromise = null;
      throw error;
    });
  }
  return frontendPromise;
}

export async function GET(req: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  const params=await context.params; const parts=params.path||[];
  let html=await loadFrontendHtml();
  if(parts.length>=2 && (parts[0]==='berita'||parts[0]==='opini')) {
    const slug=decodeURIComponent(parts.slice(1).join('/')); const db=supabaseServer();
    const table=parts[0]==='berita'?'news':'articles'; const {data}=await db.from(table).select('*').eq('slug',slug).maybeSingle();
    if(data) {
      const title=data.title||'Etos ID Palu'; const desc=strip(data.content_html).slice(0,190); const img=driveImage(data.thumbnail_url||''); const canonical=`${req.nextUrl.origin}/${parts[0]}/${encodeURIComponent(slug)}`;
      const meta=`\n<meta name="description" content="${esc(desc)}">\n<link rel="canonical" href="${esc(canonical)}">\n<meta property="og:type" content="article">\n<meta property="og:site_name" content="Etos ID Palu">\n<meta property="og:title" content="${esc(title)}">\n<meta property="og:description" content="${esc(desc)}">\n<meta property="og:url" content="${esc(canonical)}">\n${img?`<meta property="og:image" content="${esc(img)}">`:''}\n<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:title" content="${esc(title)}">\n<meta name="twitter:description" content="${esc(desc)}">\n${img?`<meta name="twitter:image" content="${esc(img)}">`:''}`;
      html=html.replace('<title>Etos ID Palu - Portal Publikasi</title>',`<title>${esc(title)} | Etos ID Palu</title>${meta}`);
    }
  }
  return new Response(html,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'public, max-age=0, s-maxage=60, stale-while-revalidate=300','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin'}});
}
