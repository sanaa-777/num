// =============================================
// Firebase Configuration - الدليل اليمني التجاري
// =============================================

const firebaseConfig = {
  apiKey: "AIzaSyBAGdUGSb1tAVNA_PC6LbNM_jTG6P6VdG4",
  authDomain: "deel-39f2e.firebaseapp.com",
  projectId: "deel-39f2e",
  storageBucket: "deel-39f2e.firebasestorage.app",
  messagingSenderId: "915094552048",
  appId: "1:915094552048:web:08c78c6c0a26d43534f135",
  measurementId: "G-12LQHJMSP6"
};

// تهيئة Firebase (مرة واحدة فقط)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// الخدمات
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
const messaging = typeof firebase.messaging === 'function' ? firebase.messaging() : null;

// إعداد Auth persistence مع fallback
(async function initAuthPersistence() {
  try {
    await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    console.log('Auth persistence: LOCAL');
  } catch (err) {
    console.warn('LOCAL persistence failed, trying NONE:', err?.code || err?.message);
    try {
      await auth.setPersistence(firebase.auth.Auth.Persistence.NONE);
      console.log('Auth persistence: NONE (fallback)');
    } catch (err2) {
      console.warn('Persistence setup failed completely:', err2?.code || err2?.message);
    }
  }
})();

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
db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
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
