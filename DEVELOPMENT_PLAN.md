# 🚀 خطة التطوير الشاملة - دليل اليمن
## من تطبيق عادي → منتج احترافي مدفوع

---

## 📊 الوضع الحالي vs الوضع المطلوب

| المعيار | الحالي | المطلوب |
|---|---|---|
| المنصة | Android فقط | Web + Android + iOS |
| قاعدة البيانات | Firebase (محدود) | Supabase (PostgreSQL) |
| الاستضافة | لا يوجد | Vercel (Web) |
| المصادقة | Firebase Auth + Facebook | Supabase Auth (Email, Phone, Google, Apple) |
| التصميم | عادي | احترافي (Figma) |
| الأداء | بطيء (APK كبير) | سريع (PWA + CDN) |
| الأمان | ضعيف | قوي (Row Level Security) |
| التسعير | مجاني | Freemium + اشتراكات |

---

## 🎯 المرحلة 1: البنية التحتية (Supabase + Vercel)

### 1.1 إعداد Supabase
```
المشروع/
├── supabase/
│   ├── migrations/          ← قاعدة البيانات
│   ├── functions/           ← Edge Functions
│   ├── seed.sql             ← بيانات تجريبية
│   └── config.toml
```

#### جداول قاعدة البيانات المطلوبة:

