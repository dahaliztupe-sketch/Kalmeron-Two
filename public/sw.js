/* Kalmeron service worker — Phase 9 (offline shell). */
const CACHE_VERSION = "kalmeron-shell-v1";
const SHELL_ASSETS = [
  "/",
  "/manifest.json",
  "/brand/kalmeron-mark.svg",
  "/logo.jpg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) =>
      cache.addAll(SHELL_ASSETS).catch(() => null)
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  // Only handle GET; never cache POSTs or auth/sse calls.
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // Skip Next.js HMR + APIs + Firebase + cross-origin streams.
  if (
    url.pathname.startsWith("/_next/webpack-hmr") ||
    url.pathname.startsWith("/api/") ||
    url.hostname.includes("firebaseio.com") ||
    url.hostname.includes("googleapis.com")
  ) {
    return;
  }

  // Stale-while-revalidate for static assets.
  if (
    url.origin === self.location.origin &&
    (url.pathname.startsWith("/_next/static") ||
      /\.(?:js|css|png|jpg|jpeg|svg|webp|woff2?)$/i.test(url.pathname))
  ) {
    event.respondWith(
      caches.open(CACHE_VERSION).then(async (cache) => {
        const cached = await cache.match(req);
        const fetchPromise = fetch(req)
          .then((res) => {
            if (res && res.status === 200) cache.put(req, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // Network-first for navigations, falling back to cached shell.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(req, copy)).catch(() => null);
          return res;
        })
        .catch(async () => {
          const cached = await caches.match(req);
          return cached || (await caches.match("/")) || Response.error();
        })
    );
  }
});
