const SOURCE = 'https://raw.githubusercontent.com/shadiqalfatih2-sudo/etosidpalu/d58ba1f233e6bb3c35a3035a8ef9dac5fa28ee99/public/editorial-detail.css';

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