```sql
-- المستخدمون
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'business', 'admin')),
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- الأماكن / الأعمال
CREATE TABLE places (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description TEXT,
  description_ar TEXT,
  category_id UUID REFERENCES categories(id),
  city_id UUID REFERENCES cities(id),
  address TEXT,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  website TEXT,
  facebook TEXT,
  instagram TEXT,
  twitter TEXT,
  youtube TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  logo_url TEXT,
  cover_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  views_count INTEGER DEFAULT 0,
  rating_avg DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- التصنيفات
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  icon TEXT,
  parent_id UUID REFERENCES categories(id),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- المدن
CREATE TABLE cities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  region TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  is_active BOOLEAN DEFAULT true
);

-- صور الأماكن
CREATE TABLE place_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- المنتجات
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'YER',
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- المراجعات
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- الإعلانات
CREATE TABLE ads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  place_id UUID REFERENCES places(id),
  user_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  link TEXT,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  views_count INTEGER DEFAULT 0,
  clicks_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- الوظائف
CREATE TABLE jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  place_id UUID REFERENCES places(id),
  user_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  description TEXT,
  description_ar TEXT,
  location TEXT,
  salary_min DECIMAL(10,2),
  salary_max DECIMAL(10,2),
  currency TEXT DEFAULT 'YER',
  job_type TEXT CHECK (job_type IN ('full_time', 'part_time', 'contract', 'freelance')),
  is_active BOOLEAN DEFAULT true,
  applications_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  deadline DATE
);

-- المناسبات
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  location TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  is_free BOOLEAN DEFAULT true,
  ticket_price DECIMAL(10,2),
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- المفضلة
CREATE TABLE favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, place_id)
);

-- سجل المشاهدات
CREATE TABLE view_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  place_id UUID REFERENCES places(id),
  viewed_at TIMESTAMPTZ DEFAULT now()
);

-- العملات
CREATE TABLE currencies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  symbol TEXT,
  rate_to_yer DECIMAL(15,4),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- الأطعمة
CREATE TABLE meals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description TEXT,
  category TEXT,
  image_url TEXT,
  calories INTEGER,
  is_active BOOLEAN DEFAULT true
);

-- الباقات والاشتراكات
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  plan TEXT CHECK (plan IN ('free', 'basic', 'premium', 'enterprise')),
  status TEXT CHECK (status IN ('active', 'expired', 'cancelled')),
  start_date TIMESTAMPTZ DEFAULT now(),
  end_date TIMESTAMPTZ,
  features JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- المدفوعات
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  subscription_id UUID REFERENCES subscriptions(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'YER',
  method TEXT CHECK (method IN ('card', 'bank_transfer', 'mobile_money', 'cash')),
  status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  transaction_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- الإشعارات
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT CHECK (type IN ('info', 'promotion', 'system', 'message')),
  is_read BOOLEAN DEFAULT false,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- التقارير
CREATE TABLE reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID REFERENCES profiles(id),
  reported_type TEXT CHECK (reported_type IN ('place', 'review', 'user', 'ad')),
  reported_id UUID NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- الرسائل (دردشة)
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id),
  receiver_id UUID REFERENCES profiles(id),
  place_id UUID REFERENCES places(id),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### Row Level Security (RLS):
```sql
-- تفعيل RLS على جميع الجداول
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can view active places" ON places FOR SELECT USING (is_active = true);
CREATE POLICY "Owners can manage their places" ON places FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own favorites" ON favorites FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own messages" ON messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
```

#### Edge Functions:
```typescript
// supabase/functions/search-places/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { query, city_id, category_id, limit = 20, offset = 0 } = await req.json()
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!
  )

  let queryBuilder = supabase
    .from('places')
    .select('*, categories(*), cities(*)')
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('rating_avg', { ascending: false })
    .range(offset, offset + limit - 1)

  if (query) {
    queryBuilder = queryBuilder.or(`name.ilike.%${query}%,name_ar.ilike.%${query}%,description.ilike.%${query}%`)
  }
  if (city_id) queryBuilder = queryBuilder.eq('city_id', city_id)
  if (category_id) queryBuilder = queryBuilder.eq('category_id', category_id)

  const { data, error } = await queryBuilder

  return new Response(JSON.stringify({ data, error }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

### 1.2 إعداد Vercel
```
المشروع/
├── vercel.json
├── next.config.js
├── package.json
├── src/
│   ├── app/
│   ├── components/
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── middleware.ts
│   │   └── utils/
│   ├── hooks/
│   ├── types/
│   └── styles/
├── public/
└── .env.local
```

---

## 🎨 المرحلة 2: التصميم الاحترافي (UI/UX)

### 2.1 نظام التصميم (Design System)

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',  // اللون الرئيسي
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        accent: {
          500: '#f59e0b',  // لون مميز
          600: '#d97706',
        }
      },
      fontFamily: {
        arabic: ['Noto Kufi Arabic', 'Tajawal', 'sans-serif'],
        english: ['Inter', 'Roboto', 'sans-serif'],
      },
    },
  },
}
```

### 2.2 الصفحات المطلوبة

#### الصفحة الرئيسية (Landing Page):
```
┌─────────────────────────────────────────┐
│  🔍 ابحث عن أي مكان في اليمن            │
│  [_________________________] [بحث]       │
│                                          │
│  📍 الأقرب إليك    ⭐ الأعلى تقييماً    │
│  🆕 الأحدث        🔥 الأكثر مشاهدة      │
├─────────────────────────────────────────┤
│  📂 التصنيفات                            │
│  [مطاعم] [فنادق] [عيادات] [متاجر]       │
│  [خدمات] [تعليم] [ترفيه] [صيدليات]      │
├─────────────────────────────────────────┤
│  ⭐ أماكن مميزة                         │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       │
│  │ IMG │ │ IMG │ │ IMG │ │ IMG │       │
│  │اسم  │ │اسم  │ │اسم  │ │اسم  │       │
│  │⭐4.5│ │⭐4.8│ │⭐4.2│ │⭐4.9│       │
│  └─────┘ └─────┘ └─────┘ └─────┘       │
├─────────────────────────────────────────┤
│  🏙️ المدن                               │
│  [صنعاء] [عدن] [تعز] [الحديدة]          │
│  [إب] [حضرموت] [مأرب] [لحج]            │
├─────────────────────────────────────────┤
│  📰 أحدث الإعلانات                      │
│  💼 وظائف شاغرة                         │
│  🎉 مناسبات قادمة                       │
│  💱 أسعار الصرف                         │
├─────────────────────────────────────────┤
│  Footer: حول | تواصل | شروط | خصوصية    │
└─────────────────────────────────────────┘
```

#### صفحة تفاصيل المكان:
```
┌─────────────────────────────────────────┐
│  ← رجوع    تفاصيل المكان    ❤️ 📤       │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐    │
│  │         صورة الغلاف             │    │
│  │    ◄  ● ● ● ● ●  ►            │    │
│  └─────────────────────────────────┘    │
│                                          │
│  🏪 اسم المكان                          │
│  📍 العنوان، المدينة                     │
│  ⭐⭐⭐⭐⭐ 4.8 (125 مراجعة)              │
│  ✅ موثّق                                │
│                                          │
│  ┌──────────────────────────────────┐   │
│  │ 📞 اتصال  💬 واتساب  📍 خريطة   │   │
│  └──────────────────────────────────┘   │
│                                          │
│  📝 الوصف                                │
│  نص طويل هنا...                         │
│                                          │
│  🕐 أوقات العمل                          │
│  السبت - الخميس: 8ص - 10م               │
│                                          │
│  📸 الصور (12)                           │
│  [IMG] [IMG] [IMG] [المزيد...]           │
│                                          │
│  📦 المنتجات                             │
│  ┌─────┐ ┌─────┐ ┌─────┐                │
│  │ IMG │ │ IMG │ │ IMG │                │
│  │اسم  │ │اسم  │ │اسم  │                │
│  │سعر  │ │سعر  │ │سعر  │                │
│  └─────┘ └─────┘ └─────┘                │
│                                          │
│  ⭐ المراجعات                            │
│  ┌──────────────────────────────────┐   │
│  │ 👤 أحمد  ⭐⭐⭐⭐⭐  قبل يومين    │   │
│  │ مكان ممتاز和服务 جيدة...          │   │
│  └──────────────────────────────────┘   │
│                                          │
│  📍 على الخريطة                          │
│  ┌──────────────────────────────────┐   │
│  │         [خريطة تفاعلية]           │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## ⚡ المرحلة 3: الميزات الاحترافية

