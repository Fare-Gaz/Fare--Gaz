// Service worker : garde l'application en cache pour qu'elle s'ouvre vite,
// même avec une connexion faible. La carte, elle, a besoin d'Internet.
const CACHE = "fare-gaz-v8";
const FICHIERS = [
  "./", "index.html", "style.css", "app.js", "config.js", "langues.js", "lib/qrcode.js", "manifest.json",
  "icons/icon.svg", "icons/icon-192.png", "icons/icon-512.png",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(cles => Promise.all(cles.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  // Tuiles de carte : toujours depuis le réseau
  if (url.hostname.endsWith("tile.openstreetmap.org")) return;
  // Le reste : réseau d'abord, cache en secours
  e.respondWith(
    fetch(e.request)
      .then(rep => {
        const copie = rep.clone();
        caches.open(CACHE).then(c => c.put(e.request, copie));
        return rep;
      })
      .catch(() => caches.match(e.request))
  );
});
