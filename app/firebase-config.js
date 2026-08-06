// =============================================
// Firebase Configuration - الدليل اليمني التجاري
// =============================================
// ⚠️ استبدل هذه القيم بإعدادات مشروعك على Firebase
// https://console.firebase.google.com

const firebaseConfig = {
  apiKey: "AIzaSyBAGdUGSb1tAVNA_PC6LbNM_jTG6P6VdG4",
  authDomain: "deel-39f2e.firebaseapp.com",
  projectId: "deel-39f2e",
  storageBucket: "deel-39f2e.firebasestorage.app",
  messagingSenderId: "915094552048",
  appId: "1:915094552048:web:08c78c6c0a26d43534f135",
  measurementId: "G-12LQHJMSP6"
};

// تهيئة Firebase
firebase.initializeApp(firebaseConfig);

// الخدمات
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
const messaging = typeof firebase.messaging === 'function' ? firebase.messaging() : null;

if (window.ErrorTracker) {
  ErrorTracker.attachFirestore(db, firebase);
}

// إعدادات Firestore
db.settings({
  cacheSizeBytes: 20 * 1024 * 1024,
  ignoreUndefinedProperties: true
});

// تمكين الـ Offline Persistence
db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
  if (window.ErrorTracker) {
    ErrorTracker.capture(err, {
      operation: 'firebase.persistence.enable',
      code: err.code || 'FIRESTORE-PERSISTENCE-FAILED',
      userMessage: 'تعذر تفعيل التخزين المحلي للتطبيق'
    });
  }
  if (err.code === 'failed-precondition') {
    console.log('Multiple tabs open - persistence disabled');
  } else if (err.code === 'unimplemented') {
    console.log('Browser does not support persistence');
  }
});

console.log('Firebase initialized successfully');
