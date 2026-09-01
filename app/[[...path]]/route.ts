import { gunzipSync } from 'node:zlib';
import { NextRequest } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

function esc(value: unknown) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c] as string));
}

function strip(value: unknown) {
  return String(value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function driveImage(url: string) {
  const m = String(url || '').match(/(?:\/d\/|[?&]id=)([a-zA-Z0-9_-]{10,})/);
  return m?.[1] ? `https://lh3.googleusercontent.com/d/${m[1]}=w2000` : url;
}

function displayDate(value: unknown) {
  if (!value) return '';
  try {
    return new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Makassar',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(new Date(String(value))).replace(',', '');
  } catch {
    return String(value);
  }
}

function safeJson(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}

export const runtime = 'nodejs';

const FRONTEND_REF = '250c2643563287a4da7c9a2d8c37ae5d1204a2a1';
const FRONTEND_BASE = `https://raw.githubusercontent.com/shadiqalfatih2-sudo/etosidpalu/${FRONTEND_REF}/public/packed`;
const ASSET_REF = 'bbf116a71c422b5a7c7a5b3726a845dc0357a9a6';
const ASSET_BASE = `https://raw.githubusercontent.com/shadiqalfatih2-sudo/etosidpalu/${ASSET_REF}/public`;
const PACKED_PARTS = [
  'part-01.txt', 'part-02a.txt', 'part-02b.txt', 'part-03.txt', 'part-04.txt', 'part-05.txt', 'part-06.txt',
] as const;
const COMPAT_VERSION = '20260902-detailfix-2';
const EDITORIAL_VERSION = '20260902-editorial-1';

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

function injectMigrationRuntime(html: string) {
  const cleanup = `<script>(function(){try{if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(function(rs){rs.forEach(function(r){r.unregister().catch(function(){});});}).catch(function(){});}}catch(e){}try{if('caches' in window){caches.keys().then(function(keys){keys.forEach(function(k){caches.delete(k).catch(function(){});});}).catch(function(){});}}catch(e){}})();</script>`;
  const editorialCss = `<link rel="stylesheet" href="${ASSET_BASE}/editorial-detail.css?v=${EDITORIAL_VERSION}">`;
  html = html.replace('</head>', `${cleanup}${editorialCss}</head>`);

  const compatTag = `<script src="${ASSET_BASE}/compat.js?v=${COMPAT_VERSION}"></script>`;
  const compatPattern = /<script\s+[^>]*src=["']\/compat\.js(?:\?[^"']*)?["'][^>]*><\/script>/i;
  if (compatPattern.test(html)) html = html.replace(compatPattern, compatTag);
  else html = html.replace('</body>', `${compatTag}</body>`);

  const editorialScript = `<script src="${ASSET_BASE}/editorial-detail.js?v=${EDITORIAL_VERSION}"></script>`;
  html = html.replace('</body>', `${editorialScript}</body>`);
  return html;
}

const CLEANUP_SW = `self.addEventListener('install',function(){self.skipWaiting();});self.addEventListener('activate',function(e){e.waitUntil((async function(){try{var keys=await caches.keys();await Promise.all(keys.map(function(k){return caches.delete(k);}));}catch(_){}try{await self.registration.unregister();}catch(_){}try{var cs=await self.clients.matchAll({type:'window',includeUncontrolled:true});cs.forEach(function(c){c.navigate(c.url);});}catch(_){}})());});self.addEventListener('fetch',function(){});`;

export async function GET(req: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  const params = await context.params;
  const parts = params.path || [];

  if (parts.length === 1 && parts[0] === 'sw.js') {
    return new Response(CLEANUP_SW, {
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Service-Worker-Allowed': '/',
      },
    });
  }

  let html = injectMigrationRuntime(await loadFrontendHtml());

  if (parts.length >= 2 && (parts[0] === 'berita' || parts[0] === 'opini')) {
    const slug = decodeURIComponent(parts.slice(1).join('/'));
    const db = supabaseServer();
    const table = parts[0] === 'berita' ? 'news' : 'articles';
    const { data } = await db.from(table).select('*').eq('slug', slug).maybeSingle();

    if (data) {
      const jenis = parts[0] === 'berita' ? 'Berita' : 'Opini';
      const title = data.title || 'Etos ID Palu';
      const desc = strip(data.content_html).slice(0, 190);
      const img = driveImage(data.thumbnail_url || '');
      const canonical = `${req.nextUrl.origin}/${parts[0]}/${encodeURIComponent(slug)}`;
      const detail = {
        id: data.id,
        slug,
        jenis,
        tanggal: displayDate(data.published_at || data.created_at),
        judul: title,
        isi: data.content_html || '',
        excerpt: desc,
        thumb: img,
        thumbPosition: data.thumbnail_position || '50% 50%',
        penulis: parts[0] === 'berita' ? 'Admin Etos ID' : (data.author_name || 'Etos ID Palu'),
        aktivitas: parts[0] === 'berita' ? '' : (data.activity || ''),
        url: canonical,
        path: `/${parts[0]}/${encodeURIComponent(slug)}`,
      };

      const { data: relatedRows } = await db
        .from(table)
        .select('*')
        .neq('slug', slug)
        .order('published_at', { ascending: false })
        .limit(6);

      const related = (relatedRows || []).map((row: any) => ({
        id: row.id,
        slug: row.slug,
        jenis,
        tanggal: displayDate(row.published_at || row.created_at),
        judul: row.title || '',
        excerpt: strip(row.content_html).slice(0, 140),
        thumb: driveImage(row.thumbnail_url || ''),
        thumbPosition: row.thumbnail_position || '50% 50%',
        penulis: parts[0] === 'berita' ? 'Admin Etos ID' : (row.author_name || 'Etos ID Palu'),
        aktivitas: parts[0] === 'berita' ? '' : (row.activity || ''),
        path: `/${parts[0]}/${encodeURIComponent(String(row.slug || ''))}`,
      }));

      const meta = `\n<meta name="description" content="${esc(desc)}">\n<link rel="canonical" href="${esc(canonical)}">\n<meta property="og:type" content="article">\n<meta property="og:site_name" content="Etos ID Palu">\n<meta property="og:title" content="${esc(title)}">\n<meta property="og:description" content="${esc(desc)}">\n<meta property="og:url" content="${esc(canonical)}">\n${img ? `<meta property="og:image" content="${esc(img)}">` : ''}\n<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:title" content="${esc(title)}">\n<meta name="twitter:description" content="${esc(desc)}">\n${img ? `<meta name="twitter:image" content="${esc(img)}">` : ''}`;
      const detailBootstrap = `<script>window.__ETOS_PUBLICATION_DETAIL__=${safeJson(detail)};window.__ETOS_RELATED_PUBLICATIONS__=${safeJson(related)};</script>`;

      html = html.replace(
        '<title>Etos ID Palu - Portal Publikasi</title>',
        `<title>${esc(title)} | Etos ID Palu</title>${meta}${detailBootstrap}`
      );
    }
  }

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=0, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  });
}
