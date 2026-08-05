// =============================================
// البيانات - Data Store (أيقونات Lucide احترافية)
// =============================================

const I = (name, cls = 'icon-md') => `<i data-lucide="${name}" class="${cls}"></i>`;
const IB = (name, color, cls = 'icon-lg') => `<div class="cat-icon" style="background:${color}15"><i data-lucide="${name}" class="${cls}" style="color:${color}"></i></div>`;
const IBS = (name, color, cls = 'icon-md') => `<div class="cat-icon-sm" style="background:${color}15"><i data-lucide="${name}" class="${cls}" style="color:${color}"></i></div>`;

const Data = {
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
        { id: 'sub_12_5', name: 'ملاهي', icon: ' ferris-wheel' },
        { id: 'sub_12_6', name: 'بلايستيشن', icon: 'gamepad-2' },
        { id: 'sub_12_7', name: '围棋 clubs', icon: 'puzzle' },
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
  ],

  cities: [
    { id: 'city_1', name: 'صنعاء' }, { id: 'city_2', name: 'عدن' }, { id: 'city_3', name: 'تعز' },
    { id: 'city_4', name: 'الحديدة' }, { id: 'city_5', name: 'إب' }, { id: 'city_6', name: 'حضرموت' },
    { id: 'city_7', name: 'مأرب' }, { id: 'city_8', name: 'لحج' }, { id: 'city_9', name: 'الضالع' },
    { id: 'city_10', name: 'شبوة' }, { id: 'city_11', name: 'المهرة' }, { id: 'city_12', name: 'حجة' },
    { id: 'city_13', name: 'عمران' }, { id: 'city_14', name: 'صعدة' }, { id: 'city_15', name: 'الجوف' },
    { id: 'city_16', name: 'ذمار' }, { id: 'city_17', name: 'البيضاء' }, { id: 'city_18', name: 'أبين' },
    { id: 'city_19', name: 'المحويت' }, { id: 'city_20', name: 'سقطرى' }, { id: 'city_21', name: 'ريمة' },
  ],

  defaultPlaces: [
    { id: 'p_1', name: 'مستشفى الثورة', category: 'cat_1', subcategory: 'sub_1_1', city: 'city_1', description: 'مستشفى حكومي كبير. طوارئ 24 ساعة، عيادات خارجية، عمليات جراحية.', phone: '777111222', whatsapp: '777111222', address: 'شارع الستين، صنعاء', rating: 4.2, reviews: 156, views: 8900, verified: true, featured: true, owner: 'system', createdAt: '2024-01-15' },
    { id: 'p_2', name: 'مطعم البركة', category: 'cat_2', subcategory: 'sub_2_1', city: 'city_1', description: 'مطعم يمني تقليدي. مندي، مظبي، حنيذ، Saltah.', phone: '777222333', whatsapp: '777222333', address: 'شارع الزبيري، صنعاء', rating: 4.8, reviews: 312, views: 12500, verified: true, featured: true, owner: 'system', createdAt: '2024-02-20' },
    { id: 'p_3', name: 'فندق القصر', category: 'cat_3', subcategory: 'sub_3_1', city: 'city_2', description: 'فندق 4 نجوم. إطلالة بحرية، غرف مجهزة.', phone: '777333444', whatsapp: '777333444', address: 'كريتر، عدن', rating: 4.6, reviews: 189, views: 7600, verified: true, featured: true, owner: 'system', createdAt: '2024-03-10' },
    { id: 'p_4', name: 'صيدلية الحياة', category: 'cat_1', subcategory: 'sub_1_3', city: 'city_1', description: 'صيدلية شاملة 24 ساعة.', phone: '777444555', whatsapp: '777444555', address: 'شارع الستين، صنعاء', rating: 4.7, reviews: 98, views: 5400, verified: true, featured: false, owner: 'system', createdAt: '2024-04-05' },
    { id: 'p_5', name: 'مجمع التسوق الحديث', category: 'cat_5', subcategory: 'sub_5_2', city: 'city_1', description: 'أكبر مجمع تجاري في صنعاء.', phone: '777555666', whatsapp: '777555666', address: 'شارع الربات، صنعاء', rating: 4.5, reviews: 420, views: 18000, verified: true, featured: true, owner: 'system', createdAt: '2024-05-15' },
    { id: 'p_6', name: 'جامعة صنعاء', category: 'cat_4', subcategory: 'sub_4_1', city: 'city_1', description: 'أقدم وأكبر جامعة في اليمن.', phone: '777666777', address: 'شارع صنعاء', rating: 4.3, reviews: 267, views: 9800, verified: true, featured: false, owner: 'system', createdAt: '2024-06-01' },
    { id: 'p_7', name: 'نادي اللياقة', category: 'cat_11', subcategory: 'sub_11_1', city: 'city_1', description: 'صالة رياضية متكاملة.', phone: '777777888', whatsapp: '777777888', address: 'شارع حدة، صنعاء', rating: 4.6, reviews: 145, views: 6200, verified: true, featured: false, owner: 'system', createdAt: '2024-07-10' },
    { id: 'p_8', name: 'مكتبة المعرفة', category: 'cat_4', subcategory: 'sub_4_6', city: 'city_1', description: 'مكتبة شاملة.', phone: '777888999', address: 'شارع الستين، صنعاء', rating: 4.3, reviews: 67, views: 3200, verified: false, featured: false, owner: 'system', createdAt: '2024-08-01' },
    { id: 'p_9', name: 'محل الأناقة', category: 'cat_10', subcategory: 'sub_10_1', city: 'city_1', description: 'صالون نساء.', phone: '777999000', whatsapp: '777999000', address: 'شارع الزبيري، صنعاء', rating: 4.4, reviews: 89, views: 4100, verified: false, featured: false, owner: 'system', createdAt: '2024-09-01' },
    { id: 'p_10', name: 'مطعم اليمان البحري', category: 'cat_2', subcategory: 'sub_2_3', city: 'city_2', description: 'مطعم بحري مميز في عدن.', phone: '777100200', whatsapp: '777100200', address: 'العاصمة، عدن', rating: 4.4, reviews: 76, views: 3400, verified: false, featured: false, owner: 'system', createdAt: '2024-09-15' },
    { id: 'p_11', name: 'بنك Yemen Kuwait', category: 'cat_14', subcategory: 'sub_14_1', city: 'city_1', description: 'خدمات بنكية شاملة.', phone: '777200300', address: 'شارع الستين، صنعاء', rating: 4.1, reviews: 134, views: 5600, verified: true, featured: false, owner: 'system', createdAt: '2024-10-01' },
    { id: 'p_12', name: 'وكالة سبأ للأنباء', category: 'cat_17', subcategory: 'sub_17_1', city: 'city_1', description: 'وكالة أنباء رسمية.', phone: '777300400', address: 'صنعاء', rating: 4.0, reviews: 45, views: 2800, verified: true, featured: false, owner: 'system', createdAt: '2024-10-15' },
  ],

  getPlaces() {
    const p = JSON.parse(localStorage.getItem('dy_places') || 'null');
    if (p) return p;
    localStorage.setItem('dy_places', JSON.stringify(this.defaultPlaces));
    return this.defaultPlaces;
  },
  addPlace(place) {
    const places = this.getPlaces();
    place.id = 'p_' + Date.now();
    place.createdAt = new Date().toISOString();
    place.views = 0; place.reviews = 0; place.rating = 0;
    places.unshift(place);
    localStorage.setItem('dy_places', JSON.stringify(places));
    return place;
  },
  deletePlace(id) { let p = this.getPlaces().filter(x => x.id !== id); localStorage.setItem('dy_places', JSON.stringify(p)); },
  // تطبيع النص العربي (معالجة اختلافات الهمزات والحروف)
  normalizeArabic(text) {
    if (!text) return '';
    return text
      .toLowerCase()
      // الهمزات
      .replace(/[أإآا]/g, 'ا')
      // التاء المربوطة والهاء
      .replace(/ة/g, 'ه')
      // الياء والألف المقصورة
      .replace(/ى/g, 'ي')
      // حذف التشكيل
      .replace(/[ًٌٍَُِّْ]/g, '')
      // حذف المسافات الزائدة
      .replace(/\s+/g, ' ')
      .trim();
  },

  // بحث ذكي ومتقدم
  search(q, cat, sub, city) {
    let p = this.getPlaces();
    if (q && q.trim()) {
      const query = this.normalizeArabic(q.trim());
      const queryWords = query.split(' ').filter(w => w.length > 0);

      p = p.filter(place => {
        // تجميع كل النصوص القابلة للبحث
        const catObj = this.categories.find(c => c.id === place.category);
        const subObj = place.subcategory ? this.getSubCategory(place.subcategory) : null;
        const cityObj = this.cities.find(c => c.id === place.city);

        const searchableText = this.normalizeArabic([
          place.name,
          place.description || '',
          place.address || '',
          place.phone || '',
          catObj ? catObj.name : '',
          subObj ? subObj.name : '',
          cityObj ? cityObj.name : '',
          place.email || '',
          place.whatsapp || ''
        ].join(' '));

        // البحث بالكلمات (كل كلمة يجب أن تظهر في النص)
        return queryWords.every(word => searchableText.includes(word));
      });

      // ترتيب النتائج (الأكثر relevance أولاً)
      p.sort((a, b) => {
        const aName = this.normalizeArabic(a.name);
        const bName = this.normalizeArabic(b.name);
        const aExact = aName.includes(query) ? 0 : 1;
        const bExact = bName.includes(query) ? 0 : 1;
        if (aExact !== bExact) return aExact - bExact;
        // ثم بالتقييم
        return (b.rating || 0) - (a.rating || 0);
      });
    }
    if (cat) p = p.filter(x => x.category === cat);
    if (sub) p = p.filter(x => x.subcategory === sub);
    if (city) p = p.filter(x => x.city === city);
    return p;
  },

  // بحث سريع (للuggestions)
  quickSearch(q) {
    if (!q || q.trim().length < 2) return [];
    const query = this.normalizeArabic(q.trim());
    const places = this.getPlaces();
    const results = [];

    // البحث في الأماكن
    places.forEach(p => {
      const name = this.normalizeArabic(p.name);
      if (name.includes(query)) {
        results.push({ type: 'place', id: p.id, name: p.name, icon: 'map-pin', subtitle: this.getSubCategory(p.subcategory)?.name || '' });
      }
    });

    // البحث في الأقسام
    this.categories.forEach(c => {
      const catName = this.normalizeArabic(c.name);
      if (catName.includes(query)) {
        results.push({ type: 'category', id: c.id, name: c.name, icon: c.icon, subtitle: 'قسم رئيسي' });
      }
      c.subs.forEach(s => {
        const subName = this.normalizeArabic(s.name);
        if (subName.includes(query)) {
          results.push({ type: 'subcategory', id: s.id, catId: c.id, name: s.name, icon: s.icon, subtitle: c.name });
        }
      });
    });

    // البحث في المدن
    this.cities.forEach(c => {
      const cityName = this.normalizeArabic(c.name);
      if (cityName.includes(query)) {
        results.push({ type: 'city', id: c.id, name: c.name, icon: 'map-pin', subtitle: 'مدينة' });
      }
    });

    return results.slice(0, 10);
  },
  toggleFavorite(uid, pid) {
    const f = JSON.parse(localStorage.getItem('dy_favorites') || '{}');
    if (!f[uid]) f[uid] = [];
    const i = f[uid].indexOf(pid);
    if (i === -1) f[uid].push(pid); else f[uid].splice(i, 1);
    localStorage.setItem('dy_favorites', JSON.stringify(f));
    return f[uid].includes(pid);
  },
  isFavorite(uid, pid) { const f = JSON.parse(localStorage.getItem('dy_favorites') || '{}'); return f[uid] ? f[uid].includes(pid) : false; },
  getFavorites(uid) { const f = JSON.parse(localStorage.getItem('dy_favorites') || '{}'); return this.getPlaces().filter(p => (f[uid]||[]).includes(p.id)); },
  addReview(pid, uid, name, rating, comment) {
    const r = JSON.parse(localStorage.getItem('dy_reviews') || '[]');
    r.push({ id: 'rev_' + Date.now(), placeId: pid, userId: uid, userName: name, rating, comment, createdAt: new Date().toISOString() });
    localStorage.setItem('dy_reviews', JSON.stringify(r));
    const places = this.getPlaces();
    const place = places.find(p => p.id === pid);
    if (place) { const pr = r.filter(x => x.placeId === pid); place.rating = (pr.reduce((a,x) => a+x.rating,0)/pr.length).toFixed(1); place.reviews = pr.length; localStorage.setItem('dy_places', JSON.stringify(places)); }
  },
  getReviews(pid) { return (JSON.parse(localStorage.getItem('dy_reviews') || '[]')).filter(r => r.placeId === pid).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)); },
  getStats() { return { places: this.getPlaces().length, users: JSON.parse(localStorage.getItem('dy_users')||'[]').length, reviews: JSON.parse(localStorage.getItem('dy_reviews')||'[]').length, cities: this.cities.length, categories: this.categories.length }; },
  getSubCategory(id) { for (const c of this.categories) { const s = c.subs.find(x => x.id === id); if (s) return { ...s, parent: c }; } return null; },

  // رفع صور المكان
  async uploadPlaceImages(files, maxWidth = 800) {
    const images = [];
    for (const file of files) {
      const base64 = await this._compressImage(file, maxWidth);
      images.push(base64);
    }
    return images;
  },

  // ضغط الصورة
  _compressImage(file, maxWidth = 800) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let w = img.width;
          let h = img.height;
          if (w > maxWidth) {
            h = (maxWidth / w) * h;
            w = maxWidth;
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  },

  // ====== نظام الترجمة ======
  currentLang: localStorage.getItem('dy_lang') || 'ar',

  translations: {
    ar: {
      home: 'الرئيسية', search: 'بحث', add: 'إضافة', favorites: 'المفضلة', profile: 'الملف الشخصي',
      login: 'دخول', signup: 'حساب جديد', logout: 'تسجيل الخروج',
      categories: 'الأقسام الرئيسية', featured: 'أماكن مميزة', cities: 'المدن', latest: 'أحدث الأماكن',
      addPlace: 'إضافة مكان جديد', myPlaces: 'مواقعي', verified: 'موثّق', pending: 'بانتظار التوثيق',
      darkMode: 'الوضع المظلم', language: 'اللغة', notifications: 'إشعارات',
      searchPlaceholder: 'ابحث عن مكان، خدمة، أونشاط...', noResults: 'لا توجد نتائج',
      name: 'الاسم', email: 'البريد الإلكتروني', phone: 'رقم الهاتف', password: 'كلمة المرور',
      description: 'الوصف', address: 'العنوان', whatsapp: 'رقم واتساب',
      category: 'القسم الرئيسي', subcategory: 'القسم الفرعي', city: 'المدينة',
      save: 'حفظ', cancel: 'إلغاء', delete: 'حذف', edit: 'تعديل',
      call: 'اتصال', map: 'خريطة', share: 'مشاركة',
      reviews: 'المراجعات', writeReview: 'اكتب مراجعتك...', submit: 'إرسال',
      addImages: 'إضافة صور', uploadFromDevice: 'رفع من الجهاز',
      places: 'مكان', users: 'مستخدم', reviewCount: 'مراجعة',
      discoverYemen: 'اكتشف اليمن', subtitle: 'الدليل الشامل للأعمال والأماكن في جميع أنحاء اليمن',
      addYourPlace: 'أضف مكانك مجاناً', startNow: 'ابدأ الآن',
      viewAll: 'عرض الكل', results: 'نتيجة',
    },
    en: {
      home: 'Home', search: 'Search', add: 'Add', favorites: 'Favorites', profile: 'Profile',
      login: 'Login', signup: 'Sign Up', logout: 'Logout',
      categories: 'Categories', featured: 'Featured Places', cities: 'Cities', latest: 'Latest Places',
      addPlace: 'Add New Place', myPlaces: 'My Places', verified: 'Verified', pending: 'Pending Verification',
      darkMode: 'Dark Mode', language: 'Language', notifications: 'Notifications',
      searchPlaceholder: 'Search for a place, service, or activity...', noResults: 'No results found',
      name: 'Name', email: 'Email', phone: 'Phone', password: 'Password',
      description: 'Description', address: 'Address', whatsapp: 'WhatsApp Number',
      category: 'Main Category', subcategory: 'Sub Category', city: 'City',
      save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit',
      call: 'Call', map: 'Map', share: 'Share',
      reviews: 'Reviews', writeReview: 'Write your review...', submit: 'Submit',
      addImages: 'Add Images', uploadFromDevice: 'Upload from Device',
      places: 'Places', users: 'Users', reviewCount: 'Reviews',
      discoverYemen: 'Discover Yemen', subtitle: 'The comprehensive guide for businesses and places in Yemen',
      addYourPlace: 'Add Your Place for Free', startNow: 'Start Now',
      viewAll: 'View All', results: 'results',
    }
  },

  t(key) {
    return this.translations[this.currentLang]?.[key] || this.translations['ar']?.[key] || key;
  },

  setLang(lang) {
    this.currentLang = lang;
    localStorage.setItem('dy_lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  },

  toggleLang() {
    this.setLang(this.currentLang === 'ar' ? 'en' : 'ar');
  }
};
