// // Define un nombre y una versión para tu caché.
// // ¡Importante! Cambia la versión si haces cambios en los archivos cacheados.
// const CACHE_NAME = 'cuasi-coromoto-cache-v2'; // Cambiamos a v2

// // Lista de archivos que queremos que se guarden en caché.
// const urlsToCache = [
//   // --- Archivos Principales ---
//   '/', // La raíz de la web
//   'style.css',
//   'index.html',
//   'manifest.json',
//   'sw.js', // ¡Cachear el propio service worker es una buena práctica!
//   'favicon.svg',

//   // --- Iconos ---
//   'iconos/icon-192x192.png',
//   'iconos/icon-512x512.png',

//   // --- Fuentes Tipográficas ---
//   // ¡Aquí está la clave para que la tipografía funcione offline!
//   // Asegúrate de que las rutas son correctas según tu estructura de carpetas.
//   './fonts/Lora-Bold.ttf',
//   './fonts/Montserrat-Light.ttf',
//   './fonts/Montserrat-Regular.ttf',
//   './fonts/Montserrat-Medium.ttf',
//   './fonts/Montserrat-Bold.ttf'
// ];

const CACHE_NAME = 'cuasi-coromoto-cache-v2';
// Define la base de la URL para tu subdirectorio en GitHub Pages
const BASE_URL = '/cuasicoromoto';

// Lista de archivos que queremos que se guarden en caché.
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
  // Asegúrate de revisar que estas rutas sean las mismas que usas en tu CSS
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
        console.log('Service Worker: Cache abierto, añadiendo archivos principales y fuentes.');
        // Usamos addAll para añadir todos los archivos de nuestra lista al caché.
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Forza al Service Worker a activarse inmediatamente.
        self.skipWaiting(); 
      })
      .catch(error => {
        // Si algo falla al cachear, lo mostramos en la consola.
        // Esto es muy útil para depurar si una ruta de archivo está mal escrita.
        console.error('Service Worker: Falló el cacheo en la instalación:', error);
      })
  );
});

// 2. Evento 'activate': Se dispara cuando el Service Worker se activa.
// Sirve para limpiar cachés antiguos.
self.addEventListener('activate', event => {
  console.log('Service Worker: Activado');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Si el nombre del caché no es el que hemos definido (CACHE_NAME), lo borramos.
          // Esto ocurre cuando actualizamos la versión del caché (de v1 a v2).
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Limpiando caché antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Asegura que el Service Worker tome el control inmediato de la página.
  return self.clients.claim();
});

// 3. Evento 'fetch': Intercepta todas las peticiones de red.
self.addEventListener('fetch', event => {
  // Solo aplicamos la estrategia de caché para peticiones GET (no POST, etc.)
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    // Primero, busca el recurso en el caché.
    caches.match(event.request)
      .then(response => {
        // Si la respuesta está en el caché, la devolvemos.
        if (response) {
          //console.log('Service Worker: Sirviendo desde caché:', event.request.url);
          return response;
        }
        
        // Si no está en el caché, vamos a la red a buscarlo.
        //console.log('Service Worker: Sirviendo desde red:', event.request.url);
        return fetch(event.request);
      })
  );
});