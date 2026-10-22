// Caches the app shell so the interface opens with no connection after the first visit.
const CACHE = "stemmate-shell-v3";
const SHELL = ["./", "index.html", "css/style.css", "js/app.bundle.js"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).catch(() => caches.match("index.html"))));
});
