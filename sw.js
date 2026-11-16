/* Service Worker - Café Alba
   Sube VERSION cada vez que cambies archivos del sitio para que los
   visitantes reciban la versión nueva. */
const VERSION = 'v1';
const CACHE_STATIC = `cafe-alba-static-${VERSION}`;
const CACHE_RUNTIME = `cafe-alba-runtime-${VERSION}`;

// Archivos esenciales que se guardan al instalar (funcionan sin conexión)
const PRECACHE = [
  './',
  'index.html',
  'menu.html',
  'nosotros.html',
  'contacto.html',
  'offline.html',
  'style.css',
  'script.js',
  'pwa.js',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/maskable-512.png',
  'icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k.startsWith('cafe-alba-') && k !== CACHE_STATIC && k !== CACHE_RUNTIME)
            .map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Páginas: red primero (siempre lo más nuevo), si no hay internet usa la copia guardada
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(CACHE_STATIC);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request, { ignoreSearch: true });
    return cached || (await caches.match('offline.html'));
  }
}

// CSS, JS, imágenes y fuentes: responde rápido con lo guardado y actualiza en segundo plano
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_RUNTIME);
  const cached = await cache.match(request, { ignoreSearch: true }) || await caches.match(request, { ignoreSearch: true });
  const network = fetch(request)
    .then((response) => {
      // status 0 = respuesta opaca (p. ej. Google Fonts), también se puede guardar
      if (response && (response.ok || response.status === 0)) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);
  return cached || (await network) || Response.error();
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const mismoOrigen = url.origin === self.location.origin;
  const fuentes = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
  } else if (mismoOrigen || fuentes) {
    event.respondWith(staleWhileRevalidate(request));
  }
});
