/* Etos ID Palu migration cleanup service worker.
 * Replaces any service worker left by the previous project on etosidpalu.com,
 * clears legacy Cache Storage, then unregisters itself.
 */
self.addEventListener('install', function () {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil((async function () {
    try {
      var keys = await caches.keys();
      await Promise.all(keys.map(function (key) { return caches.delete(key); }));
    } catch (e) {}

    try {
      await self.registration.unregister();
    } catch (e) {}

    try {
      var clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      clients.forEach(function (client) {
        try { client.postMessage({ type: 'ETOS_LEGACY_CACHE_CLEARED' }); } catch (e) {}
      });
    } catch (e) {}
  })());
});
