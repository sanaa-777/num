// =============================================
// Firebase Configuration - الدليل اليمني التجاري
// =============================================

var firebaseConfig = {
  apiKey: "AIzaSy…VdG4",
  authDomain: "deel-39f2e.firebaseapp.com",
  projectId: "deel-39f2e",
  storageBucket: "deel-39f2e.firebasestorage.app",
  messagingSenderId: "915094552048",
  appId: "1:915094552048:web:08c78c6c0a26d43534f135",
  measurementId: "G-12LQHJMSP6"
};

var auth = null;
var db = null;
var messaging = null;

try {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  auth = firebase.auth();
  db = firebase.firestore();

  try {
    if (typeof firebase.messaging === 'function') {
      messaging = firebase.messaging();
    }
  } catch (e) {}

  auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(function() {
    auth.setPersistence(firebase.auth.Auth.Persistence.NONE).catch(function() {});
  });

  try { auth.useDeviceLanguage(); } catch (e) {}

  try {
    db.settings({
      cacheSizeBytes: 20 * 1024 * 1024,
      ignoreUndefinedProperties: true,
      merge: true
    });
  } catch (e) {}

  db.enablePersistence({ synchronizeTabs: true }).catch(function() {});

  if (window.ErrorTracker) {
    ErrorTracker.attachFirestore(db, firebase);
  }

  console.log('Firebase initialized successfully');

} catch (err) {
  console.error('Firebase init error:', err);
}
