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

var auth = null;
var db = null;
var messaging = null;

function _initFirebase() {
  try {
    if (typeof firebase === 'undefined' || !firebase) return false;
    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    try { if (typeof firebase.messaging === 'function') messaging = firebase.messaging(); } catch(e) {}
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(function() {
      auth.setPersistence(firebase.auth.Auth.Persistence.NONE).catch(function() {});
    });
    try { auth.useDeviceLanguage(); } catch(e) {}
    try { db.settings({ cacheSizeBytes: 20*1024*1024, ignoreUndefinedProperties: true, merge: true }); } catch(e) {}
    db.enablePersistence({ synchronizeTabs: true }).catch(function() {});
    if (window.ErrorTracker) ErrorTracker.attachFirestore(db, firebase);
    console.log('Firebase initialized successfully');
    return true;
  } catch(e) {
    console.error('Firebase init error:', e);
    return false;
  }
}

// Try immediate init
if (!_initFirebase()) {
  // Firebase SDK not loaded — load it dynamically
  console.warn('Firebase SDK not loaded, loading dynamically...');
  var _fbScripts = [
    'https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js',
    'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js',
    'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js',
    'https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js'
  ];
  var _fbIdx = 0;
  function _loadNextScript() {
    if (_fbIdx >= _fbScripts.length) {
      // All scripts loaded, try init again
      if (!_initFirebase()) {
        console.error('Firebase failed to initialize even after dynamic load');
      }
      return;
    }
    var s = document.createElement('script');
    s.src = _fbScripts[_fbIdx];
    s.onload = function() { _fbIdx++; _loadNextScript(); };
    s.onerror = function() { console.error('Failed to load: ' + _fbScripts[_fbIdx]); _fbIdx++; _loadNextScript(); };
    document.head.appendChild(s);
  }
  _loadNextScript();
}
