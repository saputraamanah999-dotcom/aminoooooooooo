const AMINO_CACHE = "amino-resto-bali-v2";
const AMINO_ASSETS = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/app.js",
  "./js/enhancements.js",
  "./js/notifications.js",
  "./js/growth-suite.js",
  "./js/finance-suite.js",
  "./js/quality-suite.js",
  "./js/concierge-suite.js",
  "./js/delivery-suite.js",
  "./js/launch-suite.js",
  "./js/location-3d.js",
  "./js/portfolio-pages.js",
  "./js/ux-designer.js",
  "./js/pwa-offline.js",
  "./js/operations-pro.js",
  "./manifest.webmanifest",
  "./assets/restaurant-assets/icon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(AMINO_CACHE)
      .then((cache) => cache.addAll(AMINO_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== AMINO_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => {
          if (
            response &&
            response.status === 200 &&
            response.type === "basic"
          ) {
            const clone = response.clone();
            caches.open(AMINO_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => cached || caches.match("./index.html"));
      return cached || networkFetch;
    }),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "AMINO_SKIP_WAITING") self.skipWaiting();
  if (event.data?.type === "AMINO_CLEAR_CACHE") {
    event.waitUntil(caches.delete(AMINO_CACHE));
  }
});


self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  const url = data.url || "#/notifications";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const sameOriginClient = clients.find((client) => client.url.startsWith(self.location.origin));
      if (sameOriginClient) {
        sameOriginClient.postMessage({
          type: "AMINO_NOTIFICATION_CLICK",
          id: data.id,
          url,
        });
        sameOriginClient.focus();
        return sameOriginClient.navigate(url.startsWith("#") ? `${self.location.origin}/${url}` : url);
      }
      return self.clients.openWindow(url.startsWith("#") ? `${self.location.origin}/${url}` : url);
    }),
  );
});
