// =============================================
// Service Worker - دليل Yemen PWA
// =============================================

const CACHE_NAME = 'dalil-yemen-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/admin.html',
  '/manifest.json',
  '/app/data.js',
  '/app/auth.js',
  '/app/admin.js',
  '/app/ads.js',
  '/app/app.js',
];

const CDN_ASSETS = [
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest/dist/umd/lucide.js',
  'https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;500;600;700&display=swap',
];

// التثبيت
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// التفعيل
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// الجلب (Network First مع Cache Fallback)
self.addEventListener('fetch', (event) => {
  // تجاهل الطلبات غير GET
  if (event.request.method !== 'GET') return;

  // تجاهل طلبات API خارجية
  if (!event.request.url.startsWith(self.location.origin) &&
      !event.request.url.includes('tailwindcss') &&
      !event.request.url.includes('unpkg.com') &&
      !event.request.url.includes('fonts.googleapis')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // نسخة من الاستجابة للتخزين المؤقت
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // في حالة عدم الاتصال، استخدم النسخة المخزنة
        return caches.match(event.request).then((response) => {
          if (response) return response;
          // إذا لم توجد نسخة مخزنة، أرجع صفحة offline
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
      })
  );
});

// Push Notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body || 'إشعار جديد من دليل اليمن',
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%232563eb'/><text x='50' y='65' text-anchor='middle' font-size='50' font-family='Arial' font-weight='bold' fill='white'>د</text></svg>",
    badge: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%232563eb'/><text x='50' y='65' text-anchor='middle' font-size='50' font-family='Arial' font-weight='bold' fill='white'>د</text></svg>",
    vibrate: [200, 100, 200],
    data: data.url || '/',
    actions: [
      { action: 'open', title: 'فتح' },
      { action: 'close', title: 'إغلاق' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'دليل اليمن', options)
  );
});

// النقر على الإشعار
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data || '/')
    );
  }
});
