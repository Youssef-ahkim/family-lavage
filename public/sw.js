// Minimal Service Worker to satisfy Progressive Web App (PWA) installability requirements.
// A fetch handler is required, even if it simply forwards requests to the network.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass-through fetch handler
  event.respondWith(
    fetch(event.request).catch(() => {
      // Fallback in case of absolute offline, but we just pass through to avoid cache side effects
      return new Response("Offline", { status: 503, statusText: "Offline" });
    })
  );
});
