(function () {
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

  async function hasLegacyClientState(previousVersion) {
    if (previousVersion) return true;

    try {
      if (Object.keys(localStorage).some((key) => key.startsWith('dy_'))) {
        return true;
      }
    } catch (_) {
      // ignore storage failures
    }

    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        if (registrations.length > 0) return true;
      }
    } catch (_) {
      // ignore SW inspection failures
    }

    try {
      if ('caches' in window) {
        const cacheKeys = await caches.keys();
        if (cacheKeys.length > 0) return true;
      }
    } catch (_) {
      // ignore cache inspection failures
    }

    return false;
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

    const shouldReset = await hasLegacyClientState(previousVersion);

    if (!shouldReset) {
      try {
        localStorage.setItem(VERSION_KEY, currentVersion);
      } catch (_) {
        // ignore storage failures
      }
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
