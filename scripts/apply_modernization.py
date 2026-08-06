from pathlib import Path

root = Path('/home/user/num-audit')


def write(path, content):
    p = root / path
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content, encoding='utf-8')


def replace_in_file(path, old, new):
    p = root / path
    text = p.read_text(encoding='utf-8')
    if old not in text:
        raise SystemExit(f'Pattern not found in {path}: {old[:80]!r}')
    p.write_text(text.replace(old, new), encoding='utf-8')


write('app/build-meta.js', """window.__APP_BUILD__ = Object.freeze({
  version: '__APP_BUILD_VERSION__',
  commit: '__APP_BUILD_COMMIT__',
  deployedAt: '__APP_BUILD_TIME__'
});
""")

write('app/version-manager.js', r"""(function () {
  const build = window.__APP_BUILD__ || { version: 'dev' };
  const VERSION_KEY = 'dy_client_version';
  const RELOAD_KEY = 'dy_client_version_reload';
  const PRESERVE_LOCAL_KEYS = new Set([
    VERSION_KEY,
    'dy_lang',
    'dy_dark_mode'
  ]);
  const IDB_EXACT_NAMES = new Set([
    'firebase-heartbeat-database'
  ]);
  const IDB_NAME_PATTERNS = [
    'firestore/',
    'firebase-messaging',
    'firebase-installations',
    'firebase-heartbeat',
    'workbox',
    'dalil-yemen'
  ];

  function shouldDeleteDb(name) {
    if (!name || name === 'firebaseLocalStorageDb') return false;
    return IDB_EXACT_NAMES.has(name) || IDB_NAME_PATTERNS.some((pattern) => name.includes(pattern));
  }

  async function clearCaches() {
    if (!('caches' in window)) return;
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
  }

  async function unregisterServiceWorkers() {
    if (!('serviceWorker' in navigator)) return;
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map((reg) => reg.unregister()));
  }

  async function clearIndexedDb() {
    if (!('indexedDB' in window) || typeof indexedDB.deleteDatabase !== 'function') return;
    if (typeof indexedDB.databases === 'function') {
      const dbs = await indexedDB.databases();
      await Promise.all((dbs || [])
        .map((db) => db && db.name)
        .filter((name) => shouldDeleteDb(name))
        .map((name) => new Promise((resolve) => {
          const req = indexedDB.deleteDatabase(name);
          req.onsuccess = req.onerror = req.onblocked = () => resolve();
        })));
      return;
    }

    for (const name of [
      'firebase-heartbeat-database',
      'firestore/[DEFAULT]/deel-39f2e/main',
      'firestore/deel-39f2e/main',
      'firebase-messaging-database'
    ]) {
      if (!shouldDeleteDb(name)) continue;
      await new Promise((resolve) => {
        const req = indexedDB.deleteDatabase(name);
        req.onsuccess = req.onerror = req.onblocked = () => resolve();
      });
    }
  }

  function clearLegacyLocalStorage() {
    try {
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (PRESERVE_LOCAL_KEYS.has(key)) continue;
        if (key.startsWith('dy_')) {
          localStorage.removeItem(key);
        }
      }
    } catch (_) {
      // ignore storage access errors
    }
  }

  async function forceSingleReload(version) {
    try {
      if (sessionStorage.getItem(RELOAD_KEY) === version) return;
      sessionStorage.setItem(RELOAD_KEY, version);
    } catch (_) {
      // ignore session storage failures
    }

    const url = new URL(window.location.href);
    url.searchParams.set('v', version);
    window.location.replace(url.toString());
    await new Promise(() => {});
  }

  async function ensureFreshClient() {
    const currentVersion = build.version || 'dev';
    let previousVersion = null;

    try {
      previousVersion = localStorage.getItem(VERSION_KEY);
    } catch (_) {
      previousVersion = null;
    }

    if (previousVersion === currentVersion) {
      return { changed: false, version: currentVersion };
    }

    await Promise.all([
      clearCaches(),
      unregisterServiceWorkers(),
      clearIndexedDb()
    ]);

    clearLegacyLocalStorage();

    try {
      localStorage.setItem(VERSION_KEY, currentVersion);
    } catch (_) {
      // ignore storage failures
    }

    await forceSingleReload(currentVersion);
    return { changed: true, version: currentVersion };
  }

  async function handleWorkerActivation(message) {
    if (!message || message.type !== 'DY_VERSION_ACTIVATED') return;
    const incomingVersion = message.version;
    if (!incomingVersion) return;

    let currentVersion = null;
    try {
      currentVersion = localStorage.getItem(VERSION_KEY);
    } catch (_) {
      currentVersion = null;
    }

    if (incomingVersion !== currentVersion) {
      await ensureFreshClient();
    }
  }

  const ready = ensureFreshClient();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      handleWorkerActivation(event.data).catch((error) => {
        console.warn('version manager message error', error);
      });
    });
  }

  window.VersionManager = {
    version: build.version || 'dev',
    ready,
    clearCaches,
    clearIndexedDb
  };
})();
""")

