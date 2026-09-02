const CLEANUP_SW = `self.addEventListener('install',function(){self.skipWaiting();});self.addEventListener('activate',function(e){e.waitUntil((async function(){try{var keys=await caches.keys();await Promise.all(keys.map(function(k){return caches.delete(k);}));}catch(_){}try{await self.registration.unregister();}catch(_){}try{var cs=await self.clients.matchAll({type:'window',includeUncontrolled:true});cs.forEach(function(c){c.navigate(c.url);});}catch(_){}})());});self.addEventListener('fetch',function(){});`;

export const dynamic = 'force-dynamic';

export async function GET() {
  return new Response(CLEANUP_SW, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Service-Worker-Allowed': '/',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
