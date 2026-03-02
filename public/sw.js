// Minimal, safe service worker used only to
// immediately take control and then let all
// requests go to the network as usual.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

