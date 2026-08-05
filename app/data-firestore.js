// =============================================
// Data Store - Firestore Backend
// يحل محل data.js القديم (localStorage)
// =============================================

const I = (name, cls = 'icon-md') => `<i data-lucide="${name}" class="${cls}"></i>`;
const IB = (name, color, cls = 'icon-lg') => `<div class="cat-icon" style="background:${color}15"><i data-lucide="${name}" class="${cls}" style="color:${color}"></i></div>`;
const IBS = (name, color, cls = 'icon-md') => `<div class="cat-icon-sm" style="background:${color}15"><i data-lucide="${name}" class="${cls}" style="color:${color}"></i></div>`;

const Data = {
  // ====== التصنيفات (ثابتة - لا تتغير) ======
  categories: [
    {
      id: 'cat_1', name: 'الصحة والطب', icon: 'heart-pulse', color: '#10b981',
      subs: [
        { id: 'sub_1_1', name: 'مستشفيات', icon: 'hospital' },
        { id: 'sub_1_2', name: 'عيادات طبية', icon: 'stethoscope' },
        { id: 'sub_1_3', name: 'صيدليات', icon: 'pill' },
        { id: 'sub_1_4', name: 'مختبرات طبية', icon: 'flask-conical' },
        { id: 'sub_1_5', name: 'مراكز أشعة', icon: 'scan' },
        { id: 'sub_1_6', name: 'طب الأسنان', icon: 'smile' },
        { id: 'sub_1_7', name: 'طب العيون', icon: 'eye' },
        { id: 'sub_1_8', name: 'علاج طبيعي', icon: 'accessibility' },
        { id: 'sub_1_9', name: 'صحة نفسية', icon: 'brain' },
        { id: 'sub_1_10', name: 'طب الأطفال', icon: 'baby' },
        { id: 'sub_1_11', name: 'نساء وتوليد', icon: 'heart-handshake' },
        { id: 'sub_1_12', name: 'جراحة عامة', icon: 'scissors' },
        { id: 'sub_1_13', name: 'طب الجلدية', icon: 'shield-check' },
        { id: 'sub_1_14', name: 'طب القلب', icon: 'heart' },
        { id: 'sub_1_15', name: 'تحاليل طبية', icon: 'test-tubes' },
        { id: 'sub_1_16', name: 'إسعاف', icon: 'siren' },
      ]
    },
    {
      id: 'cat_2', name: 'المطاعم والمقاهي', icon: 'utensils', color: '#ef4444',
      subs: [
        { id: 'sub_2_1', name: 'مطاعم يمنية', icon: 'soup' },
        { id: 'sub_2_2', name: 'مطاعم عربية', icon: 'salad' },
        { id: 'sub_2_3', name: 'مطاعم بحرية', icon: 'fish' },
        { id: 'sub_2_4', name: 'وجبات سريعة', icon: 'sandwich' },
        { id: 'sub_2_5', name: 'بيتزا وإيطالي', icon: 'pizza' },
        { id: 'sub_2_6', name: 'مطاعم هندية', icon: 'cooking-pot' },
        { id: 'sub_2_7', name: 'مطاعم تركية', icon: 'beef' },
        { id: 'sub_2_8', name: 'كافيهات', icon: 'coffee' },
        { id: 'sub_2_9', name: 'عصائر وسموذي', icon: 'cup-soda' },
        { id: 'sub_2_10', name: 'حلويات', icon: 'cake' },
        { id: 'sub_2_11', name: 'آيس كريم', icon: 'ice-cream' },
        { id: 'sub_2_12', name: 'شاورما ومشويات', icon: 'flame' },
        { id: 'sub_2_13', name: 'مطاعم صينية', icon: 'cherry' },
        { id: 'sub_2_14', name: 'مطاعم يابانية', icon: 'fish' },
        { id: 'sub_2_15', name: 'مخبوزات', icon: 'croissant' },
        { id: 'sub_2_16', name: 'توصيل طعام', icon: 'truck' },
      ]
    },
    {
      id: 'cat_3', name: 'الفنادق والسياحة', icon: 'building-2', color: '#8b5cf6',
      subs: [
        { id: 'sub_3_1', name: 'فنادق', icon: 'hotel' },
        { id: 'sub_3_2', name: 'شقق فندقية', icon: 'building' },
        { id: 'sub_3_3', name: 'منتجعات', icon: 'palmtree' },
        { id: 'sub_3_4', name: 'نزل وبيت ضيافة', icon: 'home' },
        { id: 'sub_3_5', name: 'مكاتب سفر', icon: 'plane' },
        { id: 'sub_3_6', name: 'سياحة ورحلات', icon: 'map' },
        { id: 'sub_3_7', name: 'تأجير سيارات', icon: 'car' },
        { id: 'sub_3_8', name: 'مخيمات', icon: 'tent' },
        { id: 'sub_3_9', name: 'حجز طيران', icon: 'plane-takeoff' },
        { id: 'sub_3_10', name: 'شاليهات', icon: 'cabin' },
      ]
    },
    {
      id: 'cat_4', name: 'التعليم والتدريب', icon: 'graduation-cap', color: '#ec4899',
      subs: [
        { id: 'sub_4_1', name: 'جامعات', icon: 'landmark' },
        { id: 'sub_4_2', name: 'مدارس', icon: 'school' },
        { id: 'sub_4_3', name: 'رياض أطفال', icon: 'baby' },
        { id: 'sub_4_4', name: 'مراكز تدريب', icon: 'presentation' },
        { id: 'sub_4_5', name: 'معاهد لغات', icon: 'languages' },
        { id: 'sub_4_6', name: 'مكتبات', icon: 'library' },
        { id: 'sub_4_7', name: 'تعليم إلكتروني', icon: 'monitor' },
        { id: 'sub_4_8', name: 'دروس خصوصية', icon: 'book-open' },
        { id: 'sub_4_9', name: 'تعليم خاص', icon: 'heart' },
        { id: 'sub_4_10', name: 'معاهد حاسب', icon: 'laptop' },
        { id: 'sub_4_11', name: 'تدريب مهني', icon: 'wrench' },
      ]
    },
    {
      id: 'cat_5', name: 'التجارة والأسواق', icon: 'shopping-bag', color: '#3b82f6',
      subs: [
        { id: 'sub_5_1', name: 'سوبر ماركت', icon: 'shopping-cart' },
        { id: 'sub_5_2', name: 'مجمعات تجارية', icon: 'store' },
        { id: 'sub_5_3', name: 'ملابس رجالية', icon: 'shirt' },
        { id: 'sub_5_4', name: 'ملابس نسائية', icon: 'shirt' },
        { id: 'sub_5_5', name: 'أحذية', icon: 'footprints' },
        { id: 'sub_5_6', name: 'إلكترونيات', icon: 'smartphone' },
        { id: 'sub_5_7', name: 'أثاث ومنزل', icon: 'sofa' },
        { id: 'sub_5_8', name: 'هدايا', icon: 'gift' },
        { id: 'sub_5_9', name: 'عسل', icon: 'honey' },
        { id: 'sub_5_10', name: 'بخور وعطور', icon: 'wind' },
        { id: 'sub_5_11', name: 'ذهب ومجوهرات', icon: 'gem' },
        { id: 'sub_5_12', name: 'عطارة', icon: 'leaf' },
        { id: 'sub_5_13', name: 'أدوات منزلية', icon: 'lamp' },
        { id: 'sub_5_14', name: 'ألعاب أطفال', icon: 'puzzle' },
        { id: 'sub_5_15', name: 'كتب وقرطاسية', icon: 'pen-tool' },
        { id: 'sub_5_16', name: 'مستلزمات رياضية', icon: 'dumbbell' },
      ]
    },
    {
      id: 'cat_6', name: 'الخدمات', icon: 'wrench', color: '#6366f1',
      subs: [
        { id: 'sub_6_1', name: 'كهرباء', icon: 'zap' },
        { id: 'sub_6_2', name: 'سباكة', icon: 'droplets' },
        { id: 'sub_6_3', name: 'نجارة', icon: 'hammer' },
        { id: 'sub_6_4', name: 'دهانات', icon: 'paintbrush' },
        { id: 'sub_6_5', name: 'نقل أثاث', icon: 'truck' },
        { id: 'sub_6_6', name: 'غسيل سيارات', icon: 'car' },
        { id: 'sub_6_7', name: 'مغاسل ملابس', icon: 'shirt' },
        { id: 'sub_6_8', name: 'حلاقة رجال', icon: 'scissors' },
        { id: 'sub_6_9', name: 'حلاقة نساء', icon: 'scissors' },
        { id: 'sub_6_10', name: 'طباعة ونسخ', icon: 'printer' },
        { id: 'sub_6_11', name: 'تصوير فوتوغرافي', icon: 'camera' },
        { id: 'sub_6_12', name: 'خدمات توصيل', icon: 'bike' },
        { id: 'sub_6_13', name: 'مكافحة حشرات', icon: 'bug' },
        { id: 'sub_6_14', name: 'تنظيف', icon: 'sparkles' },
        { id: 'sub_6_15', name: 'حدائق', icon: 'trees' },
        { id: 'sub_6_16', name: 'تسليك مجاري', icon: 'droplets' },
      ]
    },
    {
      id: 'cat_7', name: 'السيارات', icon: 'car', color: '#f97316',
      subs: [
        { id: 'sub_7_1', name: 'مكاتب سيارات', icon: 'building' },
        { id: 'sub_7_2', name: 'قطع غيار', icon: 'cog' },
        { id: 'sub_7_3', name: 'ورش صيانة', icon: 'wrench' },
        { id: 'sub_7_4', name: 'إطارات', icon: 'circle-dot' },
        { id: 'sub_7_5', name: 'زجاج سيارات', icon: 'square' },
        { id: 'sub_7_6', name: 'تكييف سيارات', icon: 'snowflake' },
        { id: 'sub_7_7', name: 'دهان سيارات', icon: 'paintbrush' },
        { id: 'sub_7_8', name: 'غسيل سيارات', icon: 'droplets' },
        { id: 'sub_7_9', name: 'تأجير سيارات', icon: 'key' },
        { id: 'sub_7_10', name: 'كهرباء سيارات', icon: 'zap' },
        { id: 'sub_7_11', name: 'سطحة', icon: 'truck' },
      ]
    },
    {
      id: 'cat_8', name: 'العقارات', icon: 'building-2', color: '#06b6d4',
      subs: [
        { id: 'sub_8_1', name: 'مكاتب عقارية', icon: 'building' },
        { id: 'sub_8_2', name: 'بيع أراضي', icon: 'map-pin' },
        { id: 'sub_8_3', name: 'تأجير شقق', icon: 'home' },
        { id: 'sub_8_4', name: 'بيع شقق', icon: 'building' },
        { id: 'sub_8_5', name: 'تأجير محلات', icon: 'store' },
        { id: 'sub_8_6', name: 'فلل وقصور', icon: 'castle' },
        { id: 'sub_8_7', name: 'مقاولات', icon: 'hard-hat' },
        { id: 'sub_8_8', name: 'تصميم داخلي', icon: 'palette' },
      ]
    },
    {
      id: 'cat_9', name: 'الإلكترونيات', icon: 'smartphone', color: '#0ea5e9',
      subs: [
        { id: 'sub_9_1', name: 'موبايلات', icon: 'smartphone' },
        { id: 'sub_9_2', name: 'لابتوب', icon: 'laptop' },
        { id: 'sub_9_3', name: 'تلفزيونات', icon: 'tv' },
        { id: 'sub_9_4', name: 'أجهزة لوحية', icon: 'tablet' },
        { id: 'sub_9_5', name: 'سماعات', icon: 'headphones' },
        { id: 'sub_9_6', name: 'كاميرات', icon: 'camera' },
        { id: 'sub_9_7', name: 'ألعاب فيديو', icon: 'gamepad-2' },
        { id: 'sub_9_8', name: 'صيانة إلكترونيات', icon: 'settings' },
        { id: 'sub_9_9', name: 'طباعة صور', icon: 'image' },
      ]
    },
    {
      id: 'cat_10', name: 'الجمال والعناية', icon: 'sparkles', color: '#e11d48',
      subs: [
        { id: 'sub_10_1', name: 'صالونات نساء', icon: 'scissors' },
        { id: 'sub_10_2', name: 'حلاقة رجال', icon: 'scissors' },
        { id: 'sub_10_3', name: 'عطور', icon: 'wind' },
        { id: 'sub_10_4', name: 'مستحضرات تجميل', icon: 'palette' },
        { id: 'sub_10_5', name: 'عناية بالبشرة', icon: 'sparkles' },
        { id: 'sub_10_6', name: 'عناية بالشعر', icon: 'scissors' },
        { id: 'sub_10_7', name: 'أظافر', icon: 'hand' },
        { id: 'sub_10_8', name: 'مساج وسبا', icon: 'waves' },
      ]
    },
    {
      id: 'cat_11', name: 'الرياضة', icon: 'dumbbell', color: '#22c55e',
      subs: [
        { id: 'sub_11_1', name: 'صالات رياضية', icon: 'dumbbell' },
        { id: 'sub_11_2', name: 'ملاعب', icon: 'trophy' },
        { id: 'sub_11_3', name: 'مسابح', icon: 'waves' },
        { id: 'sub_11_4', name: 'يوغا', icon: 'heart' },
        { id: 'sub_11_5', name: 'فنون قتالية', icon: 'shield' },
        { id: 'sub_11_6', name: 'معدات رياضية', icon: 'shopping-bag' },
        { id: 'sub_11_7', name: 'كرة قدم', icon: 'trophy' },
        { id: 'sub_11_8', name: 'ركض وجري', icon: 'footprints' },
      ]
    },
    {
      id: 'cat_12', name: 'الترفيه', icon: 'gamepad-2', color: '#14b8a6',
      subs: [
        { id: 'sub_12_1', name: 'مدن ألعاب', icon: 'castle' },
        { id: 'sub_12_2', name: 'سينما', icon: 'film' },
        { id: 'sub_12_3', name: 'حدائق', icon: 'trees' },
        { id: 'sub_12_4', name: 'شواطئ', icon: 'waves' },
        { id: 'sub_12_5', name: 'ملاهي', icon: 'ferris-wheel' },
        { id: 'sub_12_6', name: 'بلايستيشن', icon: 'gamepad-2' },
        { id: 'sub_12_7', name: 'أندية ألعاب', icon: 'puzzle' },
      ]
    },
    {
      id: 'cat_13', name: 'القانونية', icon: 'scale', color: '#78716c',
      subs: [
        { id: 'sub_13_1', name: 'محامون', icon: 'scale' },
        { id: 'sub_13_2', name: 'استشارات قانونية', icon: 'message-circle' },
        { id: 'sub_13_3', name: 'توثيق', icon: 'file-check' },
        { id: 'sub_13_4', name: 'ترجمة معتمدة', icon: 'languages' },
      ]
    },
    {
      id: 'cat_14', name: 'المالية', icon: 'banknote', color: '#eab308',
      subs: [
        { id: 'sub_14_1', name: 'بنوك', icon: 'landmark' },
        { id: 'sub_14_2', name: 'صرافة', icon: 'arrow-left-right' },
        { id: 'sub_14_3', name: 'تأمين', icon: 'shield' },
        { id: 'sub_14_4', name: 'استثمار', icon: 'trending-up' },
      ]
    },
    {
      id: 'cat_15', name: 'العقيدة والدين', icon: 'moon', color: '#065f46',
      subs: [
        { id: 'sub_15_1', name: 'مساجد', icon: 'moon' },
        { id: 'sub_15_2', name: 'مكتبات إسلامية', icon: 'book-open' },
        { id: 'sub_15_3', name: 'تعليم قرآن', icon: 'book-open' },
        { id: 'sub_15_4', name: 'مناسبات', icon: 'calendar' },
      ]
    },
    {
      id: 'cat_16', name: 'الزراعة', icon: 'sprout', color: '#65a30d',
      subs: [
        { id: 'sub_16_1', name: 'بذور', icon: 'sprout' },
        { id: 'sub_16_2', name: 'أسمدة', icon: 'flask-conical' },
        { id: 'sub_16_3', name: 'معدات زراعية', icon: 'tractor' },
        { id: 'sub_16_4', name: 'مزراع', icon: 'cow' },
      ]
    },
    {
      id: 'cat_17', name: 'الإعلام والنشر', icon: 'newspaper', color: '#1d4ed8',
      subs: [
        { id: 'sub_17_1', name: 'صحف', icon: 'newspaper' },
        { id: 'sub_17_2', name: 'مواقع إخبارية', icon: 'globe' },
        { id: 'sub_17_3', name: 'قنوات فضائية', icon: 'satellite' },
        { id: 'sub_17_4', name: 'إذاعات', icon: 'radio' },
        { id: 'sub_17_5', name: 'طباعة ونشر', icon: 'printer' },
      ]
    },
    {
      id: 'cat_18', name: 'الصناعات', icon: 'factory', color: '#78350f',
      subs: [
        { id: 'sub_18_1', name: 'مصانع', icon: 'factory' },
        { id: 'sub_18_2', name: 'حدادة', icon: 'hammer' },
        { id: 'sub_18_3', name: 'خياطة', icon: 'scissors' },
        { id: 'sub_18_4', name: 'نجارة', icon: 'axe' },
        { id: 'sub_18_5', name: 'خزف', icon: 'palette' },
      ]
    },
    {
      id: 'cat_19', name: 'تنسيقات أعراس', icon: 'heart', color: '#e11d48',
      subs: [
        { id: 'sub_19_1', name: 'كوش', icon: 'crown' },
        { id: 'sub_19_2', name: 'فنانين', icon: 'mic' },
        { id: 'sub_19_3', name: 'صالات أعراس', icon: 'building-2' },
        { id: 'sub_19_4', name: 'فساتين زفاف', icon: 'shirt' },
        { id: 'sub_19_5', name: 'لبس رجالي', icon: 'user' },
        { id: 'sub_19_6', name: 'سماعات & زينة', icon: 'speaker' },
        { id: 'sub_19_7', name: 'مراكز تجهيز أعراس', icon: 'sparkles' },
      ]
    },
  ],

  // ====== بيانات افتراضية (fallback) ======
  defaultPlaces: [
    { id: 'p_1', name: 'مستشفى الثورة', category: 'cat_1', subcategory: 'sub_1_1', city: 'city_1', description: 'مستشفى حكومي كبير. طوارئ 24 ساعة.', phone: '777111222', address: 'شارع الستين، صنعاء', verified: true, featured: true, isActive: true, status: 'approved', views: 8900, reviews: 156, rating: 4.2, owner: 'system' },
    { id: 'p_2', name: 'مطعم البركة', category: 'cat_2', subcategory: 'sub_2_1', city: 'city_1', description: 'مطعم يمني تقليدي. مندي، مظبي، حنيذ.', phone: '777222333', address: 'شارع الزبيري، صنعاء', verified: true, featured: true, isActive: true, status: 'approved', views: 12500, reviews: 312, rating: 4.8, owner: 'system' },
    { id: 'p_3', name: 'فندق القصر', category: 'cat_3', subcategory: 'sub_3_1', city: 'city_2', description: 'فندق 4 نجوم. إطلالة بحرية.', phone: '777333444', address: 'كريتر، عدن', verified: true, featured: true, isActive: true, status: 'approved', views: 7600, reviews: 189, rating: 4.6, owner: 'system' },
    { id: 'p_4', name: 'صيدلية الحياة', category: 'cat_1', subcategory: 'sub_1_3', city: 'city_1', description: 'صيدلية شاملة 24 ساعة.', phone: '777444555', address: 'شارع الستين، صنعاء', verified: true, featured: false, isActive: true, status: 'approved', views: 5400, reviews: 98, rating: 4.7, owner: 'system' },
    { id: 'p_5', name: 'مجمع التسوق الحديث', category: 'cat_5', subcategory: 'sub_5_2', city: 'city_1', description: 'أكبر مجمع تجاري في صنعاء.', phone: '777555666', address: 'شارع الربات، صنعاء', verified: true, featured: true, isActive: true, status: 'approved', views: 18000, reviews: 420, rating: 4.5, owner: 'system' },
  ],

  // ====== المدن ======
  cities: [
    { id: 'city_1', name: 'صنعاء' }, { id: 'city_2', name: 'عدن' }, { id: 'city_3', name: 'تعز' },
    { id: 'city_4', name: 'الحديدة' }, { id: 'city_5', name: 'إب' }, { id: 'city_6', name: 'حضرموت' },
    { id: 'city_7', name: 'مأرب' }, { id: 'city_8', name: 'لحج' }, { id: 'city_9', name: 'الضالع' },
    { id: 'city_10', name: 'شبوة' }, { id: 'city_11', name: 'المهرة' }, { id: 'city_12', name: 'حجة' },
    { id: 'city_13', name: 'عمران' }, { id: 'city_14', name: 'صعدة' }, { id: 'city_15', name: 'الجوف' },
    { id: 'city_16', name: 'ذمار' }, { id: 'city_17', name: 'البيضاء' }, { id: 'city_18', name: 'أبين' },
    { id: 'city_19', name: 'المحويت' }, { id: 'city_20', name: 'سقطرى' }, { id: 'city_21', name: 'ريمة' },
  ],

  // ====== cache محلي للأداء ======
  _placesCache: null,
  _placesCacheTime: 0,
  _CACHE_TTL: 60000, // دقيقة واحدة

  // ====== الأماكن (Firestore) ======
  async getPlaces() {
    const now = Date.now();
    if (this._placesCache && (now - this._placesCacheTime) < this._CACHE_TTL) {
      return this._placesCache;
    }
    try {
      // محاولة مع orderBy أولاً
      let snapshot;
      try {
        snapshot = await db.collection('places')
          .where('isActive', '==', true)
          .orderBy('createdAt', 'desc')
          .get();
      } catch(idxErr) {
        // إذا فشل بسبب عدم وجود index، جرب بدون orderBy
        console.log('Falling back to query without orderBy');
        snapshot = await db.collection('places')
          .where('isActive', '==', true)
          .get();
      }
      this._placesCache = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      this._placesCacheTime = now;
      return this._placesCache;
    } catch (e) {
      console.error('getPlaces error:', e);
      // استخدام البيانات الافتراضية كحل أخير
      if (!this._placesCache || this._placesCache.length === 0) {
        this._placesCache = this.defaultPlaces || [];
      }
      return this._placesCache;
    }
  },

  // نسخة متزامنة للتوافق مع الكود القديم (تقرأ من cache)
  getPlacesSync() {
    return this._placesCache || [];
  },

  // الأماكن المعتمدة فقط
  async getApprovedPlaces() {
    const places = await this.getPlaces();
    return places.filter(p => p.status === 'approved' || !p.status);
  },

  // الأماكن المعلقة
  async getPendingPlaces() {
    const places = await this.getPlaces();
    return places.filter(p => p.status === 'pending');
  },

  // الأماكن المرفوضة
  async getRejectedPlaces() {
    const places = await this.getPlaces();
    return places.filter(p => p.status === 'rejected');
  },

  // تحديث حالة المكان
  async updatePlaceStatus(placeId, status, adminNote) {
    try {
      await db.collection('places').doc(placeId).update({
        status: status,
        adminNote: adminNote || '',
        reviewedAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      this._invalidateCache();
      return true;
    } catch (e) {
      console.error('updatePlaceStatus error:', e);
      return false;
    }
  },

  // إضافة مكان جديد
  async addPlace(place) {
    try {
      const docRef = await db.collection('places').add({
        ...place,
        verified: false,
        featured: false,
        isActive: true,
        status: 'pending',
        views: 0,
        reviews: 0,
        rating: 0,
        adminNote: '',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      this._invalidateCache();
      return { id: docRef.id, ...place };
    } catch (e) {
      console.error('addPlace error:', e);
      throw e;
    }
  },

  // حذف مكان
  async deletePlace(id) {
    try {
      await db.collection('places').doc(id).update({
        isActive: false,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      this._invalidateCache();
    } catch (e) {
      console.error('deletePlace error:', e);
    }
  },

  // تحديث مكان
  async updatePlace(id, data) {
    try {
      await db.collection('places').doc(id).update({
        ...data,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      this._invalidateCache();
    } catch (e) {
      console.error('updatePlace error:', e);
    }
  },

  // جلب مكان واحد
  async getPlace(id) {
    try {
      const doc = await db.collection('places').doc(id).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    } catch (e) {
      console.error('getPlace error:', e);
      return null;
    }
  },

  // زيادة المشاهدات
  async incrementViews(id) {
    try {
      await db.collection('places').doc(id).update({
        views: firebase.firestore.FieldValue.increment(1)
      });
    } catch (e) {
      console.error('incrementViews error:', e);
    }
  },

  // إبطال cache
  _invalidateCache() {
    this._placesCache = null;
    this._placesCacheTime = 0;
  },

  // ====== المفضلة (Firestore) ======
  async toggleFavorite(userId, placeId) {
    try {
      const favId = `${userId}_${placeId}`;
      const favRef = db.collection('favorites').doc(favId);
      const doc = await favRef.get();
      if (doc.exists) {
        await favRef.delete();
        return false;
      } else {
        await favRef.set({
          userId, placeId,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return true;
      }
    } catch (e) {
      console.error('toggleFavorite error:', e);
      return false;
    }
  },

  async isFavorite(userId, placeId) {
    try {
      const doc = await db.collection('favorites').doc(`${userId}_${placeId}`).get();
      return doc.exists;
    } catch (e) {
      return false;
    }
  },

  async getFavorites(userId) {
    try {
      const snapshot = await db.collection('favorites')
        .where('userId', '==', userId)
        .get();
      const placeIds = snapshot.docs.map(d => d.data().placeId);
      if (placeIds.length === 0) return [];
      const places = [];
      for (const pid of placeIds) {
        const p = await this.getPlace(pid);
        if (p && p.isActive !== false) places.push(p);
      }
      return places;
    } catch (e) {
      console.error('getFavorites error:', e);
      return [];
    }
  },

  // ====== المراجعات (Firestore) ======
  async addReview(placeId, userId, userName, userAvatar, rating, comment) {
    try {
      await db.collection('reviews').add({
        placeId, userId, userName, userAvatar: userAvatar || '',
        rating, comment,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      await this._updatePlaceRating(placeId);
    } catch (e) {
      console.error('addReview error:', e);
    }
  },

  async getReviews(placeId) {
    try {
      const snapshot = await db.collection('reviews')
        .where('placeId', '==', placeId)
        .orderBy('createdAt', 'desc')
        .get();
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.error('getReviews error:', e);
      return [];
    }
  },

  async _updatePlaceRating(placeId) {
    try {
      const reviews = await this.getReviews(placeId);
      const total = reviews.reduce((s, r) => s + r.rating, 0);
      const avg = reviews.length > 0 ? total / reviews.length : 0;
      await db.collection('places').doc(placeId).update({
        rating: Math.round(avg * 10) / 10,
        reviews: reviews.length,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      this._invalidateCache();
    } catch (e) {
      console.error('_updatePlaceRating error:', e);
    }
  },

  // ====== البحث ======
  normalizeArabic(text) {
    if (!text) return '';
    return text
      .replace(/[إأآا]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي')
      .replace(/ؤ/g, 'و').replace(/ئ/g, 'ي').replace(/گ/g, 'ك');
  },

  async search(query, filters = {}) {
    let places = await this.getPlaces();
    if (filters.category) places = places.filter(p => p.category === filters.category);
    if (filters.city) places = places.filter(p => p.city === filters.city);
    if (filters.subcategory) places = places.filter(p => p.subcategory === filters.subcategory);
    if (query) {
      const q = this.normalizeArabic(query.toLowerCase());
      places = places.filter(p => {
        const name = this.normalizeArabic((p.name || '').toLowerCase());
        const desc = this.normalizeArabic((p.description || '').toLowerCase());
        const addr = this.normalizeArabic((p.address || '').toLowerCase());
        return name.includes(q) || desc.includes(q) || addr.includes(q);
      });
    }
    return places;
  },

  // ====== تصنيفات فرعية ======
  getSubCategory(subId) {
    for (const cat of this.categories) {
      const sub = cat.subs.find(s => s.id === subId);
      if (sub) return sub;
    }
    return null;
  },

  // ====== اللغة ======
  currentLang: 'ar',
  setLang(lang) { this.currentLang = lang; localStorage.setItem('dy_lang', lang); },
  toggleLang() { this.setLang(this.currentLang === 'ar' ? 'en' : 'ar'); },
  t(key) {
    const tr = {
      searchPlaceholder: { ar: 'ابحث عن مكان أو خدمة...', en: 'Search for a place or service...' },
      home: { ar: 'الرئيسية', en: 'Home' },
      search: { ar: 'بحث', en: 'Search' },
      darkMode: { ar: 'الوضع المظلم', en: 'Dark Mode' },
      language: { ar: 'اللغة', en: 'Language' },
    };
    return tr[key]?.[this.currentLang] || key;
  },

  // ====== رفع الصور إلى Firebase Storage ======
  async uploadPlaceImages(files, maxWidth = 800) {
    const urls = [];
    for (const file of files) {
      try {
        const compressed = await this._compressImage(file, maxWidth);
        const blob = await fetch(compressed).then(r => r.blob());
        const fileName = `places/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
        const ref = storage.ref(fileName);
        await ref.put(blob);
        const url = await ref.getDownloadURL();
        urls.push(url);
      } catch (e) {
        console.error('Upload image error:', e);
      }
    }
    return urls;
  },

  _compressImage(file, maxWidth) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let w = img.width, h = img.height;
          if (w > maxWidth) { h = (maxWidth / w) * h; w = maxWidth; }
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  },

  // ====== الإحصائيات ======
  async getStats() {
    try {
      const placesSnap = await db.collection('places').where('isActive', '==', true).get();
      const usersSnap = await db.collection('users').get();
      const reviewsSnap = await db.collection('reviews').get();
      return {
        places: placesSnap.size,
        users: usersSnap.size,
        reviews: reviewsSnap.size,
        cities: this.cities.length,
        categories: this.categories.length
      };
    } catch (e) {
      return { places: 0, users: 0, reviews: 0, cities: 21, categories: 18 };
    }
  },

  // ====== بيانات تجريبية (لمرة واحدة فقط) ======
  async seedDefaultPlaces() {
    const snapshot = await db.collection('places').limit(1).get();
    if (!snapshot.empty) return; // موجودة بالفعل

    const defaults = [
      { name: 'مستشفى الثورة', category: 'cat_1', subcategory: 'sub_1_1', city: 'city_1', description: 'مستشفى حكومي كبير. طوارئ 24 ساعة.', phone: '777111222', address: 'شارع الستين، صنعاء', verified: true, featured: true },
      { name: 'مطعم البركة', category: 'cat_2', subcategory: 'sub_2_1', city: 'city_1', description: 'مطعم يمني تقليدي. مندي، مظبي، حنيذ.', phone: '777222333', address: 'شارع الزبيري، صنعاء', verified: true, featured: true },
      { name: 'فندق القصر', category: 'cat_3', subcategory: 'sub_3_1', city: 'city_2', description: 'فندق 4 نجوم. إطلالة بحرية.', phone: '777333444', address: 'كريتر، عدن', verified: true, featured: true },
      { name: 'صيدلية الحياة', category: 'cat_1', subcategory: 'sub_1_3', city: 'city_1', description: 'صيدلية شاملة 24 ساعة.', phone: '777444555', address: 'شارع الستين، صنعاء', verified: true, featured: false },
      { name: 'مجمع التسوق الحديث', category: 'cat_5', subcategory: 'sub_5_2', city: 'city_1', description: 'أكبر مجمع تجاري في صنعاء.', phone: '777555666', address: 'شارع الربات، صنعاء', verified: true, featured: true },
    ];

    for (const p of defaults) {
      await db.collection('places').add({
        ...p, owner: 'system', isActive: true, status: 'approved',
        views: Math.floor(Math.random() * 10000),
        reviews: Math.floor(Math.random() * 300),
        rating: (4 + Math.random()).toFixed(1) * 1,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    }
    console.log('Default places seeded');
  }

  // ====== نسخ متزامنة للتوافق مع app.js ======
  _usersCache: [],
  _reviewsCache: [],
  _favoritesCache: [],

  getApprovedPlacesSync() {
    return (this._placesCache || []).filter(p => p.status === 'approved' || !p.status);
  },

  getStatsSync() {
    return {
      places: (this._placesCache || []).length,
      users: (this._usersCache || []).length,
      reviews: (this._reviewsCache || []).length,
      cities: this.cities.length,
      categories: this.categories.length
    };
  },

  isFavoriteSync(userId, placeId) {
    return (this._favoritesCache || []).some(f => f.userId === userId && f.placeId === placeId);
  },

  getFavoritesSync(userId) {
    const favIds = (this._favoritesCache || []).filter(f => f.userId === userId).map(f => f.placeId);
    return (this._placesCache || []).filter(p => favIds.includes(p.id));
  },

  searchSync(query, catFilter, subFilter, cityFilter) {
    let places = this.getApprovedPlacesSync();
    if (catFilter) places = places.filter(p => p.category === catFilter);
    if (subFilter) places = places.filter(p => p.subcategory === subFilter);
    if (cityFilter) places = places.filter(p => p.city === cityFilter);
    if (query) {
      const q = this.normalizeArabic(query.toLowerCase());
      places = places.filter(p => {
        const n = this.normalizeArabic((p.name || '').toLowerCase());
        const d = this.normalizeArabic((p.description || '').toLowerCase());
        const a = this.normalizeArabic((p.address || '').toLowerCase());
        return n.includes(q) || d.includes(q) || a.includes(q);
      });
    }
    return places;
  },

  getReviewsSync(placeId) {
    return (this._reviewsCache || []).filter(r => r.placeId === placeId);
  },

  getMyPlacesSync(userId) {
    return (this._placesCache || []).filter(p => p.owner === userId);
  },

  // تحميل مسبق لجميع البيانات
  async preloadAll() {
    // تحميل الأماكن (متاح للجميع)
    try { await this.getPlaces(); } catch(e) { console.log('Places load skipped:', e.message); }
    // تحميل المستخدمين (يحتاج مصادقة)
    if (Auth.currentUser) {
      try { this._usersCache = (await db.collection('users').get()).docs.map(d => d.data()); } catch(e) { this._usersCache = []; }
      try { this._reviewsCache = (await db.collection('reviews').get()).docs.map(d => ({id:d.id,...d.data()})); } catch(e) { this._reviewsCache = []; }
      try { this._favoritesCache = (await db.collection('favorites').where('userId','==',Auth.currentUser.id).get()).docs.map(d => d.data()); } catch(e) { this._favoritesCache = []; }
    } else {
      this._usersCache = [];
      this._reviewsCache = [];
      this._favoritesCache = [];
    }
    // إذا لم يتم تحميل أي أماكن، استخدم البيانات الافتراضية
    if (!this._placesCache || this._placesCache.length === 0) {
      this._placesCache = this.defaultPlaces || [];
    }
  }
};
