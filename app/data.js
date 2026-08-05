// =============================================
// البيانات - Data Store (مع أقسام رئيسية وفرعية)
// =============================================

const Data = {
  // ===== الأقسام الرئيسية والفرعية =====
  categories: [
    {
      id: 'cat_1', name: 'الصحة والطب', icon: '🏥', color: '#10b981',
      subs: [
        { id: 'sub_1_1', name: 'مستشفيات', icon: '🏥' },
        { id: 'sub_1_2', name: 'عيادات', icon: '🩺' },
        { id: 'sub_1_3', name: 'صيدليات', icon: '💊' },
        { id: 'sub_1_4', name: 'مختبرات', icon: '🔬' },
        { id: 'sub_1_5', name: 'مراكز أشعة', icon: '📡' },
        { id: 'sub_1_6', name: 'أسنان', icon: '🦷' },
        { id: 'sub_1_7', name: 'عيادات عيون', icon: '👁️' },
        { id: 'sub_1_8', name: 'علاج طبيعي', icon: '🦿' },
        { id: 'sub_1_9', name: 'صحة نفسية', icon: '🧠' },
        { id: 'sub_1_10', name: 'طب أطفال', icon: '👶' },
        { id: 'sub_1_11', name: 'نساء وتوليد', icon: '🤰' },
        { id: 'sub_1_12', name: 'جراحة', icon: '🔪' },
      ]
    },
    {
      id: 'cat_2', name: 'المطاعم والمقاهي', icon: '🍽️', color: '#ef4444',
      subs: [
        { id: 'sub_2_1', name: 'مطاعم يمنية', icon: '🍲' },
        { id: 'sub_2_2', name: 'مطاعم عربية', icon: '🥘' },
        { id: 'sub_2_3', name: 'مطاعم بحرية', icon: '🐟' },
        { id: 'sub_2_4', name: 'مطاعم سريعة', icon: '🍔' },
        { id: 'sub_2_5', name: 'مطاعم إيطالية', icon: '🍕' },
        { id: 'sub_2_6', name: 'مطاعم هندية', icon: '🍛' },
        { id: 'sub_2_7', name: 'مطاعم تركية', icon: '🥙' },
        { id: 'sub_2_8', name: 'كافيهات', icon: '☕' },
        { id: 'sub_2_9', name: 'محلات عصير', icon: '🧃' },
        { id: 'sub_2_10', name: 'محلات حلويات', icon: '🍰' },
        { id: 'sub_2_11', name: 'محلات آيس كريم', icon: '🍦' },
        { id: 'sub_2_12', name: 'مطاعم شاورما', icon: '🌯' },
      ]
    },
    {
      id: 'cat_3', name: 'الفنادق والسياحة', icon: '🏨', color: '#8b5cf6',
      subs: [
        { id: 'sub_3_1', name: 'فنادق', icon: '🏨' },
        { id: 'sub_3_2', name: 'شقق فندقية', icon: '🏢' },
        { id: 'sub_3_3', name: 'منتجعات', icon: '🏖️' },
        { id: 'sub_3_4', name: 'نزل', icon: '🏠' },
        { id: 'sub_3_5', name: 'مكاتب سفر', icon: '✈️' },
        { id: 'sub_3_6', name: 'سياحة ورحلات', icon: '🗺️' },
        { id: 'sub_3_7', name: 'تأجير سيارات', icon: '🚗' },
        { id: 'sub_3_8', name: ' camps', icon: '⛺' },
      ]
    },
    {
      id: 'cat_4', name: 'التعليم والتدريب', icon: '📚', color: '#ec4899',
      subs: [
        { id: 'sub_4_1', name: 'جامعات', icon: '🎓' },
        { id: 'sub_4_2', name: 'مدارس', icon: '🏫' },
        { id: 'sub_4_3', name: 'رياض أطفال', icon: '🧒' },
        { id: 'sub_4_4', name: 'مراكز تدريب', icon: '📖' },
        { id: 'sub_4_5', name: 'معاهد لغات', icon: '🌐' },
        { id: 'sub_4_6', name: 'مكتبات', icon: '📚' },
        { id: 'sub_4_7', name: 'تعليم إلكتروني', icon: '💻' },
        { id: 'sub_4_8', name: 'دروس خصوصية', icon: '👨‍🏫' },
        { id: 'sub_4_9', name: 'חינוך خاص', icon: '🧒' },
      ]
    },
    {
      id: 'cat_5', name: 'التجارة والأسواق', icon: '🛍️', color: '#3b82f6',
      subs: [
        { id: 'sub_5_1', name: 'سوبر ماركت', icon: '🛒' },
        { id: 'sub_5_2', name: 'مجمعات تجارية', icon: '🏬' },
        { id: 'sub_5_3', name: 'محلات ملابس', icon: '👗' },
        { id: 'sub_5_4', name: 'محلات أحذية', icon: '👟' },
        { id: 'sub_5_5', name: 'محلات إلكترونيات', icon: '📱' },
        { id: 'sub_5_6', name: 'محلات أثاث', icon: '🛋️' },
        { id: 'sub_5_7', name: 'محلات هدايا', icon: '🎁' },
        { id: 'sub_5_8', name: 'محلات عسل', icon: '🍯' },
        { id: 'sub_5_9', name: 'محلات بخور', icon: '🪔' },
        { id: 'sub_5_10', name: 'محلات ذهب', icon: '💍' },
        { id: 'sub_5_11', name: 'محلات عطارة', icon: '🌿' },
        { id: 'sub_5_12', name: 'محلات زينة', icon: '✨' },
      ]
    },
    {
      id: 'cat_6', name: 'الخدمات', icon: '🔧', color: '#6366f1',
      subs: [
        { id: 'sub_6_1', name: 'كهرباء', icon: '⚡' },
        { id: 'sub_6_2', name: 'سباكة', icon: '🔧' },
        { id: 'sub_6_3', name: 'نجارة', icon: '🪚' },
        { id: 'sub_6_4', name: 'دهانات', icon: '🎨' },
        { id: 'sub_6_5', name: 'نقل أثاث', icon: '🚚' },
        { id: 'sub_6_6', name: 'غسيل سيارات', icon: '🚗' },
        { id: 'sub_6_7', name: 'مغاسل', icon: '👔' },
        { id: 'sub_6_8', name: 'حلاقة رجال', icon: '💇‍♂️' },
        { id: 'sub_6_9', name: 'حلاقة نساء', icon: '💇‍♀️' },
        { id: 'sub_6_10', name: 'طباعة', icon: '🖨️' },
        { id: 'sub_6_11', name: 'تصوير', icon: '📸' },
        { id: 'sub_6_12', name: 'خدمات توصيل', icon: '🛵' },
      ]
    },
    {
      id: 'cat_7', name: 'السيارات', icon: '🚗', color: '#f97316',
      subs: [
        { id: 'sub_7_1', name: 'مكاتب سيارات', icon: '🏢' },
        { id: 'sub_7_2', name: 'قطع غيار', icon: '⚙️' },
        { id: 'sub_7_3', name: 'ورش صيانة', icon: '🔧' },
        { id: 'sub_7_4', name: 'إطارات', icon: '🛞' },
        { id: 'sub_7_5', name: 'زجاج سيارات', icon: '🪟' },
        { id: 'sub_7_6', name: 'تكييف سيارات', icon: '❄️' },
        { id: 'sub_7_7', name: 'دهان سيارات', icon: '🎨' },
        { id: 'sub_7_8', name: 'غسيل سيارات', icon: '🚿' },
        { id: 'sub_7_9', name: 'تأجير سيارات', icon: '🚙' },
      ]
    },
    {
      id: 'cat_8', name: 'العقارات', icon: '🏠', color: '#06b6d4',
      subs: [
        { id: 'sub_8_1', name: 'مكاتب عقارية', icon: '🏢' },
        { id: 'sub_8_2', name: 'بيع أراضي', icon: '🏗️' },
        { id: 'sub_8_3', name: 'تأجير شقق', icon: '🏠' },
        { id: 'sub_8_4', name: 'بيع شقق', icon: '🏢' },
        { id: 'sub_8_5', name: 'تأجير محلات', icon: '🏪' },
        { id: 'sub_8_6', name: 'فلل', icon: '🏡' },
        { id: 'sub_8_7', name: 'مقاولات', icon: '👷' },
      ]
    },
    {
      id: 'cat_9', name: 'الإلكترونيات', icon: '📱', color: '#0ea5e9',
      subs: [
        { id: 'sub_9_1', name: 'موبايلات', icon: '📱' },
        { id: 'sub_9_2', name: 'لابتوب', icon: '💻' },
        { id: 'sub_9_3', name: 'تلفزيونات', icon: '📺' },
        { id: 'sub_9_4', name: 'أجهزة لوحية', icon: '📲' },
        { id: 'sub_9_5', name: 'سماعات', icon: '🎧' },
        { id: 'sub_9_6', name: 'كاميرات', icon: '📷' },
        { id: 'sub_9_7', name: 'ألعاب', icon: '🎮' },
        { id: 'sub_9_8', name: 'صيانة إلكترونيات', icon: '🔧' },
      ]
    },
    {
      id: 'cat_10', name: 'الجمال والعناية', icon: '💄', color: '#e11d48',
      subs: [
        { id: 'sub_10_1', name: 'صالونات نساء', icon: '💇‍♀️' },
        { id: 'sub_10_2', name: 'حلاقة رجال', icon: '💇‍♂️' },
        { id: 'sub_10_3', name: 'عطور', icon: '🧴' },
        { id: 'sub_10_4', name: 'مستحضرات تجميل', icon: '💄' },
        { id: 'sub_10_5', name: 'عناية بالبشرة', icon: '✨' },
        { id: 'sub_10_6', name: 'عناية بالشعر', icon: '💇' },
        { id: 'sub_10_7', name: 'أظافر', icon: '💅' },
      ]
    },
    {
      id: 'cat_11', name: 'الرياضة', icon: '⚽', color: '#22c55e',
      subs: [
        { id: 'sub_11_1', name: 'صالات رياضية', icon: '🏋️' },
        { id: 'sub_11_2', name: 'ملاعب', icon: '⚽' },
        { id: 'sub_11_3', name: 'مسابح', icon: '🏊' },
        { id: 'sub_11_4', name: 'يوغا', icon: '🧘' },
        { id: 'sub_11_5', name: 'فنون قتالية', icon: '🥋' },
        { id: 'sub_11_6', name: 'معدات رياضية', icon: '🎽' },
      ]
    },
    {
      id: 'cat_12', name: 'الترفيه', icon: '🎮', color: '#14b8a6',
      subs: [
        { id: 'sub_12_1', name: 'مدن ألعاب', icon: '🎢' },
        { id: 'sub_12_2', name: 'سينما', icon: '🎬' },
        { id: 'sub_12_3', name: 'حدائق', icon: '🌳' },
        { id: 'sub_12_4', name: 'شواطئ', icon: '🏖️' },
        { id: 'sub_12_5', name: 'ملاهي', icon: '🎪' },
        { id: 'sub_12_6', name: 'بلايستيشن', icon: '🎮' },
        { id: 'sub_12_7', name: 'ברים', icon: '🍸' },
      ]
    },
    {
      id: 'cat_13', name: 'القانونية', icon: '⚖️', color: '#78716c',
      subs: [
        { id: 'sub_13_1', name: 'محامون', icon: '👨‍⚖️' },
        { id: 'sub_13_2', name: 'مكاتب استشارات', icon: '📋' },
        { id: 'sub_13_3', name: 'توثيق', icon: '📜' },
        { id: 'sub_13_4', name: 'ترجمة', icon: '🌐' },
      ]
    },
    {
      id: 'cat_14', name: 'المالية', icon: '💰', color: '#eab308',
      subs: [
        { id: 'sub_14_1', name: 'بنوك', icon: '🏦' },
        { id: 'sub_14_2', name: 'صرافة', icon: '💱' },
        { id: 'sub_14_3', name: 'تأمين', icon: '🛡️' },
        { id: 'sub_14_4', name: 'استثمار', icon: '📈' },
      ]
    },
    {
      id: 'cat_15', name: 'العقيدة والدين', icon: '🕌', color: '#065f46',
      subs: [
        { id: 'sub_15_1', name: 'مساجد', icon: '🕌' },
        { id: 'sub_15_2', name: 'مكتبات إسلامية', icon: '📖' },
        { id: 'sub_15_3', name: 'تعليم قرآن', icon: '📿' },
        { id: 'sub_15_4', name: 'مناسبات', icon: '🎉' },
      ]
    },
    {
      id: 'cat_16', name: 'الزراعة', icon: '🌾', color: '#65a30d',
      subs: [
        { id: 'sub_16_1', name: 'محلات بذور', icon: '🌱' },
        { id: 'sub_16_2', name: 'أسمدة', icon: '🧪' },
        { id: 'sub_16_3', name: 'معدات زراعية', icon: '🚜' },
        { id: 'sub_16_4', name: 'مزراع', icon: '🐄' },
      ]
    },
    {
      id: 'cat_17', name: 'الإعلام والنشر', icon: '📰', color: '#1d4ed8',
      subs: [
        { id: 'sub_17_1', name: 'صحف', icon: '📰' },
        { id: 'sub_17_2', name: 'مواقع إخبارية', icon: '🌐' },
        { id: 'sub_17_3', name: 'قنوات فضائية', icon: '📺' },
        { id: 'sub_17_4', name: 'إذاعات', icon: '📻' },
        { id: 'sub_17_5', name: 'طباعة ونشر', icon: '🖨️' },
      ]
    },
    {
      id: 'cat_18', name: 'الصناعات', icon: '🏭', color: '#78350f',
      subs: [
        { id: 'sub_18_1', name: 'مصانع', icon: '🏭' },
        { id: 'sub_18_2', name: 'حدادة', icon: '⚒️' },
        { id: 'sub_18_3', name: 'خياطة', icon: '🧵' },
        { id: 'sub_18_4', name: 'نجارة', icon: '🪚' },
        { id: 'sub_18_5', name: 'خزف', icon: '🏺' },
      ]
    },
  ],

  // ===== المدن =====
  cities: [
    { id: 'city_1', name: 'صنعاء', region: 'اليمن' },
    { id: 'city_2', name: 'عدن', region: 'اليمن' },
    { id: 'city_3', name: 'تعز', region: 'اليمن' },
    { id: 'city_4', name: 'الحديدة', region: 'اليمن' },
    { id: 'city_5', name: 'إب', region: 'اليمن' },
    { id: 'city_6', name: 'حضرموت', region: 'اليمن' },
    { id: 'city_7', name: 'مأرب', region: 'اليمن' },
    { id: 'city_8', name: 'لحج', region: 'اليمن' },
    { id: 'city_9', name: 'الضالع', region: 'اليمن' },
    { id: 'city_10', name: 'شبوة', region: 'اليمن' },
    { id: 'city_11', name: 'المهرة', region: 'اليمن' },
    { id: 'city_12', name: 'حجة', region: 'اليمن' },
    { id: 'city_13', name: 'عمران', region: 'اليمن' },
    { id: 'city_14', name: 'صعدة', region: 'اليمن' },
    { id: 'city_15', name: 'الجوف', region: 'اليمن' },
    { id: 'city_16', name: 'ذمار', region: 'اليمن' },
    { id: 'city_17', name: 'البيضاء', region: 'اليمن' },
    { id: 'city_18', name: 'أبين', region: 'اليمن' },
    { id: 'city_19', name: 'المحويت', region: 'اليمن' },
    { id: 'city_20', name: 'سقطرى', region: 'اليمن' },
    { id: 'city_21', name: 'ريمة', region: 'اليمن' },
  ],

  // ===== الأماكن الافتراضية =====
  defaultPlaces: [
    { id: 'p_1', name: 'مستشفى الثورة', category: 'cat_1', subcategory: 'sub_1_1', city: 'city_1', description: 'مستشفى حكومي كبير يقدم خدمات طبية شاملة. طوارئ 24 ساعة، عيادات خارجية، عمليات جراحية.', phone: '777111222', whatsapp: '777111222', address: 'شارع الستين، صنعاء', rating: 4.2, reviews: 156, views: 8900, verified: true, featured: true, images: ['🏥'], owner: 'system', createdAt: '2024-01-15' },
    { id: 'p_2', name: 'مطعم البركة', category: 'cat_2', subcategory: 'sub_2_1', city: 'city_1', description: 'مطعم يمني تقليدي. مندي، مظبي، حنيذ، م Saltah وأطباق يمنية أصيلة.', phone: '777222333', whatsapp: '777222333', address: 'شارع الزبيري، صنعاء', rating: 4.8, reviews: 312, views: 12500, verified: true, featured: true, images: ['🍽️'], owner: 'system', createdAt: '2024-02-20' },
    { id: 'p_3', name: 'فندق القصر', category: 'cat_3', subcategory: 'sub_3_1', city: 'city_2', description: 'فندق 4 نجوم في قلب عدن. إطلالة بحرية، غرف مجهزة، مطعم عالمي.', phone: '777333444', whatsapp: '777333444', address: 'كريتر، عدن', rating: 4.6, reviews: 189, views: 7600, verified: true, featured: true, images: ['🏨'], owner: 'system', createdAt: '2024-03-10' },
    { id: 'p_4', name: 'صيدلية الحياة', category: 'cat_1', subcategory: 'sub_1_3', city: 'city_1', description: 'صيدلية شاملة 24 ساعة. أدوية، مستحضرات تجميل، مكملات غذائية.', phone: '777444555', whatsapp: '777444555', address: 'شارع الستين، صنعاء', rating: 4.7, reviews: 98, views: 5400, verified: true, featured: false, images: ['💊'], owner: 'system', createdAt: '2024-04-05' },
    { id: 'p_5', name: 'مجمع التسوق الحديث', category: 'cat_5', subcategory: 'sub_5_2', city: 'city_1', description: 'أكبر مجمع تجاري في صنعاء. ماركات عالمية، مطاعم، ألعاب أطفال.', phone: '777555666', whatsapp: '777555666', address: 'شارع الربات، صنعاء', rating: 4.5, reviews: 420, views: 18000, verified: true, featured: true, images: ['🛍️'], owner: 'system', createdAt: '2024-05-15' },
    { id: 'p_6', name: 'جامعة صنعاء', category: 'cat_4', subcategory: 'sub_4_1', city: 'city_1', description: 'أقدم وأكبر جامعة في اليمن. كليات متعددة، برامج دراسات عليا.', phone: '777666777', address: 'شارع صنعاء، صنعاء', rating: 4.3, reviews: 267, views: 9800, verified: true, featured: false, images: ['🎓'], owner: 'system', createdAt: '2024-06-01' },
    { id: 'p_7', name: 'نادي اللياقة', category: 'cat_11', subcategory: 'sub_11_1', city: 'city_1', description: 'صالة رياضية متكاملة. أجهزة حديثة، مدربين محترفين، حمام سباحة.', phone: '777777888', whatsapp: '777777888', address: 'شارع حدة، صنعاء', rating: 4.6, reviews: 145, views: 6200, verified: true, featured: false, images: ['🏋️'], owner: 'system', createdAt: '2024-07-10' },
    { id: 'p_8', name: 'مكتبة المعرفة', category: 'cat_4', subcategory: 'sub_4_6', city: 'city_1', description: 'مكتبة شاملة. كتب، قرطاسية، طباعة، توصيل.', phone: '777888999', address: 'شارع الستين، صنعاء', rating: 4.3, reviews: 67, views: 3200, verified: false, featured: false, images: ['📚'], owner: 'system', createdAt: '2024-08-01' },
    { id: 'p_9', name: 'محل الأناقة', category: 'cat_10', subcategory: 'sub_10_1', city: 'city_1', description: 'صالون نساء. تسريحات، مكياج، عناية بالبشرة والأظافر.', phone: '777999000', whatsapp: '777999000', address: 'شارع الزبيري، صنعاء', rating: 4.4, reviews: 89, views: 4100, verified: false, featured: false, images: ['💇‍♀️'], owner: 'system', createdAt: '2024-09-01' },
    { id: 'p_10', name: 'مطعم اليمان البحري', category: 'cat_2', subcategory: 'sub_2_3', city: 'city_2', description: 'مطعم بحري مميز في عدن. أسماك طازة، مندي سمك، grilled fish.', phone: '777100200', whatsapp: '777100200', address: 'العاصمة، عدن', rating: 4.4, reviews: 76, views: 3400, verified: false, featured: false, images: ['🐟'], owner: 'system', createdAt: '2024-09-15' },
    { id: 'p_11', name: 'بنك اليمن والكويت', category: 'cat_14', subcategory: 'sub_14_1', city: 'city_1', description: 'خدمات بنكية شاملة. حسابات، قروض، تحويلات دولية.', phone: '777200300', address: 'شارع الستين، صنعاء', rating: 4.1, reviews: 134, views: 5600, verified: true, featured: false, images: ['🏦'], owner: 'system', createdAt: '2024-10-01' },
    { id: 'p_12', name: 'وكالة الأنباء اليمنية', category: 'cat_17', subcategory: 'sub_17_1', city: 'city_1', description: 'وكالة أنباء رسمية. أخبار محلية ودولية على مدار الساعة.', phone: '777300400', address: 'صنعاء', rating: 4.0, reviews: 45, views: 2800, verified: true, featured: false, images: ['📰'], owner: 'system', createdAt: '2024-10-15' },
  ],

  // ===== الأماكن (مستخدمين + افتراضية) =====
  getPlaces() {
    const userPlaces = JSON.parse(localStorage.getItem('dy_places') || 'null');
    if (userPlaces) return userPlaces;
    localStorage.setItem('dy_places', JSON.stringify(this.defaultPlaces));
    return this.defaultPlaces;
  },

  addPlace(place) {
    const places = this.getPlaces();
    place.id = 'p_' + Date.now();
    place.createdAt = new Date().toISOString();
    place.views = 0;
    place.reviews = 0;
    place.rating = 0;
    places.unshift(place);
    localStorage.setItem('dy_places', JSON.stringify(places));
    return place;
  },

  deletePlace(id) {
    let places = this.getPlaces();
    places = places.filter(p => p.id !== id);
    localStorage.setItem('dy_places', JSON.stringify(places));
  },

  // البحث مع دعم الأقسام الفرعية
  search(query, categoryId, subcategoryId, cityId) {
    let places = this.getPlaces();
    if (query) {
      const q = query.toLowerCase();
      places = places.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.address && p.address.toLowerCase().includes(q))
      );
    }
    if (categoryId) places = places.filter(p => p.category === categoryId);
    if (subcategoryId) places = places.filter(p => p.subcategory === subcategoryId);
    if (cityId) places = places.filter(p => p.city === cityId);
    return places;
  },

  // المفضلة
  toggleFavorite(userId, placeId) {
    const favs = JSON.parse(localStorage.getItem('dy_favorites') || '{}');
    if (!favs[userId]) favs[userId] = [];
    const idx = favs[userId].indexOf(placeId);
    if (idx === -1) favs[userId].push(placeId);
    else favs[userId].splice(idx, 1);
    localStorage.setItem('dy_favorites', JSON.stringify(favs));
    return favs[userId].includes(placeId);
  },

  isFavorite(userId, placeId) {
    const favs = JSON.parse(localStorage.getItem('dy_favorites') || '{}');
    return favs[userId] ? favs[userId].includes(placeId) : false;
  },

  getFavorites(userId) {
    const favs = JSON.parse(localStorage.getItem('dy_favorites') || '{}');
    const favIds = favs[userId] || [];
    return this.getPlaces().filter(p => favIds.includes(p.id));
  },

  // المراجعات
  addReview(placeId, userId, userName, rating, comment) {
    const reviews = JSON.parse(localStorage.getItem('dy_reviews') || '[]');
    reviews.push({ id: 'rev_' + Date.now(), placeId, userId, userName, rating, comment, createdAt: new Date().toISOString() });
    localStorage.setItem('dy_reviews', JSON.stringify(reviews));
    const places = this.getPlaces();
    const place = places.find(p => p.id === placeId);
    if (place) {
      const placeReviews = reviews.filter(r => r.placeId === placeId);
      place.rating = (placeReviews.reduce((a, r) => a + r.rating, 0) / placeReviews.length).toFixed(1);
      place.reviews = placeReviews.length;
      localStorage.setItem('dy_places', JSON.stringify(places));
    }
  },

  getReviews(placeId) {
    return (JSON.parse(localStorage.getItem('dy_reviews') || '[]')).filter(r => r.placeId === placeId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  // إحصائيات
  getStats() {
    return {
      places: this.getPlaces().length,
      users: JSON.parse(localStorage.getItem('dy_users') || '[]').length,
      reviews: JSON.parse(localStorage.getItem('dy_reviews') || '[]').length,
      cities: this.cities.length,
      categories: this.categories.length
    };
  },

  // الحصول على القسم الفرعي
  getSubCategory(subId) {
    for (const cat of this.categories) {
      const sub = cat.subs.find(s => s.id === subId);
      if (sub) return { ...sub, parent: cat };
    }
    return null;
  }
};
