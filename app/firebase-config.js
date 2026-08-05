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
const messaging = firebase.messaging();

// إعدادات Firestore
db.settings({
  cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
});

// تمكين الـ Offline Persistence
db.enablePersistence().catch((err) => {
  if (err.code === 'failed-precondition') {
    console.log('Multiple tabs open - persistence disabled');
  } else if (err.code === 'unimplemented') {
    console.log('Browser does not support persistence');
  }
});

console.log('Firebase initialized successfully');