### 3.1 ميزات تجعل التطبيق "مدفوع"

#### 🔍 بحث ذكي (Smart Search)
```typescript
// بحث مع autocomplete + fuzzy matching
const search = async (query: string) => {
  // Full-text search مع PostgreSQL
  const { data } = await supabase
    .rpc('search_places', {
      search_query: query,
      match_threshold: 0.3,
      match_count: 20
    })
  return data
}
```

#### 📍 خريطة تفاعلية (Interactive Map)
```typescript
// خريطة مع clustering + geofencing
import Map, { Marker, Cluster } from '@/components/Map'

<Map
  center={[15.3694, 44.191]} // صنعاء
  zoom={12}
  places={places}
  onMarkerClick={(place) => router.push(`/places/${place.id}`)}
  showNearby={true}
  radius={5000} // 5km
/>
```

#### 📊 لوحة تحكم المالك (Owner Dashboard)
```
┌─────────────────────────────────────────┐
│  لوحة تحكم - مطعم البركة               │
├─────────────────────────────────────────┤
│  📈 الإحصائيات                          │
│  ┌────────┐ ┌────────┐ ┌────────┐      │
│  │ 1,234  │ │  456   │ │  89    │      │
│  │ مشاهدة │ │  مكالمة│ │ مراجعة │      │
│  └────────┘ └────────┘ └────────┘      │
│                                          │
│  📊 المشاهدات (رسم بياني)               │
│  ┌──────────────────────────────────┐   │
│  │     📈                           │   │
│  │   📈   📈                        │   │
│  │ 📈       📈   📈                 │   │
│  └──────────────────────────────────┘   │
│                                          │
│  ⭐ أحدث المراجعات                      │
│  • أحمد: 5 نجوم - "ممتاز"               │
│  • سارة: 4 نجوم - "جيد جداً"            │
│                                          │
│  📦 إدارة المنتجات                      │
│  [+ إضافة منتج] [تعديل] [حذف]          │
│                                          │
│  📸 إدارة الصور                          │
│  [رفع صور] [ترتيب] [حذف]               │
│                                          │
│  📝 تعديل المعلومات                      │
│  [اسم] [وصف] [هاتف] [موقع]             │
└─────────────────────────────────────────┘
```

#### 💳 نظام الاشتراكات (Subscription System)
```typescript
// الباقات
const plans = [
  {
    name: 'مجاني',
    price: 0,
    features: [
      'إضافة مكان واحد',
      'معلومات أساسية',
      '直到 5 صور',
    ]
  },
  {
    name: 'أساسي',
    price: 5000, // ريال يمني/شهر
    features: [
      '直到 5 أماكن',
      'معلومات كاملة',
      '直到 50 صورة',
      'إحصائيات أساسية',
      'شارة موثّق',
    ]
  },
  {
    name: 'مميز',
    price: 15000,
    features: [
      '直到 20 مكان',
      'صور غير محدودة',
      'إحصائيات متقدمة',
      'إعلانات مميزة',
      'شارة ذهبية',
      'دعم أولوية',
      'API access',
    ]
  },
  {
    name: 'مؤسسات',
    price: 50000,
    features: [
      'أماكن غير محدودة',
      'كل الميزات',
      'حسابات متعددة',
      'تقارير مخصصة',
      'دعم 24/7',
      'تخصيص كامل',
    ]
  }
]
```

