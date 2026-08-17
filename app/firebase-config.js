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

// ====== SYNCHRONOUS INIT ======
// Firebase SDK scripts are loaded synchronously (no defer) in <head>,
// so `firebase` global is guaranteed to exist when this script runs.
// No async/waitForFirebase needed.

try {
  // تهيئة Firebase (مرة واحدة فقط)
  if (typeof firebase !== 'undefined' && firebase && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  // الخدمات (var for global access)
  var auth = firebase.auth();
  var db = firebase.firestore();
  var messaging = null;
  try {
    if (typeof firebase.messaging === 'function') {
      messaging = firebase.messaging();
    }
  } catch (e) { /* messaging not supported */ }

  // إعداد Auth persistence
  auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(function(err) {
    console.warn('LOCAL persistence failed, trying NONE:', err.code || err.message);
    auth.setPersistence(firebase.auth.Auth.Persistence.NONE).catch(function(err2) {
      console.warn('Persistence setup failed:', err2.code || err2.message);
    });
  });

  // استخدام لغة الجهاز
  try { auth.useDeviceLanguage(); } catch (e) { /* ignore */ }

  // إعدادات Firestore
  try {
    db.settings({
      cacheSizeBytes: 20 * 1024 * 1024,
      ignoreUndefinedProperties: true,
      merge: true
    });
  } catch (e) { /* settings already applied */ }

  // تمكين الـ Offline Persistence
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

} catch (err) {
  console.error('Firebase init error:', err);
  // Set stub globals so other scripts don't crash
  var auth = null;
  var db = null;
  var messaging = null;
}
