// =============================================
// Service Worker - دليل Yemen PWA (Versioned)
// =============================================

const BUILD_VERSION = '20260809223648';
const CACHE_PREFIX = 'dalil-yemen-static-';
const CACHE_NAME = `${CACHE_PREFIX}${BUILD_VERSION}`;
const OFFLINE_FALLBACK = `/index.html?v=${BUILD_VERSION}`;
const APP_SHELL = [
  OFFLINE_FALLBACK,
  `/admin.html?v=${BUILD_VERSION}`,
  `/manifest.json?v=${BUILD_VERSION}`,
  `/app/styles.css?v=${BUILD_VERSION}`,
  `/app/build-meta.js`,
  `/app/version-manager.js?v=${BUILD_VERSION}`,
  `/app/error-tracker.js?v=${BUILD_VERSION}`,
  `/app/firebase-config.js?v=${BUILD_VERSION}`,
  `/app/data-firestore.js?v=${BUILD_VERSION}`,
  `/app/auth-firestore.js?v=${BUILD_VERSION}`,
  `/app/admin-firestore.js?v=${BUILD_VERSION}`,
  `/app/ads-firestore.js?v=${BUILD_VERSION}`,
  `/app/app.js?v=${BUILD_VERSION}`
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch(() => undefined)
      .then(() => self.skipWaiting())
  );
});

async function cleanupOldCaches() {
  const keys = await caches.keys();
  await Promise.all(
    keys
      .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
      .map((key) => caches.delete(key))
  );
}

async function broadcastVersionActivated() {
  const clientsList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  for (const client of clientsList) {
    client.postMessage({ type: 'DY_VERSION_ACTIVATED', version: BUILD_VERSION });
  }
}

self.addEventListener('activate', (event) => {
  event.waitUntil(
    cleanupOldCaches()
      .then(() => self.clients.claim())
      .then(() => broadcastVersionActivated())
  );
});

function isNavigationRequest(request) {
  return request.mode === 'navigate' || request.destination === 'document';
}

async function networkFirst(request, fallbackUrl = null) {
  try {
    const response = await fetch(request, { cache: 'no-store' });
    if (response && response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (fallbackUrl) {
      const fallback = await caches.match(fallbackUrl);
      if (fallback) return fallback;
    }
    throw error;
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.ok) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) {
    // Never cache Firebase Auth, Firestore, Storage, or Google API calls
    const host = url.hostname;
    if (host.includes('googleapis.com') || host.includes('firebaseio.com') ||
        host.includes('firebase.google.com') || host.includes('gstatic.com/firebase')) {
      event.respondWith(fetch(event.request, { cache: 'no-store' }));
      return;
    }
    event.respondWith(networkFirst(event.request).catch(() => caches.match(event.request)));
    return;
  }

  if (url.pathname === '/sw.js' || url.pathname === '/app/build-meta.js' || url.pathname === '/manifest.json') {
    event.respondWith(fetch(event.request, { cache: 'no-store' }));
    return;
  }

  if (isNavigationRequest(event.request)) {
    event.respondWith(networkFirst(event.request, OFFLINE_FALLBACK));
    return;
  }

  event.respondWith(cacheFirst(event.request));
});

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'الدليل اليمني التجاري', {
      body: data.body || 'إشعار جديد',
      icon: '/manifest.json',
      vibrate: [200, 100, 200],
      data: data.url || '/'
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data || '/'));
});
