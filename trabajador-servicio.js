// trabajador-servicio.js - Service Worker para PWA
const CACHE_NAME = 'oyarce-stock-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/estilos/diseño.css',
    '/estilos/login.css',
    '/scripts/login.js',
    '/scripts/logica-inventario.js',
    '/scripts/escaner-codigos.js',
    '/data/HojaMarcas.csv',
    '/data/HojaSistemas.csv',
    '/datos/estructura-productos.json',
    '/iconos/icono-192.png',
    '/iconos/icono-512.png',
    '/manifiesto.json'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
    console.log('Service Worker instalándose...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Cache abierto');
                return cache.addAll(urlsToCache);
            })
            .catch((error) => {
                console.error('Error al abrir cache:', error);
            })
    );
});

// Activar Service Worker
self.addEventListener('activate', (event) => {
    console.log('Service Worker activándose...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Eliminando cache antiguo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Interceptar peticiones
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Devolver desde cache si existe
                if (response) {
                    return response;
                }
                
                // Sino, hacer petición a la red
                return fetch(event.request)
                    .then((response) => {
                        // Verificar si la respuesta es válida
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clonar la respuesta
                        const responseToCache = response.clone();
                        
                        // Añadir al cache
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    });
            })
            .catch((error) => {
                console.error('Error en fetch:', error);
                
                // Devolver página offline si existe
                if (event.request.destination === 'document') {
                    return caches.match('/index.html');
                }
            })
    );
});

// Manejar mensajes del cliente
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Notificaciones push (si se implementa en el futuro)
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/iconos/icono-192.png',
            badge: '/iconos/icono-192.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: data.primaryKey
            }
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Manejar clics en notificaciones
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow('/')
    );
});
