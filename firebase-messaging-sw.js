// =============================================
// Firebase Cloud Messaging Service Worker
// =============================================
// ⚠️ استبدل هذه القيم بإعدادات مشروعك

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

// معالجة الإشعارات في الخلفية
messaging.onBackgroundMessage((payload) => {
  console.log('Background message:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || '/manifest.json',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// النقر على الإشعار
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // إذا كانت نافذة مفتوحة، انتقل إليها
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        // إذا لم تكن هناك نافذة مفتوحة، افتح واحدة جديدة
        return clients.openWindow(urlToOpen);
      })
  );
});