#### 📱 إشعارات ذكية (Smart Notifications)
```typescript
// إشعارات مخصصة
const notificationTypes = {
  NEW_REVIEW: 'مراجعة جديدة على مكانك',
  NEW_MESSAGE: 'رسالة جديدة',
  PLACE_FEATURED: 'مكانك أصبح مميزاً!',
  EXPIRING_SUBSCRIPTION: 'اشتراكك ينتهي قريباً',
  NEARBY_PLACE: 'مكان جديد بالقرب منك',
  PRICE_DROP: 'خصم جديد على منتج',
  EVENT_REMINDER: 'تذكير بمناسبة قادمة',
}
```

#### 🔒 مصادقة متقدمة (Advanced Auth)
```typescript
// مصادقة متعددة
const authProviders = {
  email: true,
  phone: true,      // OTP عبر SMS
  google: true,
  apple: true,      // للمستقبل (iOS)
  facebook: true,
}

// تسجيل الدخول بالهاتف (مهم لليمن)
const signInWithPhone = async (phone: string) => {
  const { data, error } = await supabase.auth.signInWithOtp({
    phone: `+967${phone}`
  })
}
```

#### 📸 رفع صور متقدم
```typescript
// رفع صور مع ضغط + CDN
const uploadImage = async (file: File) => {
  // ضغط الصورة
  const compressed = await compressImage(file, {
    maxWidth: 1920,
    quality: 0.8,
    format: 'webp'
  })
  
  // رفع إلى Supabase Storage
  const { data } = await supabase.storage
    .from('place-images')
    .upload(`${Date.now()}-${file.name}`, compressed)
  
  return data.path
}
```

#### 💬 نظام المراسلة (Chat)
```typescript
// Real-time chat
const useChat = (placeId: string) => {
  const [messages, setMessages] = useState<Message[]>([])
  
  useEffect(() => {
    const channel = supabase
      .channel(`chat:${placeId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `place_id=eq.${placeId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new])
      })
      .subscribe()
    
    return () => { supabase.removeChannel(channel) }
  }, [placeId])
  
  return messages
}
```

#### 📊 تحليلات متقدمة (Analytics)
```typescript
// تتبع المشاهدات والتفاعلات
const trackEvent = async (event: {
  type: 'view' | 'click' | 'call' | 'whatsapp' | 'share' | 'favorite'
  placeId: string
  userId?: string
}) => {
  await supabase.from('analytics_events').insert({
    event_type: event.type,
    place_id: event.placeId,
    user_id: event.userId,
    metadata: {
      device: navigator.userAgent,
      location: await getLocation(),
      referrer: document.referrer
    }
  })
}
```

---

## 🛠️ المرحلة 4: التقنيات المطلوبة

### 4.1 Frontend (Next.js 14+)
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@supabase/supabase-js": "^2.39.0",
    "@supabase/ssr": "^0.1.0",
    "tailwindcss": "^3.4.0",
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.300.0",
    "react-hook-form": "^7.49.0",
    "zod": "^3.22.0",
    "@tanstack/react-query": "^5.17.0",
    "mapbox-gl": "^3.1.0",
    "react-map-gl": "^7.1.0",
    "recharts": "^2.10.0",
    "sonner": "^1.3.0",
    "next-intl": "^3.4.0",
    "sharp": "^0.33.0"
  }
}
```

### 4.2 Backend (Supabase)
```
✅ PostgreSQL مع Full-Text Search
✅ Real-time subscriptions
✅ Row Level Security
✅ Edge Functions
✅ Storage مع CDN
✅ Auth (Email, Phone, Google)
✅ Vector embeddings (للبحث الذكي)
```

### 4.3 Deployment (Vercel)
```
✅ Edge Runtime
✅ ISR (Incremental Static Regeneration)
✅ Image Optimization
✅ Analytics
✅ Speed Insights
✅ Preview Deployments
```

---

## 💰 المرحلة 5: نموذج الإيرادات

### 5.1 مصادر الدخل

| المصدر | الوصف | السعر |
|---|---|---|
| **اشتراكات الأعمال** | باقات شهرية/سنوية | 5,000 - 50,000 YER/شهر |
| **إعلانات مميزة** | ظهور في أعلى النتائج | 2,000 YER/يوم |
| **شارات التوثيق** | علامة موثّق للأماكن | 10,000 YER/سنة |
| **إعلانات Google AdMob** | إعلانات في التطبيق | حسب المشاهدات |
| **API Access** | وصول للبيانات | 100,000 YER/شهر |
| **تقارير مخصصة** | تحليلات للشركات | 25,000 YER/تقرير |

### 5.2 باقات الاشتراك

```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│   مجاني     │   أساسي     │   مميز      │  مؤسسات    │
│   0 YER     │ 5,000 YER   │ 15,000 YER  │ 50,000 YER  │
├─────────────┼─────────────┼─────────────┼─────────────┤
│ مكان واحد   │ 5 أماكن     │ 20 مكان     │ غير محدود   │
│ 5 صور       │ 50 صورة     │ غير محدود   │ غير محدود   │
│ معلومات     │ كاملة       │ كاملة       │ كاملة       │
│ أساسية      │ إحصائيات    │ متقدمة      │ مخصصة       │
│ ❌          │ ✅ شارة     │ ✅ ذهبية    │ ✅ ماسي     │
│ ❌          │ ❌          │ ✅ إعلانات  │ ✅ مميزة    │
│ ❌          │ ❌          │ ❌          │ ✅ API      │
│ ❌          │ ❌          │ ❌          │ ✅ 24/7     │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

