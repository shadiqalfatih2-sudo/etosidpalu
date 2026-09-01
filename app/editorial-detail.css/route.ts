const SOURCE = 'https://raw.githubusercontent.com/shadiqalfatih2-sudo/etosidpalu/bbf116a71c422b5a7c7a5b3726a845dc0357a9a6/public/editorial-detail.css';

export const runtime = 'nodejs';

export async function GET() {
  const upstream = await fetch(SOURCE, { cache: 'force-cache' });
  if (!upstream.ok) return new Response('/* editorial css unavailable */', { status: 502 });
  return new Response(await upstream.text(), {
    headers: {
      'Content-Type': 'text/css; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