write('scripts/stamp-build.js', r"""const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const version = process.env.APP_BUILD_VERSION || new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
let commit = process.env.GITHUB_SHA || 'local';
try {
  commit = execSync('git rev-parse --short HEAD', { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
} catch (_) {}
const deployedAt = new Date().toISOString();

const replacements = {
  '__APP_BUILD_VERSION__': version,
  '__APP_BUILD_COMMIT__': commit,
  '__APP_BUILD_TIME__': deployedAt
};

const files = [
  'index.html',
  'admin.html',
  'about.html',
  'privacy.html',
  'sw.js',
  'app/build-meta.js'
];

for (const relativeFile of files) {
  const file = path.join(root, relativeFile);
  let content = fs.readFileSync(file, 'utf8');
  for (const [search, value] of Object.entries(replacements)) {
    content = content.split(search).join(value);
  }
  fs.writeFileSync(file, content, 'utf8');
}

console.log(JSON.stringify({ version, commit, deployedAt }, null, 2));
""")

replace_in_file('index.html', '<link rel="manifest" href="manifest.json">', '<link rel="manifest" href="manifest.json?v=__APP_BUILD_VERSION__">\n  <script src="app/build-meta.js"></script>\n  <script src="app/version-manager.js?v=__APP_BUILD_VERSION__"></script>')
replace_in_file('index.html', '<link rel="stylesheet" href="app/styles.css">', '<link rel="stylesheet" href="app/styles.css?v=__APP_BUILD_VERSION__">')
replace_in_file('index.html', '  <script src="app/error-tracker.js" defer></script>\n\n  <!-- Firebase Config -->\n  <script src="app/firebase-config.js" defer></script>\n\n  <!-- App Modules (Firestore-based) -->\n  <script src="app/data-firestore.js" defer></script>\n  <script src="app/auth-firestore.js" defer></script>\n  <script src="app/admin-firestore.js" defer></script>\n  <script src="app/ads-firestore.js" defer></script>\n  <script src="app/app.js" defer></script>', '  <script src="app/error-tracker.js?v=__APP_BUILD_VERSION__" defer></script>\n\n  <!-- Firebase Config -->\n  <script src="app/firebase-config.js?v=__APP_BUILD_VERSION__" defer></script>\n\n  <!-- App Modules (Firestore-based) -->\n  <script src="app/data-firestore.js?v=__APP_BUILD_VERSION__" defer></script>\n  <script src="app/auth-firestore.js?v=__APP_BUILD_VERSION__" defer></script>\n  <script src="app/admin-firestore.js?v=__APP_BUILD_VERSION__" defer></script>\n  <script src="app/ads-firestore.js?v=__APP_BUILD_VERSION__" defer></script>\n  <script src="app/app.js?v=__APP_BUILD_VERSION__" defer></script>')
replace_in_file('index.html', "        navigator.serviceWorker.register('/sw.js')\n          .then(reg => console.log('SW registered:', reg.scope))\n          .catch(err => console.log('SW registration failed:', err));", "        const buildVersion = (window.__APP_BUILD__ && window.__APP_BUILD__.version) || 'dev';\n        navigator.serviceWorker.register(`/sw.js?v=${encodeURIComponent(buildVersion)}`, { updateViaCache: 'none' })\n          .then((reg) => reg.update().then(() => console.log('SW registered:', reg.scope)))\n          .catch((err) => console.log('SW registration failed:', err));")
replace_in_file('index.html', "      if (typeof firebase === 'undefined') {", "      await (window.VersionManager?.ready || Promise.resolve());\n      if (typeof firebase === 'undefined') {")

