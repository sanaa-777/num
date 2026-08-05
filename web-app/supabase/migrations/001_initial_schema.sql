-- =============================================
-- دليل اليمن - قاعدة البيانات
-- Migration 001: Initial Schema
-- =============================================

-- تفعيل UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- للبحث النصي

-- =============================================
-- المستخدمون
-- =============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'business', 'admin')),
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- التصنيفات
-- =============================================
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  icon TEXT,
  parent_id UUID REFERENCES categories(id),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- المدن
-- =============================================
CREATE TABLE cities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  region TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- الأماكن / الأعمال
-- =============================================
CREATE TABLE places (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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

-- =============================================
-- صور الأماكن
-- =============================================
CREATE TABLE place_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- المنتجات
-- =============================================
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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

-- =============================================
-- المراجعات
-- =============================================
CREATE TABLE reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- الإعلانات
-- =============================================
CREATE TABLE ads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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

-- =============================================
-- الوظائف
-- =============================================
CREATE TABLE jobs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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
  deadline DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- المناسبات
-- =============================================
CREATE TABLE events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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

-- =============================================
-- المفضلة
-- =============================================
CREATE TABLE favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, place_id)
);

-- =============================================
-- سجل المشاهدات
-- =============================================
CREATE TABLE view_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  place_id UUID REFERENCES places(id),
  viewed_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- العملات
-- =============================================
CREATE TABLE currencies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  symbol TEXT,
  rate_to_yer DECIMAL(15,4),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- الأطعمة
-- =============================================
CREATE TABLE meals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description TEXT,
  category TEXT,
  image_url TEXT,
  calories INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- الباقات والاشتراكات
-- =============================================
CREATE TABLE subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  plan TEXT CHECK (plan IN ('free', 'basic', 'premium', 'enterprise')),
  status TEXT CHECK (status IN ('active', 'expired', 'cancelled')),
  start_date TIMESTAMPTZ DEFAULT now(),
  end_date TIMESTAMPTZ,
  features JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- المدفوعات
-- =============================================
CREATE TABLE payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  subscription_id UUID REFERENCES subscriptions(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'YER',
  method TEXT CHECK (method IN ('card', 'bank_transfer', 'mobile_money', 'cash')),
  status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  transaction_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- الإشعارات
-- =============================================
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT CHECK (type IN ('info', 'promotion', 'system', 'message')),
  is_read BOOLEAN DEFAULT false,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- التقارير
-- =============================================
CREATE TABLE reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reporter_id UUID REFERENCES profiles(id),
  reported_type TEXT CHECK (reported_type IN ('place', 'review', 'user', 'ad')),
  reported_id UUID NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- الرسائل
-- =============================================
CREATE TABLE messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id),
  receiver_id UUID REFERENCES profiles(id),
  place_id UUID REFERENCES places(id),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- البحث النصي الكامل
-- =============================================
ALTER TABLE places ADD COLUMN search_vector tsvector;

CREATE OR REPLACE FUNCTION places_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('arabic', COALESCE(NEW.name_ar, '')), 'A') ||
    setweight(to_tsvector('arabic', COALESCE(NEW.description_ar, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW.name, '')), 'C') ||
    setweight(to_tsvector('simple', COALESCE(NEW.description, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER places_search_vector_trigger
  BEFORE INSERT OR UPDATE ON places
  FOR EACH ROW EXECUTE FUNCTION places_search_vector_update();

CREATE INDEX places_search_idx ON places USING gin(search_vector);

-- =============================================
-- الفهارس
-- =============================================
CREATE INDEX idx_places_category ON places(category_id);
CREATE INDEX idx_places_city ON places(city_id);
CREATE INDEX idx_places_owner ON places(owner_id);
CREATE INDEX idx_places_rating ON places(rating_avg DESC);
CREATE INDEX idx_places_featured ON places(is_featured) WHERE is_featured = true;
CREATE INDEX idx_places_active ON places(is_active) WHERE is_active = true;
CREATE INDEX idx_reviews_place ON reviews(place_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_place ON favorites(place_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id, is_read);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

-- =============================================
-- Row Level Security (RLS)
-- =============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- سياسات الملفات الشخصية
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- سياسات الأماكن
CREATE POLICY "Places are viewable by everyone" ON places FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can create places" ON places FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Owners can update own places" ON places FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owners can delete own places" ON places FOR DELETE USING (auth.uid() = owner_id);

-- سياسات المراجعات
CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);

-- سياسات المفضلة
CREATE POLICY "Users can view own favorites" ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own favorites" ON favorites FOR ALL USING (auth.uid() = user_id);

-- سياسات الرسائل
CREATE POLICY "Users can view own messages" ON messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- سياسات الإشعارات
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- Functions
-- =============================================

-- دالة البحث
CREATE OR REPLACE FUNCTION search_places(
  search_query TEXT,
  city_filter UUID DEFAULT NULL,
  category_filter UUID DEFAULT NULL,
  result_limit INTEGER DEFAULT 20,
  result_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  name_ar TEXT,
  description TEXT,
  city_name TEXT,
  category_name TEXT,
  rating DECIMAL,
  rating_count INTEGER,
  logo_url TEXT,
  relevance REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.name_ar,
    p.description,
    c.name_ar as city_name,
    cat.name_ar as category_name,
    p.rating_avg,
    p.rating_count,
    p.logo_url,
    ts_rank(p.search_vector, websearch_to_tsquery('arabic', search_query)) as relevance
  FROM places p
  LEFT JOIN cities c ON p.city_id = c.id
  LEFT JOIN categories cat ON p.category_id = cat.id
  WHERE 
    p.is_active = true
    AND (
      search_query IS NULL 
      OR p.search_vector @@ websearch_to_tsquery('arabic', search_query)
      OR p.name_ar ILIKE '%' || search_query || '%'
      OR p.name ILIKE '%' || search_query || '%'
    )
    AND (city_filter IS NULL OR p.city_id = city_filter)
    AND (category_filter IS NULL OR p.category_id = category_filter)
  ORDER BY 
    p.is_featured DESC,
    relevance DESC,
    p.rating_avg DESC
  LIMIT result_limit
  OFFSET result_offset;
END;
$$ LANGUAGE plpgsql;

-- دالة تحديث متوسط التقييم
CREATE OR REPLACE FUNCTION update_place_rating()
RETURNS trigger AS $$
BEGIN
  UPDATE places
  SET 
    rating_avg = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE place_id = NEW.place_id AND is_active = true),
    rating_count = (SELECT COUNT(*) FROM reviews WHERE place_id = NEW.place_id AND is_active = true),
    updated_at = now()
  WHERE id = NEW.place_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_place_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_place_rating();

-- دالة إنشاء ملف شخصي تلقائياً
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
