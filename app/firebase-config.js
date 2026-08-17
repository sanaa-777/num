// =============================================
// Firebase Configuration - الدليل اليمني التجاري
// =============================================

var firebaseConfig = {
  apiKey: "AIzaSyBAGdUGSb1tAVNA_PC6LbNM_jTG6P6VdG4",
  authDomain: "deel-39f2e.firebaseapp.com",
  projectId: "deel-39f2e",
  storageBucket: "deel-39f2e.firebasestorage.app",
  messagingSenderId: "915094552048",
  appId: "1:915094552048:web:08c78c6c0a26d43534f135",
  measurementId: "G-12LQHJMSP6"
};

// ====== Safe Firebase Init ======
// Firebase SDK scripts are loaded synchronously (no defer) in <head>,
// but network issues can cause them to fail. This code handles both cases.

var auth = null;
var db = null;
var messaging = null;

function initFirebase() {
  try {
    if (typeof firebase === 'undefined' || !firebase) {
      console.warn('Firebase SDK not loaded yet, will retry...');
      return false;
    }

    // Initialize app (once only)
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    // Initialize services
    auth = firebase.auth();
    db = firebase.firestore();

    try {
      if (typeof firebase.messaging === 'function') {
        messaging = firebase.messaging();
      }
    } catch (e) { /* messaging not supported */ }

    // Auth persistence
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(function(err) {
      console.warn('LOCAL persistence failed, trying NONE:', err.code || err.message);
      auth.setPersistence(firebase.auth.Auth.Persistence.NONE).catch(function(err2) {
        console.warn('Persistence setup failed:', err2.code || err2.message);
      });
    });

    // Device language
    try { auth.useDeviceLanguage(); } catch (e) { /* ignore */ }

    // Firestore settings
    try {
      db.settings({
        cacheSizeBytes: 20 * 1024 * 1024,
        ignoreUndefinedProperties: true,
        merge: true
      });
    } catch (e) { /* settings already applied */ }

    // Offline persistence
    db.enablePersistence({ synchronizeTabs: true }).catch(function(err) {
      if (err.code === 'failed-precondition') {
        console.log('Multiple tabs open - persistence disabled');
      } else if (err.code === 'unimplemented') {
        console.log('Browser does not support persistence');
      }
    });

    if (window.ErrorTracker) {
      ErrorTracker.attachFirestore(db, firebase);
    }

    console.log('Firebase initialized successfully');
    return true;

  } catch (err) {
    console.error('Firebase init error:', err);
    auth = null;
    db = null;
    messaging = null;
    return false;
  }
}

// Try to initialize immediately
if (!initFirebase()) {
  // Retry up to 5 times with increasing delay
  var _fbRetryCount = 0;
  var _fbRetryInterval = setInterval(function() {
    _fbRetryCount++;
    if (initFirebase() || _fbRetryCount >= 5) {
      clearInterval(_fbRetryInterval);
      if (_fbRetryCount >= 5 && (!auth || !db)) {
        console.error('Firebase failed to load after 5 retries');
      }
    }
  }, 1000);
}
