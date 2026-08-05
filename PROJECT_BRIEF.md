# 📋 مشروع الدليل اليمني التجاري - دليل للمطور

## معلومات المشروع

| البند | القيمة |
|-------|--------|
| **اسم المشروع** | الدليل اليمني التجاري |
| **رابط المستودع** | https://github.com/sanaa-777/num |
| **رابط الموقع** | https://dalil-yemen-deel.web.app |
| **رابط الإدارة** | https://dalil-yemen-deel.web.app/admin.html |
| **Firebase Project ID** | deel-39f2e |
| **Hosting Site** | dalil-yemen-deel |

---

## هيكل المشروع

```
num/
├── index.html              # الصفحة الرئيسية
├── admin.html              # لوحة الإدارة
├── about.html              # صفحة من نحن
├── privacy.html            # سياسة الخصوصية
├── firebase.json           # إعدادات Firebase Hosting
├── firestore.rules         # قواعد أمان Firestore
├── firestore.indexes.json  # فهرس Firestore
├── storage.rules           # قواعد Storage
├── .firebaserc             # ربط مشروع Firebase
├── app/
│   ├── app.js              # التطبيق الرئيسي (80KB)
│   ├── data.js             # البيانات (أقسام، مدن، أماكن)
│   ├── auth.js             # نظام المصادقة
│   ├── admin.js            # لوحة الإدارة
│   ├── ads.js              # نظام الإعلانات
│   ├── firebase-config.js  # إعدادات Firebase
│   ├── firebase-auth.js    # Firebase Authentication
│   ├── firebase-db.js      # Firebase Firestore
│   └── styles.css          # الأنماط الرئيسية
└── .github/
    └── workflows/
        └── firebase-deploy.yml  # Auto-deploy
```

---

## التقنيات المستخدمة

| التقنية | الاستخدام |
|---------|----------|
| **HTML/CSS/JS** | بدون إطار عمل (Vanilla) |
| **Tailwind CSS** | CDN - تصميم الواجهة |
| **Firebase Auth** | تسجيل الدخول (Email/Password) |
| **Firestore** | قاعدة البيانات |
| **Firebase Hosting** | استضافة الموقع |
| **Leaflet.js** | الخرائط التفاعلية |
| **Lucide Icons** | الأيقونات |
| **GitHub Actions** | نشر تلقائي |

---

## الميزات الحالية

### الرئيسية
- ✅ عرض الأقسام الرئيسية والفروع
- ✅ بحث عن الأماكن والخدمات
- ✅ فلتر حسب المدينة (في كل قسم)
- ✅ عرض تفصيلي لكل نشاط تجاري
- ✅ نظام تقييم ومراجعات
- ✅ مشاركة عبر واتساب وتيليجرام وفيسبوك
- ✅ نظام مفضلة
- ✅ عداد مشاهدات

### نموذج إضافة نشاط
- ✅ حقول: اسم، قسم، قسم فرعي، مدينة، وصف، عنوان
- ✅ هاتف وواتساب والبريد الإلكتروني
- ✅ رفع صور
- ✅ **خريطة تفاعلية** (اختياري) - وضع دبوس موقع
- ✅ **روابط تواصل اجتماعي** (اختياري): فيسبوك، انستجرام، تلجرام، موقع إلكتروني
- ✅ **تحقق من الحقول** - حدود حمراء للحقول الفارغة

### لوحة الإدارة
- ✅ إدارة الأماكن (موافقة، رفض، حذف)
- ✅ إدارة المستخدمين
- ✅ إدارة الإعلانات
- ✅ إشعارات

### الأداء
- ✅ تحميل سريع (defer للسكريبتات)
- ✅ Cache headers محسّنة
- ✅ Lazy loading للصور
- ✅ متوافق مع الإنترنت البطيء (3G)

---

## كيفية العمل على المشروع

### 1. استنساخ المستودع
```bash
git clone https://github.com/sanaa-777/num.git
cd num
```

### 2. التعديل والاختبار
- عدّل الملفات مباشرة (لا يحتاج npm install)
- افتح `index.html` في المتصفح للاختبار المحلي

### 3. رفع التعديلات
```bash
git add .
git commit -m "وصف التعديل"
git push origin main
```
**النشر تلقائي** عبر GitHub Actions ← Firebase Hosting

---

## بنية البيانات (Firestore)

### الأماكن (places)
```javascript
{
  id: "auto",
  name: "اسم المكان",
  category: "cat_id",
  subcategory: "sub_id",
  city: "city_id",
  description: "وصف",
  address: "العنوان",
  phone: "777123456",
  whatsapp: "777123456",
  email: "info@example.com",
  facebook: "https://facebook.com/...",
  instagram: "https://instagram.com/...",
  telegram: "https://t.me/...",
  website: "https://example.com",
  lat: "15.3694",
  lng: "44.191",
  images: ["url1", "url2"],
  owner: "user_uid",
  verified: false,
  featured: false,
  rating: 4.5,
  reviews: 12,
  views: 150,
  createdAt: timestamp
}
```

### المستخدمون (users)
```javascript
{
  id: "uid",
  name: "الاسم",
  email: "email@example.com",
  phone: "777123456",
  avatar: "url",
  role: "user", // أو "admin"
  bio: "نبذة",
  createdAt: timestamp
}
```

---

## ملاحظات مهمة

### ⚠️ لا تعمل على
- **Project ID** (`deel-39f2e`) - لا يمكن تغييره
- **Firebase API Key** - موجود في `app/firebase-config.js`

### ✅ يمكنك التعديل على
- جميع ملفات `app/`
- `index.html`, `admin.html`
- `firebase.json`, `firestore.rules`
- `styles.css`

### 🔐 للوصول الكامل (Firebase CLI)
تحتاج ملف Service Account:
```
deel-39f2e-firebase-adminsdk-fbsvc-*.json
```

---

## التواصل

للاستفسارات أو طلب التعديلات:
- **GitHub Issues**: https://github.com/sanaa-777/num/issues
- **الرابط المباشر**: https://dalil-yemen-deel.web.app

---

*آخر تحديث: 2026-08-06*