replace_in_file('admin.html', '<meta name="robots" content="noindex, nofollow">', '<meta name="robots" content="noindex, nofollow">\n  <script src="app/build-meta.js"></script>\n  <script src="app/version-manager.js?v=__APP_BUILD_VERSION__"></script>')
replace_in_file('admin.html', '  <script src="app/error-tracker.js"></script>\n\n  <!-- Firebase Config -->\n  <script src="app/firebase-config.js"></script>\n\n  <!-- App Modules (Firestore-based) -->\n  <script src="app/data-firestore.js"></script>\n  <script src="app/auth-firestore.js"></script>\n  <script src="app/admin-firestore.js"></script>\n  <script src="app/ads-firestore.js"></script>', '  <script src="app/error-tracker.js?v=__APP_BUILD_VERSION__"></script>\n\n  <!-- Firebase Config -->\n  <script src="app/firebase-config.js?v=__APP_BUILD_VERSION__"></script>\n\n  <!-- App Modules (Firestore-based) -->\n  <script src="app/data-firestore.js?v=__APP_BUILD_VERSION__"></script>\n  <script src="app/auth-firestore.js?v=__APP_BUILD_VERSION__"></script>\n  <script src="app/admin-firestore.js?v=__APP_BUILD_VERSION__"></script>\n  <script src="app/ads-firestore.js?v=__APP_BUILD_VERSION__"></script>')
replace_in_file('admin.html', '    // بدء التطبيق\n    AdminPanel.init();', "    // بدء التطبيق\n    window.addEventListener('load', async () => {\n      await (window.VersionManager?.ready || Promise.resolve());\n      if ('serviceWorker' in navigator) {\n        const buildVersion = (window.__APP_BUILD__ && window.__APP_BUILD__.version) || 'dev';\n        try {\n          const reg = await navigator.serviceWorker.register(`/sw.js?v=${encodeURIComponent(buildVersion)}`, { updateViaCache: 'none' });\n          await reg.update();\n        } catch (error) {\n          console.warn('Admin SW registration failed', error);\n        }\n      }\n      AdminPanel.init();\n    });")

replace_in_file('about.html', '<link rel="stylesheet" href="app/styles.css">', '<link rel="stylesheet" href="app/styles.css?v=__APP_BUILD_VERSION__">\n  <script src="app/build-meta.js"></script>')
replace_in_file('privacy.html', '<link rel="stylesheet" href="app/styles.css">', '<link rel="stylesheet" href="app/styles.css?v=__APP_BUILD_VERSION__">\n  <script src="app/build-meta.js"></script>')

write('sw.js', r"""// =============================================
// Service Worker - دليل Yemen PWA (Versioned)
// =============================================

const BUILD_VERSION = '__APP_BUILD_VERSION__';
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
""")

