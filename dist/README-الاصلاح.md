# تقرير إصلاح APK - دليل اليمن

## 📁 الملفات
- `dalil-al-yemen-4.2.31.apk` - الأصلي (15MB)
- `dalil-al-yemen-4.2.31-cleaned.apk` - النظيف (13MB)

## ✅ ما تم إصلاحه

### 1. إزالة المكتبات غير الضرورية
- ❌ Google Play Services بالكامل
- ❌ Google AdMob (إعلانات)
- ❌ Google Maps API Key
- ❌ Facebook SDK
- ❌ OneSignal (إشعارات)
- ❌ Firebase Auth/Crashlytics/Analytics/Firestore
- ❌ Google Data Transport
- ❌ Google Play Core

### 2. تقليل الأذونات
- **قبل:** 38 إذن
- **بعد:** 13 إذن فقط

### 3. تحسين الأمان
- تعطيل cleartext traffic (عدا yemendirectory.net)
- إزالة مفاتيح API المكشوفة

### 4. توقيع APK
- تمتوقيع APK بشهادة self-signed
- صالح للتثبيت على الأجهزة

## ⚠️ ملاحظات مهمة

### ما قد لا يعمل:
1. **تسجيل الدخول عبر Facebook** - Facebook SDK مزال
2. **الخرائط** - Google Maps API Key مزال
3. **الإعلانات** - AdMob مزال
4. **الإشعارات** - OneSignal/FCM مزال
5. **تتبع الأخطاء** - Firebase Crashlytics مزال

### ما يعمل:
1. ✅ تصفح الأماكن والأعمال
2. ✅ البحث
3. ✅ عرض التفاصيل
4. ✅ الاتصال الهاتفي
5. ✅ فتح خرائط Google (externally)
6. ✅ فتح WhatsApp
7. ✅ عرض الصور

## 📱 كيفية التثبيت

1. انسخ `dalil-al-yemen-4.2.31-cleaned.apk` إلى هاتفك
2. فعّل "مصادر غير معروفة" في الإعدادات
3. اضغط على الملف للتثبيت

## 🔧 للتطوير المستمر

إذا أردت إعادة بناء التطبيق مع Google Play Services:
1. استخدم الكود المصدري الأصلي
2. أضف Google Play Services dependencies
3. أضف Facebook SDK
4. أضف OneSignal
5. أضف Firebase
6. أضف مفاتيح API
