// =============================================
// Service Worker - دليل Yemen PWA (Optimized)
// =============================================

const CACHE_NAME = 'dalil-yemen-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/admin.html',
  '/manifest.json',
  '/app/styles.css',
  '/app/data.js',
  '/app/auth.js',
  '/app/admin.js',
  '/app/ads.js',
  '/app/app.js',
];

// التثبيت - تخزين الملفات الأساسية
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// التفعيل - حذف التخزين القديم
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names.filter((name) => name !== CACHE_NAME)
             .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// الجلب - Network First مع Cache Fallback
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // للملفات المحلية: Cache First
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) {
          // تحديث الكاش في الخلفية
          fetch(event.request).then((response) => {
            if (response.ok) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response));
            }
          }).catch(() => {});
          return cached;
        }
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => {
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
      })
    );
    return;
  }

  // للـ CDN: Network First
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// Push Notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'الدليل اليمني التجاري', {
      body: data.body || 'إشعار جديد',
      icon: '/manifest.json',
      vibrate: [200, 100, 200],
      data: data.url || '/',
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data || '/'));
});
