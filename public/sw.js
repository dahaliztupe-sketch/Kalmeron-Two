/* Kalmeron service worker — Phase 9 (offline shell). v2 adds an explicit
 * /offline route as the navigation fallback so the cached shell still
 * functions when the user is fully offline. */
const CACHE_VERSION = "kalmeron-shell-v2";
const OFFLINE_URL = "/offline";
const SHELL_ASSETS = [
  "/",
  OFFLINE_URL,
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
  // Use suffix matching instead of substring includes() to avoid bypasses
  // such as `evilfirebaseio.com.attacker.example`.
  const host = url.hostname;
  const isFirebaseHost =
    host === "firebaseio.com" || host.endsWith(".firebaseio.com");
  const isGoogleApisHost =
    host === "googleapis.com" || host.endsWith(".googleapis.com");
  if (
    url.pathname.startsWith("/_next/webpack-hmr") ||
    url.pathname.startsWith("/api/") ||
    isFirebaseHost ||
    isGoogleApisHost
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

  // Network-first for navigations, falling back to the cached shell or
  // — as a last resort — the dedicated /offline page.
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
          return (
            cached ||
            (await caches.match(OFFLINE_URL)) ||
            (await caches.match("/")) ||
            Response.error()
          );
        })
    );
  }
});
