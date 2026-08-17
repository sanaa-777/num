// =============================================
// Firebase Configuration - الدليل اليمني التجاري
// =============================================

(function() {
  'use strict';

  var firebaseConfig = {
    apiKey: "AIzaSyBAGdUGSb1tAVNA_PC6LbNM_jTG6P6VdG4",
    authDomain: "deel-39f2e.firebaseapp.com",
    projectId: "deel-39f2e",
    storageBucket: "deel-39f2e.firebasestorage.app",
    messagingSenderId: "915094552048",
    appId: "1:915094552048:web:08c78c6c0a26d43534f135",
    measurementId: "G-12LQHJMSP6"
  };

  // ====== Defensive SDK Check ======
  // Wait for Firebase SDK to be available before initializing.
  // This handles cases where CDN scripts load slowly or fail temporarily.
  function waitForFirebase(maxWaitMs) {
    maxWaitMs = maxWaitMs || 10000;
    return new Promise(function(resolve, reject) {
      // Already loaded?
      if (typeof firebase !== 'undefined' && firebase && firebase.initializeApp) {
        resolve(firebase);
        return;
      }

      var start = Date.now();
      var interval = setInterval(function() {
        if (typeof firebase !== 'undefined' && firebase && firebase.initializeApp) {
          clearInterval(interval);
          resolve(firebase);
        } else if (Date.now() - start > maxWaitMs) {
          clearInterval(interval);
          reject(new Error('Firebase SDK failed to load within ' + maxWaitMs + 'ms'));
        }
      }, 50);
    });
  }

  // ====== Initialize Firebase ======
  function initFirebase() {
    try {
      // تهيئة Firebase (مرة واحدة فقط)
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }

      // الخدمات (var for global access from inline scripts)
      // Note: Firebase Storage removed — image uploads use Cloudinary (ImageStorage)
      window.auth = firebase.auth();
      window.db = firebase.firestore();

      // Only init messaging if supported
      try {
        if (typeof firebase.messaging === 'function') {
          window.messaging = firebase.messaging();
        } else {
          window.messaging = null;
        }
      } catch (msgErr) {
        console.warn('Firebase Messaging not available:', msgErr.message);
        window.messaging = null;
      }

      // إعداد Auth persistence
      window.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(function(err) {
        console.warn('LOCAL persistence failed, trying NONE:', err.code || err.message);
        window.auth.setPersistence(firebase.auth.Auth.Persistence.NONE).catch(function(err2) {
          console.warn('Persistence setup failed:', err2.code || err2.message);
        });
      });

      // استخدام لغة الجهاز
      try { window.auth.useDeviceLanguage(); } catch (e) { /* ignore */ }

      // إعدادات Firestore
      try {
        window.db.settings({
          cacheSizeBytes: 20 * 1024 * 1024,
          ignoreUndefinedProperties: true,
          merge: true
        });
      } catch (e) { /* settings already applied */ }

      // تمكين الـ Offline Persistence
      window.db.enablePersistence({ synchronizeTabs: true }).catch(function(err) {
        if (err.code === 'failed-precondition') {
          console.log('Multiple tabs open - persistence disabled');
        } else if (err.code === 'unimplemented') {
          console.log('Browser does not support persistence');
        }
      });

      if (window.ErrorTracker) {
        window.ErrorTracker.attachFirestore(window.db, firebase);
      }

      console.log('Firebase initialized successfully');
      return true;
    } catch (err) {
      console.error('Firebase init error:', err);
      return false;
    }
  }

  // ====== Bootstrap ======
  waitForFirebase(10000).then(function() {
    initFirebase();
  }).catch(function(err) {
    console.error('Firebase SDK load timeout:', err.message);
    // Try one more time after a brief delay (handles edge cases)
    setTimeout(function() {
      if (typeof firebase !== 'undefined' && firebase && firebase.initializeApp) {
        initFirebase();
      } else {
        console.error('Firebase SDK completely unavailable. Site will run in offline mode.');
        // Set stub globals so other scripts don't crash
        window.auth = null;
        window.db = null;
        window.messaging = null;
      }
    }, 2000);
  });

})();
