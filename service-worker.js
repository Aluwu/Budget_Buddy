const CACHE_NAME = "calm-budget-static-v2";
const ASSETS = ["/", "/index.html", "/styles.css", "/app.js", "/service-worker.js"]; 

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  if (event.data && event.data.type === "FORCE_REFRESH") {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) =>
        Promise.all(
          ASSETS.map((asset) =>
            fetch(new Request(asset, { cache: "reload" }))
              .then((response) => cache.put(asset, response.clone()))
              .catch(() => null)
          )
        )
      ).then(() => {
        if (event.source) {
          event.source.postMessage({ type: "CACHE_UPDATED" });
        }
      })
    );
  }
});