replace_in_file('firebase.json', '            {\n              "key": "Cache-Control",\n              "value": "public, max-age=3600, stale-while-revalidate=86400"\n            },', '            {\n              "key": "Cache-Control",\n              "value": "public, max-age=31536000, immutable"\n            },')
replace_in_file('firebase.json', '            {\n              "key": "Cache-Control",\n              "value": "public, max-age=3600, stale-while-revalidate=86400"\n            }', '            {\n              "key": "Cache-Control",\n              "value": "public, max-age=31536000, immutable"\n            }')
replace_in_file('firebase.json', '            {\n              "key": "Cache-Control",\n              "value": "public, max-age=604800, stale-while-revalidate=86400"\n            }', '            {\n              "key": "Cache-Control",\n              "value": "public, max-age=31536000, immutable"\n            }')
replace_in_file('firebase.json', '      "headers": [\n        {', '      "headers": [\n        {\n          "source": "/",\n          "headers": [\n            {\n              "key": "Cache-Control",\n              "value": "no-store, max-age=0"\n            }\n          ]\n        },\n        {\n          "source": "/index.html",\n          "headers": [\n            {\n              "key": "Cache-Control",\n              "value": "no-store, max-age=0"\n            }\n          ]\n        },\n        {\n          "source": "/admin.html",\n          "headers": [\n            {\n              "key": "Cache-Control",\n              "value": "no-store, max-age=0"\n            }\n          ]\n        },\n        {\n          "source": "/about.html",\n          "headers": [\n            {\n              "key": "Cache-Control",\n              "value": "no-store, max-age=0"\n            }\n          ]\n        },\n        {\n          "source": "/privacy.html",\n          "headers": [\n            {\n              "key": "Cache-Control",\n              "value": "no-store, max-age=0"\n            }\n          ]\n        },\n        {\n          "source": "/manifest.json",\n          "headers": [\n            {\n              "key": "Cache-Control",\n              "value": "no-store, max-age=0"\n            }\n          ]\n        },\n        {\n          "source": "/sw.js",\n          "headers": [\n            {\n              "key": "Cache-Control",\n              "value": "no-store, max-age=0"\n            }\n          ]\n        },\n        {\n          "source": "/app/build-meta.js",\n          "headers": [\n            {\n              "key": "Cache-Control",\n              "value": "no-store, max-age=0"\n            }\n          ]\n        },\n        {')

replace_in_file('app/firebase-config.js', "db.settings({\n  cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED\n});\n\n// تمكين الـ Offline Persistence\ndb.enablePersistence().catch((err) => {", "db.settings({\n  cacheSizeBytes: 20 * 1024 * 1024,\n  ignoreUndefinedProperties: true\n});\n\n// تمكين الـ Offline Persistence\ndb.enablePersistence({ synchronizeTabs: true }).catch((err) => {")

replace_in_file('app/data-firestore.js', "        const fileName = `places/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;\n        const ref = storage.ref(fileName);\n        await ref.put(blob);", "        if (!Auth.currentUser) throw new Error('AUTH_REQUIRED_FOR_PLACE_UPLOAD');\n        const fileName = `places/${Auth.currentUser.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;\n        const ref = storage.ref(fileName);\n        await ref.put(blob, { contentType: 'image/jpeg', cacheControl: 'public,max-age=31536000,immutable' });")

replace_in_file('app/auth-firestore.js', "      const ref = storage.ref(`avatars/${user.uid}`);\n      await ref.put(blob);", "      const ref = storage.ref(`avatars/${user.uid}/avatar.jpg`);\n      await ref.put(blob, { contentType: 'image/jpeg', cacheControl: 'public,max-age=31536000,immutable' });")
replace_in_file('app/auth-firestore.js', "      const ref = storage.ref(`covers/${user.uid}`);\n      await ref.put(blob);", "      const ref = storage.ref(`covers/${user.uid}/cover.jpg`);\n      await ref.put(blob, { contentType: 'image/jpeg', cacheControl: 'public,max-age=31536000,immutable' });")

replace_in_file('app/ads-firestore.js', "      const fileName = `ads/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;\n      const ref = storage.ref(fileName);\n      await ref.put(blob);", "      const ownerSegment = (window.Auth && Auth.currentUser && Auth.currentUser.id) ? Auth.currentUser.id : 'admin';\n      const fileName = `ads/${ownerSegment}/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;\n      const ref = storage.ref(fileName);\n      await ref.put(blob, { contentType: 'image/jpeg', cacheControl: 'public,max-age=31536000,immutable' });")

