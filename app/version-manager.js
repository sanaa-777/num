(function () {
  const build = window.__APP_BUILD__ || { version: 'dev' };
  const VERSION_KEY = 'dy_build_version';
  const RELOAD_KEY = 'dy_cli_reload';
  const PRESERVE_LOCAL_KEYS = new Set([
    VERSION_KEY,
    'dy_lang',
    'dy_dark_mode'
  ]);
  // Only clear caches we own — never Firestore/Firebase IndexedDB
  const CACHE_PREFIX = 'dalil-yemen-static-';

  async function clearOldCaches() {
    if (!('caches' in window)) return;
    const keys = await caches.keys();
    const currentCache = CACHE_PREFIX + build.version;
    await Promise.all(
      keys
        .filter((key) => key.startsWith(CACHE_PREFIX) && key !== currentCache)
        .map((key) => caches.delete(key))
    );
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

  function forceSingleReload(version) {
    try {
      if (sessionStorage.getItem(RELOAD_KEY) === version) return false;
      sessionStorage.setItem(RELOAD_KEY, version);
    } catch (_) {
      // ignore session storage failures
    }

    // Preserve the current hash (route) during reload
    const url = new URL(window.location.href);
    url.searchParams.set('v', version);
    window.location.replace(url.toString());
    return true;
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

    // First visit or version changed — clear old caches only
    await clearOldCaches();
    clearLegacyLocalStorage();

    try {
      localStorage.setItem(VERSION_KEY, currentVersion);
    } catch (_) {
      // ignore storage failures
    }

    // Only reload if we had a previous version (not first visit)
    if (previousVersion && previousVersion !== 'dev') {
      const reloaded = forceSingleReload(currentVersion);
      if (reloaded) {
        // Stop further execution — page is reloading
        await new Promise(() => {});
      }
    }

    return { changed: false, version: currentVersion };
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
      // Clear old caches and reload
      await clearOldCaches();
      try { localStorage.setItem(VERSION_KEY, incomingVersion); } catch (_) {}
      forceSingleReload(incomingVersion);
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
    clearOldCaches
  };
})();
