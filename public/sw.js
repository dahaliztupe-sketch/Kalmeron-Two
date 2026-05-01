/* Kalmeron service worker v3
 * - Offline shell with stale-while-revalidate for static assets
 * - Network-first for navigations
 * - Push notification support
 * - Background sync for queued chat messages
 */

const CACHE_VERSION = "kalmeron-shell-v3";
const OFFLINE_URL = "/offline";
const SHELL_ASSETS = [
  "/",
  OFFLINE_URL,
  "/manifest.json",
  "/brand/kalmeron-mark.svg",
];

// ─── Install ───────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(SHELL_ASSETS).catch(() => null))
  );
  self.skipWaiting();
});

// ─── Activate ──────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_VERSION)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ─── Fetch ─────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  const host = url.hostname;

  // Never intercept HMR, API calls, or external services
  const isFirebase = host === "firebaseio.com" || host.endsWith(".firebaseio.com");
  const isGoogle = host === "googleapis.com" || host.endsWith(".googleapis.com");
  const isGemini = host.includes("generativelanguage.googleapis.com");

  if (
    url.pathname.startsWith("/_next/webpack-hmr") ||
    url.pathname.startsWith("/api/") ||
    isFirebase || isGoogle || isGemini
  ) {
    return;
  }

  // Stale-while-revalidate for static assets
  if (
    url.origin === self.location.origin &&
    (url.pathname.startsWith("/_next/static") ||
      url.pathname.startsWith("/icons/") ||
      url.pathname.startsWith("/brand/") ||
      url.pathname.startsWith("/textures/") ||
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

  // Network-first for page navigations
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches
            .open(CACHE_VERSION)
            .then((c) => c.put(req, copy))
            .catch(() => null);
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

// ─── Push Notifications ────────────────────────────────────────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload = { title: "كلميرون", body: "لديك إشعار جديد", url: "/notifications" };
  try {
    payload = { ...payload, ...event.data.json() };
  } catch {
    payload.body = event.data.text();
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-192x192.png",
      dir: "rtl",
      lang: "ar",
      data: { url: payload.url || "/notifications" },
      actions: [
        { action: "open", title: "افتح" },
        { action: "dismiss", title: "تجاهل" },
      ],
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "dismiss") return;

  const url = event.notification.data?.url || "/notifications";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        const existing = clients.find((c) => c.url.includes(url));
        if (existing) return existing.focus();
        return self.clients.openWindow(url);
      })
  );
});