replace_in_file('app/app.js', "  submitReview(pid) { if (!this._selectedRating) { alert('اختر تقييم'); return; } const c = document.getElementById('reviewComment').value; if (!c) { alert('اكتب تعليق'); return; } Data.addReview(pid, Auth.currentUser.id, Auth.currentUser.name, this._selectedRating, c); this._selectedRating = 0; this.showPlace(pid); },", "  submitReview(pid) { if (!this._selectedRating) { alert('اختر تقييم'); return; } const c = document.getElementById('reviewComment').value; if (!c) { alert('اكتب تعليق'); return; } Data.addReview(pid, Auth.currentUser.id, Auth.currentUser.name, Auth.currentUser.avatar || '', this._selectedRating, c); this._selectedRating = 0; this.showPlace(pid); },")
replace_in_file('app/app.js', "            <span class=\"text-[10px] text-gray-400 flex items-center gap-1 mt-1\"><i data-lucide=\"clock\" class=\"w-3 h-3\"></i>${new Date(r.createdAt).toLocaleDateString('ar')}</span>", "            <span class=\"text-[10px] text-gray-400 flex items-center gap-1 mt-1\"><i data-lucide=\"clock\" class=\"w-3 h-3\"></i>${r.createdAt?.toDate ? r.createdAt.toDate().toLocaleDateString('ar') : (r.createdAt ? new Date(r.createdAt).toLocaleDateString('ar') : '')}</span>")

replace_in_file('storage.rules', "rules_version = '2';\nservice firebase.storage {\n  match /b/{bucket}/o {", "rules_version = '2';\nservice firebase.storage {\n  match /b/{bucket}/o {\n    function isSignedIn() {\n      return request.auth != null;\n    }\n\n    function isAdmin() {\n      return isSignedIn()\n        && firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';\n    }\n\n    function isImageUpload(maxBytes) {\n      return request.resource != null\n        && request.resource.size < maxBytes\n        && request.resource.contentType.matches('image/.*');\n    }")
replace_in_file('storage.rules', "    match /avatars/{userId}/{allPaths=**} {\n      allow read: if true;\n      allow write: if request.auth.uid == userId\n        && request.resource.size < 5 * 1024 * 1024\n        && request.resource.contentType.matches('image/.*');\n    }", "    match /avatars/{userId}/{allPaths=**} {\n      allow read: if true;\n      allow write: if isSignedIn()\n        && request.auth.uid == userId\n        && isImageUpload(5 * 1024 * 1024);\n    }")
replace_in_file('storage.rules', "    match /covers/{userId}/{allPaths=**} {\n      allow read: if true;\n      allow write: if request.auth.uid == userId\n        && request.resource.size < 10 * 1024 * 1024\n        && request.resource.contentType.matches('image/.*');\n    }", "    match /covers/{userId}/{allPaths=**} {\n      allow read: if true;\n      allow write: if isSignedIn()\n        && request.auth.uid == userId\n        && isImageUpload(10 * 1024 * 1024);\n    }")
replace_in_file('storage.rules', "    match /places/{placeId}/{allPaths=**} {\n      allow read: if true;\n      allow write: if request.auth != null\n        && request.resource.size < 10 * 1024 * 1024\n        && request.resource.contentType.matches('image/.*');\n    }", "    match /places/{userId}/{allPaths=**} {\n      allow read: if true;\n      allow write: if isSignedIn()\n        && request.auth.uid == userId\n        && isImageUpload(10 * 1024 * 1024);\n    }")
replace_in_file('storage.rules', "    match /ads/{allPaths=**} {\n      allow read: if true;\n      allow write: if request.auth != null\n        && request.resource.size < 10 * 1024 * 1024\n        && request.resource.contentType.matches('image/.*');\n    }", "    match /ads/{allPaths=**} {\n      allow read: if true;\n      allow write: if isAdmin()\n        && isImageUpload(10 * 1024 * 1024);\n    }")

