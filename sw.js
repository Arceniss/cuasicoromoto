const CACHE_NAME = 'cuasi-coromoto-cache-v2';
// Define la base de la URL para tu subdirectorio en GitHub Pages
const BASE_URL = '/cuasicoromoto';

// Lista de archivos que queremos que se guarden en caché durante la instalación.
const urlsToCache = [
  // --- Archivos Principales ---
  `${BASE_URL}/`, 
  `${BASE_URL}/style.css`,
  `${BASE_URL}/index.html`,
  `${BASE_URL}/manifest.json`,
  `${BASE_URL}/sw.js`,
  `${BASE_URL}/favicon.svg`,

  // --- Iconos ---
  `${BASE_URL}/iconos/icon-192x192.png`,
  `${BASE_URL}/iconos/icon-512x512.png`,

  // --- Fuentes Tipográficas ---
  `${BASE_URL}/fonts/Lora-Bold.ttf`,
  `${BASE_URL}/fonts/Montserrat-Light.ttf`,
  `${BASE_URL}/fonts/Montserrat-Regular.ttf`,
  `${BASE_URL}/fonts/Montserrat-Medium.ttf`,
  `${BASE_URL}/fonts/Montserrat-Bold.ttf`
];

// 1. Evento 'install': Se dispara cuando el Service Worker se instala.
self.addEventListener('install', event => {
  console.log('Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Cache abierto, añadiendo archivos principales.');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Forza al nuevo Service Worker a activarse inmediatamente en lugar de esperar.
        self.skipWaiting(); 
      })
      .catch(error => {
        console.error('Service Worker: Falló el cacheo en la instalación:', error);
      })
  );
});

// 2. Evento 'activate': Se dispara cuando el Service Worker se activa.
// Es el momento ideal para limpiar cachés antiguos y asegurar consistencia.
self.addEventListener('activate', event => {
  console.log('Service Worker: Activado');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Si el nombre de un caché no coincide con el CACHE_NAME actual, se elimina.
          // Esto es crucial para eliminar versiones antiguas de los archivos cacheados.
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Limpiando caché antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
        // Asegura que el Service Worker tome el control de la página de inmediato.
        return self.clients.claim();
    })
  );
});

// 3. Evento 'fetch': Intercepta todas las peticiones de red (imágenes, CSS, etc.).
// Aquí implementamos la estrategia "Stale-While-Revalidate".
self.addEventListener('fetch', event => {
  // Ignoramos peticiones que no sean GET, como las de tipo POST.
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      // 1. Primero, intenta responder desde el caché para una carga rápida.
      return cache.match(event.request).then(cachedResponse => {
        
        // 2. En paralelo, busca una versión actualizada en la red.
        const fetchPromise = fetch(event.request).then(networkResponse => {
          // Si la petición a la red es exitosa, la clonamos y actualizamos el caché.
          // Hacemos esto para que la próxima visita ya tenga la versión más reciente.
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        }).catch(error => {
          // Es importante manejar errores de red, especialmente en modo offline.
          console.error('Service Worker: Fallo en la petición fetch:', error);
          // Aquí se podría devolver una página de fallback si fuera necesario.
        });

        // 3. Devolvemos la respuesta del caché si existe (respuesta inmediata).
        // Si no está en caché (por ejemplo, la primera vez que se visita),
        // esperamos a que la promesa de la red se resuelva.
        // El usuario obtiene la versión guardada al instante, mientras la app se actualiza en segundo plano.
        return cachedResponse || fetchPromise;
      });
    })
  );
});