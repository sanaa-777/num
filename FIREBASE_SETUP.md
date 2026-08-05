# 🔥 إعداد Firebase - الدليل اليمني التجاري

## الخطوة 1: إنشاء مشروع Firebase

1. اذهب إلى [Firebase Console](https://console.firebase.google.com)
2. اضغط **Create a project** (أو **Add project`)
3. أدخل اسم المشروع: `dalil-yemen`
4. فعّل Google Analytics (اختياري)
5. اضغط **Create project**

## الخطوة 2: إضافة تطبيق الويب

1. في صفحة المشروع، اضغط على أيقونة الويب `</>`
2. أدخل اسم التطبيق: `dalil-yemen-web`
3. **لا تفعّل** Firebase Hosting (سنستخدم GitHub Pages)
4. اضغط **Register app**
5. انسخ الإعدادات (ستحتاجها لاحقاً)

## الخطوة 3: تفعيل Authentication

1. اذهب إلى **Authentication** → **Sign-in method**
2. فعّل:
   - ✅ **Email/Password**
   - ✅ **Google**
3. في **Settings** → **Authorized domains**، أضف:
   - `sanaa-777.github.io`

## الخطوة 4: إنشاء Firestore Database

1. اذهب إلى **Firestore Database** → **Create database**
2. ابدأ في **Test mode** (سنضيف Rules لاحقاً)
3. اختر الموقع الأقرب: `eur3` (أوروبا)

## الخطوة 5: تفعيل Storage

1. اذهب إلى **Storage** → **Get started**
2. ابدأ في **Test mode**
3. اختر الموقع نفسه

## الخطوة 6: تفعيل Cloud Messaging

1. اذهب إلى **Project Settings** → **Cloud Messaging**
2. فعّل **Firebase Cloud Messaging API**

## الخطوة 7: تحديث الإعدادات

في ملف `app/firebase-config.js`، استبدل:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",           // ← من Firebase Console
  authDomain: "dalil-yemen.firebaseapp.com",
  projectId: "dalil-yemen",
  storageBucket: "dalil-yemen.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
  measurementId: "G-XXXXXXXXXX"
};
```

## الخطوة 8: إضافة Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // المستخدمون
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    // الأماكن
    match /places/{placeId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth.uid == resource.data.owner;
      allow delete: if request.auth.uid == resource.data.owner;
    }

    // المراجعات
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth.uid == resource.data.userId;
      allow delete: if request.auth.uid == resource.data.userId;
    }

    // المفضلة
    match /favorites/{favId} {
      allow read, write: if request.auth != null;
    }

    // الإشعارات
    match /notifications/{notifId} {
      allow read: if request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
  }
}
```

## الخطوة 9: إضافة Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /avatars/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth.uid == userId;
    }

    match /covers/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth.uid == userId;
    }

    match /places/{placeId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## الخطوة 10: إنشاء فهارس Firestore

أضف هذه الفهارس في **Firestore Database** → **Indexes**:

| Collection | Fields | Order |
|---|---|---|
| places | isActive, createdAt | desc |
| places | isActive, category, createdAt | desc |
| places | isActive, city, createdAt | desc |
| places | owner, createdAt | desc |
| reviews | placeId, createdAt | desc |
| favorites | userId | - |
| notifications | userId, createdAt | desc |

## الخطوة 11: إضافة SDK إلى index.html

أضف قبل `<script src="app/data.js">`:

```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-storage-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js"></script>

<!-- Firebase Config -->
<script src="app/firebase-config.js"></script>
<script src="app/firebase-auth.js"></script>
<script src="app/firebase-db.js"></script>
```

## الخطوة 12: تفعيل Push Notifications

1. أنشئ ملف `firebase-messaging-sw.js` في الجذر:
```javascript
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
});

const messaging = firebase.messaging();
```

2. في **Project Settings** → **Cloud Messaging** → **Web Push certificates**
3. اضغط **Generate key pair**
4. انسخ **Key pair** وأضفه في `firebase-config.js`:
```javascript
const vapidKey = "YOUR_VAPID_KEY";
```

---

## ✅ بعد الإعداد

1. حدّث `app/firebase-config.js` بالإعدادات الحقيقية
2. ارفع الملفات إلى GitHub
3. اختبر التسجيل والدخول
4. اختبر إضافة أماكن
5. اختبر رفع الصور

---

## 📞 الدعم

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Console](https://console.firebase.google.com)