replace_in_file('firestore.rules', "    // ====== الأماكن ======\n    match /places/{placeId} {\n      // القراءة: أي مكان نشط (للعامة) أو أي مكان للمصادقين\n      allow read: if resource.data.isActive == true || request.auth != null;\n      // الإنشاء: أي مستخدم مصادق\n      allow create: if request.auth != null;\n      // التحديث: المالك أو الأدمن\n      allow update: if request.auth != null && (\n        request.auth.uid == resource.data.owner || isAdmin()\n      );\n      // الحذف: الأدمن فقط (نستخدم تعطيل isActive بدلاً من الحذف)\n      allow delete: if isAdmin();\n    }\n\n    // ====== المراجعات ======\n    match /reviews/{reviewId} {\n      allow read: if true;\n      allow create: if request.auth != null;\n      allow update: if request.auth.uid == resource.data.userId;\n      allow delete: if request.auth.uid == resource.data.userId || isAdmin();\n    }\n\n    // ====== المفضلة ======\n    match /favorites/{favId} {\n      allow read: if request.auth != null;\n      allow write: if request.auth != null && favId.matches(request.auth.uid + '_.*');\n    }", "    // ====== الأماكن ======\n    match /places/{placeId} {\n      // القراءة: أي مكان نشط (للعامة) أو أي مكان للمصادقين\n      allow read: if resource.data.isActive == true || request.auth != null;\n      // الإنشاء: مستخدم مصادق يضيف مكانه فقط ولا يستطيع رفع الامتيازات\n      allow create: if request.auth != null\n        && request.resource.data.owner == request.auth.uid\n        && request.resource.data.verified == false\n        && request.resource.data.featured == false\n        && request.resource.data.isActive == true\n        && request.resource.data.status == 'pending'\n        && request.resource.data.views == 0\n        && request.resource.data.reviews == 0\n        && request.resource.data.rating == 0;\n      // التحديث: المالك يحدّث الحقول الوصفية فقط، أو الأدمن يتحكم الكامل\n      allow update: if isAdmin() || (request.auth != null\n        && request.auth.uid == resource.data.owner\n        && request.resource.data.owner == resource.data.owner\n        && request.resource.data.verified == resource.data.verified\n        && request.resource.data.featured == resource.data.featured\n        && request.resource.data.status == resource.data.status\n        && request.resource.data.isActive == resource.data.isActive\n        && request.resource.data.views == resource.data.views\n        && request.resource.data.reviews == resource.data.reviews\n        && request.resource.data.rating == resource.data.rating);\n      // الحذف: الأدمن فقط (نستخدم تعطيل isActive بدلاً من الحذف)\n      allow delete: if isAdmin();\n    }\n\n    // ====== المراجعات ======\n    match /reviews/{reviewId} {\n      allow read: if true;\n      allow create: if request.auth != null\n        && request.resource.data.userId == request.auth.uid\n        && request.resource.data.rating is int\n        && request.resource.data.rating >= 1\n        && request.resource.data.rating <= 5\n        && request.resource.data.comment is string\n        && request.resource.data.comment.size() <= 1000;\n      allow update: if request.auth.uid == resource.data.userId\n        && request.resource.data.userId == resource.data.userId\n        && request.resource.data.placeId == resource.data.placeId;\n      allow delete: if request.auth.uid == resource.data.userId || isAdmin();\n    }\n\n    // ====== المفضلة ======\n    match /favorites/{favId} {\n      allow read: if request.auth != null;\n      allow write: if request.auth != null\n        && favId.matches(request.auth.uid + '_.*')\n        && request.resource.data.userId == request.auth.uid;\n    }")

print('Modernization patch applied successfully')
