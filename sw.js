// IMPORTANTE: Cambia la versión del caché cada vez que quieras forzar una actualización de contenido.
// Por ejemplo, de 'v2' a 'v3', luego a 'v4', etc.
const CACHE_NAME = 'cuasi-coromoto-cache-v0.02';

const BASE_URL = '/cuasicoromoto';

// Lista de archivos que queremos que se guarden en caché durante la instalación.
const urlsToCache = [
  `${BASE_URL}/`, 
  `${BASE_URL}/style.css`,
  `${BASE_URL}/index.html`,
  `${BASE_URL}/manifest.json`,
  `${BASE_URL}/sw.js`,
  `${BASE_URL}/favicon.svg`,
  `${BASE_URL}/iconos/icon-192x192.png`,
  `${BASE_URL}/iconos/icon-512x512.png`,
  `${BASE_URL}/fonts/Lora-Bold.ttf`,
  `${BASE_URL}/fonts/Montserrat-Light.ttf`,
  `${BASE_URL}/fonts/Montserrat-Regular.ttf`,
  `${BASE_URL}/fonts/Montserrat-Medium.ttf`,
  `${BASE_URL}/fonts/Montserrat-Bold.ttf`
];

// 1. Evento 'install': Se instala el Service Worker y se guardan los archivos base.
self.addEventListener('install', event => {
  console.log('Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Cache abierto, añadiendo archivos principales.');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Activa el nuevo SW inmediatamente
      .catch(error => console.error('Service Worker: Falló el cacheo en la instalación:', error))
  );
});

// 2. Evento 'activate': El nuevo Service Worker se activa.
self.addEventListener('activate', event => {
  console.log('Service Worker: Activado');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Limpiando caché antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
        console.log('Service Worker: Reclamando clientes...');
        return self.clients.claim();
    })
    .then(() => {
        // --- LÓGICA CORREGIDA PARA NOTIFICAR ---
        // Después de activarse, envía un mensaje a todas las pestañas abiertas.
        self.clients.matchAll().then(clients => {
            clients.forEach(client => {
                client.postMessage({ type: 'NEW_VERSION_INSTALLED' });
            });
        });
    })
  );
});

// 3. Evento 'fetch': Intercepta las peticiones de red.
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      // Estrategia "Stale-While-Revalidate"
      return cache.match(event.request).then(cachedResponse => {
        // 1. Busca una versión actualizada en la red en segundo plano.
        const fetchPromise = fetch(event.request).then(networkResponse => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        }).catch(error => console.error('Service Worker: Fallo en la petición fetch:', error));
        // 2. Devuelve la respuesta del caché si existe, o espera a la red si no.
        return cachedResponse || fetchPromise;
      });
    })
  );

});