---

## 📋 قائمة المهام (TODO)

### 🔴 عاجل (الأسبوع 1-2):
- [ ] إنشاء مشروع Next.js 14
- [ ] إعداد Supabase (Auth + DB + Storage)
- [ ] تصميم قاعدة البيانات
- [ ] صفحة Landing Page
- [ ] نظام المصادقة (Email + Phone)
- [ ] صفحة البحث مع فلاتر

### 🟡 مهم (الأسبوع 3-4):
- [ ] صفحة تفاصيل المكان
- [ ] نظام المراجعات
- [ ] نظام المفضلة
- [ ] خريطة تفاعلية
- [ ] لوحة تحكم المالك
- [ ] رفع الصور

### 🟢 تحسين (الأسبوع 5-6):
- [ ] نظام الاشتراكات
- [ ] الدفع الإلكتروني
- [ ] الإشعارات
- [ ] نظام المراسلة
- [ ] التحليلات
- [ ] SEO Optimization

### 🔵 متقدم (الأسبوع 7-8):
- [ ] PWA (Progressive Web App)
- [ ] Multi-language (AR/EN)
- [ ] Dark Mode
- [ ] Offline Support
- [ ] Push Notifications
- [ ] Admin Dashboard

---

## 🎯 ملخص الميزات الاحترافية

### ميزات تجعل التطبيق "مدفوع":
1. ✅ بحث ذكي مع autocomplete
2. ✅ خريطة تفاعلية مع clustering
3. ✅ لوحة تحكم للمالكين
4. ✅ إحصائيات متقدمة
5. ✅ نظام اشتراكات
6. ✅ دفع إلكتروني
7. ✅ إشعارات ذكية
8. ✅ محادثات مباشرة
9. ✅ توثيق الأماكن
10. ✅ إعلانات مميزة
11. ✅ تقارير مخصصة
12. ✅ API مفتوح
13. ✅ تطبيق PWA
14. ✅ دعم متعدد اللغات
15. ✅ وضع مظلم

---

## 🚀 البدء الفوري

```bash
# 1. إنشاء مشروع Next.js
npx create-next-app@latest dalil-yemen --typescript --tailwind --app

# 2. تثبيت المكتبات
cd dalil-yemen
npm install @supabase/supabase-js @supabase/ssr
npm install framer-motion lucide-react react-hook-form zod
npm install @tanstack/react-query mapbox-gl react-map-gl
npm install recharts sonner next-intl sharp

# 3. إعداد Supabase
npx supabase init
npx supabase link --project-ref YOUR_PROJECT_REF

# 4. تشغيل التطبيق
npm run dev
```

---

**النتيجة المتوقعة:** تطبيق يمني احترافي ينافس أكبر التطبيقات العربية مثل "دلّي" و"يان دليل" مع ميزات فريدة تناسب السوق اليمني.
