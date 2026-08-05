// =============================================
// Firebase Configuration - الدليل اليمني التجاري
// =============================================
// ⚠️ استبدل هذه القيم بإعدادات مشروعك على Firebase
// https://console.firebase.google.com

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
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
