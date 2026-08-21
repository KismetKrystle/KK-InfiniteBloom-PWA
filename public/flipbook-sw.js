// Offline cache for purchased readers only. Registered (see FlipbookPage.tsx)
// with scope "/flipbook-content/", so it can never intercept anything
// outside the book reader itself.
//
// The server (src/app/flipbook-content/[bookSlug]/[...path]/route.ts) is the
// single source of truth for entitlement: purchased responses carry a long
// Cache-Control, everything served to a free preview / anonymous visitor
// carries "no-store". This worker just respects that header rather than
// re-deriving purchase state itself — anything marked no-store is never
// written to the offline cache, so a preview visitor's access still can't
// outlive its window.

const CACHE_NAME = "flipbook-offline-v1";
const CONTENT_PREFIX = "/flipbook-content/";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("flipbook-offline-") && key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || !url.pathname.startsWith(CONTENT_PREFIX)) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const cacheControl = response.headers.get("Cache-Control") || "";
        if (response.ok && !cacheControl.includes("no-store")) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || Promise.reject(new Error("offline, not cached"))))
  );
});
