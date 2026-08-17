// =============================================
// Data Store - Firestore Backend
// يحل محل data.js القديم (localStorage)
// =============================================

const I = (name, cls = 'icon-md') => `<i data-lucide="${name}" class="${cls}"></i>`;
const IB = (name, color, cls = 'icon-lg') => `<div class="cat-icon" style="background:${color}15"><i data-lucide="${name}" class="${cls}" style="color:${color}"></i></div>`;
const IBS = (name, color, cls = 'icon-md') => `<div class="cat-icon-sm" style="background:${color}15"><i data-lucide="${name}" class="${cls}" style="color:${color}"></i></div>`;

const Data = {
  // ====== التصنيفات (ثابتة - لا تتغير) ======
  // ====== التصنيفات المهنية (25 قسم، 274 فرع) ======
  categories: [
    { id: 'cat_1', name: 'الصحة والطب', icon: 'heart-pulse', color: '#10b981', subs: [
      { id: 'sub_1_1', name: 'مراكز طبية', icon: 'hospital' },
      { id: 'sub_1_1a', name: 'مستشفيات حكومية', icon: 'hospital' },
      { id: 'sub_1_1b', name: 'مستشفيات خاصة', icon: 'hospital' },
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
      { id: 'sub_1_17', name: 'طب الأعصاب', icon: 'brain' },
      { id: 'sub_1_18', name: 'طب العظام', icon: 'bone' },
      { id: 'sub_1_19', name: 'تغذية وحمية', icon: 'apple' },
      { id: 'sub_1_20', name: 'أدوية ومعدات طبية', icon: 'package' },
      { id: 'sub_1_21', name: 'نظارات طبية', icon: 'glasses' },
    ]},
    { id: 'cat_2', name: 'المطاعم والأغذية', icon: 'utensils', color: '#ef4444', subs: [
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
      { id: 'sub_2_15', name: 'مخابز', icon: 'croissant' },
      { id: 'sub_2_16', name: 'مصنّعات غذائية', icon: 'factory' },
      { id: 'sub_2_17', name: 'مطاعم كورية', icon: 'cherry' },
      { id: 'sub_2_18', name: 'مطاعم أفريقية', icon: 'cooking-pot' },
    ]},
    { id: 'cat_3', name: 'التجارة والتسوق', icon: 'shopping-bag', color: '#3b82f6', subs: [
      { id: 'sub_3_1', name: 'سوبر ماركت وبقالات', icon: 'shopping-cart' },
      { id: 'sub_3_2', name: 'مجمعات تجارية', icon: 'store' },
      { id: 'sub_3_3', name: 'ملابس رجالية', icon: 'shirt' },
      { id: 'sub_3_4', name: 'ملابس نسائية', icon: 'shirt' },
      { id: 'sub_3_5', name: 'أحذية', icon: 'footprints' },
      { id: 'sub_3_6', name: 'هدايا', icon: 'gift' },
      { id: 'sub_3_7', name: 'عسل', icon: 'honey' },
      { id: 'sub_3_8', name: 'بخور وعطور', icon: 'wind' },
      { id: 'sub_3_9', name: 'ذهب ومجوهرات', icon: 'gem' },
      { id: 'sub_3_10', name: 'عطارة', icon: 'leaf' },
      { id: 'sub_3_11', name: 'ألعاب أطفال', icon: 'puzzle' },
      { id: 'sub_3_12', name: 'كتب وقرطاسية', icon: 'pen-tool' },
      { id: 'sub_3_13', name: 'إلكترونيات استهلاكية', icon: 'smartphone' },
      { id: 'sub_3_14', name: 'مستلزمات طبية', icon: 'package' },
      { id: 'sub_3_15', name: 'أدوات مكتبية', icon: 'paperclip' },
      { id: 'sub_3_16', name: 'استيراد وتصدير', icon: 'ship' },
      { id: 'sub_3_17', name: 'تجارة جملة', icon: 'boxes' },
      { id: 'sub_3_18', name: 'مجموعات تجارية', icon: 'building-2' },
      { id: 'sub_3_19', name: 'أزياء وموضة', icon: 'shirt' },
      { id: 'sub_3_20', name: 'نظارات', icon: 'glasses' },
      { id: 'sub_3_21', name: 'منتجات طبيعية', icon: 'leaf' },
      { id: 'sub_3_22', name: 'مواد بناء', icon: 'bricks' },
    ]},
    { id: 'cat_4', name: 'السيارات والمركبات', icon: 'car', color: '#f97316', subs: [
      { id: 'sub_4_1', name: 'مكاتب سيارات', icon: 'building' },
      { id: 'sub_4_2', name: 'قطع غيار', icon: 'cog' },
      { id: 'sub_4_3', name: 'ورش صيانة', icon: 'wrench' },
      { id: 'sub_4_4', name: 'إطارات', icon: 'circle-dot' },
      { id: 'sub_4_5', name: 'زجاج سيارات', icon: 'square' },
      { id: 'sub_4_6', name: 'تكييف سيارات', icon: 'snowflake' },
      { id: 'sub_4_7', name: 'دهان سيارات', icon: 'paintbrush' },
      { id: 'sub_4_8', name: 'غسيل سيارات', icon: 'droplets' },
      { id: 'sub_4_9', name: 'تأجير سيارات', icon: 'key' },
      { id: 'sub_4_10', name: 'كهرباء سيارات', icon: 'zap' },
      { id: 'sub_4_11', name: 'سطحة', icon: 'truck' },
      { id: 'sub_4_12', name: 'معارض سيارات', icon: 'store' },
      { id: 'sub_4_13', name: 'شحن مركبات كهربائية', icon: 'battery-charging' },
      { id: 'sub_4_14', name: 'معدات ثقيلة', icon: 'tractor' },
    ]},
    { id: 'cat_5', name: 'العقارات', icon: 'building-2', color: '#06b6d4', subs: [
      { id: 'sub_5_1', name: 'مكاتب عقارية', icon: 'building' },
      { id: 'sub_5_2', name: 'بيع أراضي', icon: 'map-pin' },
      { id: 'sub_5_3', name: 'تأجير شقق', icon: 'home' },
      { id: 'sub_5_4', name: 'بيع شقق', icon: 'building' },
      { id: 'sub_5_5', name: 'تأجير محلات', icon: 'store' },
      { id: 'sub_5_6', name: 'فلل وقصور', icon: 'castle' },
      { id: 'sub_5_7', name: 'إدارة عقارات', icon: 'settings' },
      { id: 'sub_5_8', name: 'تقييم عقاري', icon: 'clipboard-check' },
    ]},
    { id: 'cat_6', name: 'البناء والمقاولات', icon: 'hard-hat', color: '#d97706', subs: [
      { id: 'sub_6_1', name: 'مقاولات عامة', icon: 'hard-hat' },
      { id: 'sub_6_2', name: 'دهانات', icon: 'paintbrush' },
      { id: 'sub_6_3', name: 'تكييف وتبريد مركزي', icon: 'snowflake' },
      { id: 'sub_6_4', name: 'سباكة مباني', icon: 'droplets' },
      { id: 'sub_6_5', name: 'كهرباء مباني', icon: 'zap' },
      { id: 'sub_6_6', name: 'ألمنيوم ونوافذ', icon: 'square' },
      { id: 'sub_6_7', name: 'عزل و roofing', icon: 'shield' },
      { id: 'sub_6_8', name: 'هدم وترميم', icon: 'hammer' },
      { id: 'sub_6_9', name: 'جبس وأسقف معلقة', icon: 'layers' },
      { id: 'sub_6_10', name: 'إنشاءات بحرية', icon: 'anchor' },
    ]},
    { id: 'cat_7', name: 'الخدمات المنزلية والصيانة', icon: 'wrench', color: '#6366f1', subs: [
      { id: 'sub_7_1', name: 'سباكة', icon: 'droplets' },
      { id: 'sub_7_2', name: 'نجارة منزلية', icon: 'hammer' },
      { id: 'sub_7_3', name: 'كهرباء منزلية', icon: 'zap' },
      { id: 'sub_7_4', name: 'مكافحة حشرات', icon: 'bug' },
      { id: 'sub_7_5', name: 'تنظيف', icon: 'sparkles' },
      { id: 'sub_7_6', name: 'تنسيق حدائق', icon: 'trees' },
      { id: 'sub_7_7', name: 'تسليك مجاري', icon: 'droplets' },
      { id: 'sub_7_8', name: 'مغاسل ملابس', icon: 'shirt' },
      { id: 'sub_7_9', name: 'صيانة أجهزة منزلية', icon: 'settings' },
      { id: 'sub_7_10', name: 'تركيب ستائر ومفروشات', icon: 'blinds' },
    ]},
    { id: 'cat_8', name: 'الجمال والعناية', icon: 'sparkles', color: '#e11d48', subs: [
      { id: 'sub_8_1', name: 'صالونات نساء', icon: 'scissors' },
      { id: 'sub_8_2', name: 'حلاقة رجال', icon: 'scissors' },
      { id: 'sub_8_3', name: 'عطور وعطورات', icon: 'wind' },
      { id: 'sub_8_4', name: 'مستحضرات تجميل', icon: 'palette' },
      { id: 'sub_8_5', name: 'عناية بالبشرة', icon: 'sparkles' },
      { id: 'sub_8_6', name: 'عناية بالشعر', icon: 'scissors' },
      { id: 'sub_8_7', name: 'أظافر', icon: 'hand' },
      { id: 'sub_8_8', name: 'مساج وسبا', icon: 'waves' },
      { id: 'sub_8_9', name: 'حلاقة نساء', icon: 'scissors' },
      { id: 'sub_8_10', name: 'عيادات تجميل', icon: 'sparkles' },
      { id: 'sub_8_11', name: 'عدسات لاصقة', icon: 'eye' },
    ]},
    { id: 'cat_9', name: 'التعليم والتدريب', icon: 'graduation-cap', color: '#ec4899', subs: [
      { id: 'sub_9_1', name: 'جامعات', icon: 'landmark' },
      { id: 'sub_9_2', name: 'مدارس', icon: 'school' },
      { id: 'sub_9_3', name: 'رياض أطفال', icon: 'baby' },
      { id: 'sub_9_4', name: 'مراكز تدريب', icon: 'presentation' },
      { id: 'sub_9_5', name: 'معاهد لغات', icon: 'languages' },
      { id: 'sub_9_6', name: 'مكتبات', icon: 'library' },
      { id: 'sub_9_7', name: 'تعليم إلكتروني', icon: 'monitor' },
      { id: 'sub_9_8', name: 'دروس خصوصية', icon: 'book-open' },
      { id: 'sub_9_9', name: 'تعليم خاص', icon: 'heart' },
      { id: 'sub_9_10', name: 'معاهد حاسب', icon: 'laptop' },
      { id: 'sub_9_11', name: 'تدريب مهني', icon: 'wrench' },
    ]},
    { id: 'cat_10', name: 'التقنية والاتصالات', icon: 'smartphone', color: '#0ea5e9', subs: [
      { id: 'sub_10_1', name: 'موبايلات', icon: 'smartphone' },
      { id: 'sub_10_2', name: 'لابتوب', icon: 'laptop' },
      { id: 'sub_10_3', name: 'تلفزيونات', icon: 'tv' },
      { id: 'sub_10_4', name: 'أجهزة لوحية', icon: 'tablet' },
      { id: 'sub_10_5', name: 'سماعات', icon: 'headphones' },
      { id: 'sub_10_6', name: 'كاميرات', icon: 'camera' },
      { id: 'sub_10_7', name: 'ألعاب فيديو', icon: 'gamepad-2' },
      { id: 'sub_10_8', name: 'صيانة إلكترونيات', icon: 'settings' },
      { id: 'sub_10_9', name: 'إلكترونيات عامة', icon: 'cpu' },
      { id: 'sub_10_10', name: 'شركات اتصالات', icon: 'wifi' },
      { id: 'sub_10_11', name: 'برمجيات وتطبيقات', icon: 'code' },
      { id: 'sub_10_12', name: 'خدمات إنترنت', icon: 'globe' },
      { id: 'sub_10_13', name: 'أنظمة أمن ومراقبة', icon: 'shield' },
      { id: 'sub_10_14', name: 'مستلزمات كمبيوتر', icon: 'mouse' },
      { id: 'sub_10_15', name: 'خدمات كمبيوتر', icon: 'monitor' },
    ]},
    { id: 'cat_11', name: 'المال والأعمال', icon: 'banknote', color: '#eab308', subs: [
      { id: 'sub_11_1', name: 'بنوك', icon: 'landmark' },
      { id: 'sub_11_2', name: 'صرافة', icon: 'arrow-left-right' },
      { id: 'sub_11_3', name: 'تأمين', icon: 'shield' },
      { id: 'sub_11_4', name: 'استثمار', icon: 'trending-up' },
      { id: 'sub_11_5', name: 'شركات تمويل', icon: 'banknote' },
      { id: 'sub_11_6', name: 'محاسبة ومراجعة', icon: 'calculator' },
      { id: 'sub_11_7', name: 'موارد بشرية', icon: 'users' },
    ]},
    { id: 'cat_12', name: 'الخدمات المهنية', icon: 'briefcase', color: '#7c3aed', subs: [
      { id: 'sub_12_1', name: 'استشارات هندسية', icon: 'ruler' },
      { id: 'sub_12_2', name: 'مكاتب هندسية', icon: 'building' },
      { id: 'sub_12_3', name: 'مختبرات فحص', icon: 'flask-conical' },
      { id: 'sub_12_4', name: 'شهادات جودة', icon: 'badge-check' },
      { id: 'sub_12_5', name: 'استشارات إدارية', icon: 'message-circle' },
      { id: 'sub_12_6', name: 'أدوات هندسية', icon: 'ruler' },
      { id: 'sub_12_7', name: 'خدمات توظيف', icon: 'user-plus' },
      { id: 'sub_12_8', name: 'استشارات تسويقية', icon: 'megaphone' },
    ]},
    { id: 'cat_13', name: 'النقل والشحن واللوجستيات', icon: 'truck', color: '#059669', subs: [
      { id: 'sub_13_1', name: 'نقل أثاث', icon: 'truck' },
      { id: 'sub_13_2', name: 'خدمات توصيل', icon: 'bike' },
      { id: 'sub_13_3', name: 'توصيل طعام', icon: 'utensils' },
      { id: 'sub_13_4', name: 'شحن بري', icon: 'truck' },
      { id: 'sub_13_5', name: 'شحن بحري', icon: 'ship' },
      { id: 'sub_13_6', name: 'شحن جوي', icon: 'plane' },
      { id: 'sub_13_7', name: 'تخليص جمركي', icon: 'file-check' },
      { id: 'sub_13_8', name: 'خدمات توزيع', icon: 'package' },
    ]},
    { id: 'cat_14', name: 'السياحة والفنادق', icon: 'building-2', color: '#8b5cf6', subs: [
      { id: 'sub_14_1', name: 'فنادق', icon: 'hotel' },
      { id: 'sub_14_2', name: 'شقق فندقية', icon: 'building' },
      { id: 'sub_14_3', name: 'منتجعات', icon: 'palmtree' },
      { id: 'sub_14_4', name: 'نزل وبيت ضيافة', icon: 'home' },
      { id: 'sub_14_5', name: 'مكاتب سفر', icon: 'plane' },
      { id: 'sub_14_6', name: 'سياحة ورحلات', icon: 'map' },
      { id: 'sub_14_7', name: 'مخيمات', icon: 'tent' },
      { id: 'sub_14_8', name: 'حجز طيران', icon: 'plane-takeoff' },
      { id: 'sub_14_9', name: 'شاليهات', icon: 'cabin' },
    ]},
    { id: 'cat_15', name: 'الترفيه والرياضة', icon: 'gamepad-2', color: '#14b8a6', subs: [
      { id: 'sub_15_1', name: 'صالات رياضية', icon: 'dumbbell' },
      { id: 'sub_15_2', name: 'ملاعب', icon: 'trophy' },
      { id: 'sub_15_3', name: 'مسابح', icon: 'waves' },
      { id: 'sub_15_4', name: 'يوغا', icon: 'heart' },
      { id: 'sub_15_5', name: 'فنون قتالية', icon: 'shield' },
      { id: 'sub_15_6', name: 'كرة قدم', icon: 'trophy' },
      { id: 'sub_15_7', name: 'ركض وجري', icon: 'footprints' },
      { id: 'sub_15_8', name: 'مدن ألعاب', icon: 'castle' },
      { id: 'sub_15_9', name: 'سينما', icon: 'film' },
      { id: 'sub_15_10', name: 'حدائق ترفيهية', icon: 'trees' },
      { id: 'sub_15_11', name: 'شواطئ', icon: 'waves' },
      { id: 'sub_15_12', name: 'ملاهي', icon: 'ferris-wheel' },
      { id: 'sub_15_13', name: 'بلايستيشن', icon: 'gamepad-2' },
      { id: 'sub_15_14', name: 'أندية ألعاب', icon: 'puzzle' },
      { id: 'sub_15_15', name: 'مستلزمات رياضية', icon: 'dumbbell' },
      { id: 'sub_15_16', name: 'ثقافة وفنون', icon: 'palette' },
    ]},
    { id: 'cat_16', name: 'الزراعة والثروة الحيوانية', icon: 'sprout', color: '#65a30d', subs: [
      { id: 'sub_16_1', name: 'بذور', icon: 'sprout' },
      { id: 'sub_16_2', name: 'أسمدة', icon: 'flask-conical' },
      { id: 'sub_16_3', name: 'معدات زراعية', icon: 'tractor' },
      { id: 'sub_16_4', name: 'مزراع', icon: 'cow' },
      { id: 'sub_16_5', name: 'تربية حيوانات', icon: 'cow' },
      { id: 'sub_16_6', name: 'أسماك ومصايد', icon: 'fish' },
      { id: 'sub_16_7', name: 'نباتات ومشاتل', icon: 'flower' },
      { id: 'sub_16_8', name: 'إنتاج عسل', icon: 'honey' },
    ]},
    { id: 'cat_17', name: 'الصناعة والإنتاج', icon: 'factory', color: '#78350f', subs: [
      { id: 'sub_17_1', name: 'مصانع', icon: 'factory' },
      { id: 'sub_17_2', name: 'حدادة', icon: 'hammer' },
      { id: 'sub_17_3', name: 'خياطة', icon: 'scissors' },
      { id: 'sub_17_4', name: 'تصنيع خشب', icon: 'axe' },
      { id: 'sub_17_5', name: 'خزف', icon: 'palette' },
      { id: 'sub_17_6', name: 'تصنيع أغذية', icon: 'factory' },
      { id: 'sub_17_7', name: 'تصنيع معادن', icon: 'factory' },
      { id: 'sub_17_8', name: 'تصنيع بلاستيك', icon: 'factory' },
      { id: 'sub_17_9', name: 'تصنيع ورق', icon: 'factory' },
      { id: 'sub_17_10', name: 'محاجر ومواد بناء', icon: 'mountain' },
      { id: 'sub_17_11', name: 'صناعات خفيفة', icon: 'factory' },
    ]},
    { id: 'cat_18', name: 'الطاقة والكهرباء', icon: 'zap', color: '#f59e0b', subs: [
      { id: 'sub_18_1', name: 'خدمات كهربائية', icon: 'zap' },
      { id: 'sub_18_2', name: 'طاقة شمسية', icon: 'sun' },
      { id: 'sub_18_3', name: 'مولدات كهربائية', icon: 'zap' },
      { id: 'sub_18_4', name: 'كهرباء صناعية', icon: 'zap' },
      { id: 'sub_18_5', name: 'بطاريات و UPS', icon: 'battery-charging' },
      { id: 'sub_18_6', name: 'نفط وغاز', icon: 'fuel' },
      { id: 'sub_18_7', name: 'صناعات نفطية', icon: 'factory' },
      { id: 'sub_18_8', name: 'أدوات كهربائية', icon: 'plug' },
    ]},
    { id: 'cat_19', name: 'الإعلام والطباعة', icon: 'newspaper', color: '#1d4ed8', subs: [
      { id: 'sub_19_1', name: 'صحف', icon: 'newspaper' },
      { id: 'sub_19_2', name: 'مواقع إخبارية', icon: 'globe' },
      { id: 'sub_19_3', name: 'قنوات فضائية', icon: 'satellite' },
      { id: 'sub_19_4', name: 'إذاعات', icon: 'radio' },
      { id: 'sub_19_5', name: 'طباعة ونشر', icon: 'printer' },
      { id: 'sub_19_6', name: 'طباعة ونسخ', icon: 'printer' },
      { id: 'sub_19_7', name: 'تصوير فوتوغرافي', icon: 'camera' },
      { id: 'sub_19_8', name: 'طباعة صور', icon: 'image' },
      { id: 'sub_19_9', name: 'تصوير فيديو', icon: 'video' },
      { id: 'sub_19_10', name: 'تصميم جرافيك', icon: 'pen-tool' },
      { id: 'sub_19_11', name: 'إنتاج إعلامي', icon: 'film' },
      { id: 'sub_19_12', name: 'وكالات إعلان', icon: 'megaphone' },
    ]},
    { id: 'cat_20', name: 'القانون والاستشارات', icon: 'scale', color: '#78716c', subs: [
      { id: 'sub_20_1', name: 'محامون', icon: 'scale' },
      { id: 'sub_20_2', name: 'استشارات قانونية', icon: 'message-circle' },
      { id: 'sub_20_3', name: 'توثيق', icon: 'file-check' },
      { id: 'sub_20_4', name: 'ترجمة معتمدة', icon: 'languages' },
      { id: 'sub_20_5', name: 'شؤون عمالية', icon: 'users' },
      { id: 'sub_20_6', name: 'تسجيل علامات تجارية', icon: 'trademark' },
      { id: 'sub_20_7', name: 'خدمات قانونية إلكترونية', icon: 'monitor' },
    ]},
    { id: 'cat_21', name: 'المنزل والأثاث', icon: 'sofa', color: '#a855f7', subs: [
      { id: 'sub_21_1', name: 'أثاث منزلي', icon: 'sofa' },
      { id: 'sub_21_2', name: 'أدوات منزلية', icon: 'lamp' },
      { id: 'sub_21_3', name: 'تصميم داخلي', icon: 'palette' },
      { id: 'sub_21_4', name: 'ديكور', icon: 'palette' },
      { id: 'sub_21_5', name: 'ستائر ومفروشات', icon: 'blinds' },
      { id: 'sub_21_6', name: 'مطابخ', icon: 'cooking-pot' },
      { id: 'sub_21_7', name: 'حمامات', icon: 'bath' },
    ]},
    { id: 'cat_22', name: 'المناسبات والأعراس', icon: 'heart', color: '#e11d48', subs: [
      { id: 'sub_22_1', name: 'كوش', icon: 'crown' },
      { id: 'sub_22_2', name: 'فنانين', icon: 'mic' },
      { id: 'sub_22_3', name: 'صالات أعراس', icon: 'building-2' },
      { id: 'sub_22_4', name: 'فساتين زفاف', icon: 'shirt' },
      { id: 'sub_22_5', name: 'لبس رجالي', icon: 'user' },
      { id: 'sub_22_6', name: 'سماعات & زينة', icon: 'speaker' },
      { id: 'sub_22_7', name: 'مراكز تجهيز أعراس', icon: 'sparkles' },
      { id: 'sub_22_8', name: 'مناسبات', icon: 'calendar' },
      { id: 'sub_22_9', name: 'تصوير مناسبات', icon: 'camera' },
    ]},
    { id: 'cat_23', name: 'المنظمات والمجتمع', icon: 'users', color: '#065f46', subs: [
      { id: 'sub_23_1', name: 'جمعيات خيرية', icon: 'heart' },
      { id: 'sub_23_2', name: 'منظمات مجتمع مدني', icon: 'users' },
      { id: 'sub_23_3', name: 'مؤسسات إنسانية وإغاثية', icon: 'heart-handshake' },
      { id: 'sub_23_4', name: 'مؤسسات تنموية', icon: 'trending-up' },
      { id: 'sub_23_5', name: 'مراكز شبابية', icon: 'users' },
      { id: 'sub_23_6', name: 'مؤسسات تطوعية', icon: 'hand-helping' },
      { id: 'sub_23_7', name: 'نقابات مهنية', icon: 'shield' },
      { id: 'sub_23_8', name: 'سفارات وقنصليات', icon: 'flag' },
      { id: 'sub_23_9', name: 'منظمات دولية', icon: 'globe' },
      { id: 'sub_23_10', name: 'هيئات عامة', icon: 'building-2' },
    ]},
    { id: 'cat_24', name: 'الخدمات العامة والأمن', icon: 'shield', color: '#374151', subs: [
      { id: 'sub_24_1', name: 'شركات أمن وحراسة', icon: 'shield' },
      { id: 'sub_24_2', name: 'خدمات حراسة المنشآت', icon: 'shield-check' },
      { id: 'sub_24_3', name: 'أمن وسلامة', icon: 'shield-alert' },
      { id: 'sub_24_4', name: 'خدمات حكومية', icon: 'building-2' },
      { id: 'sub_24_5', name: 'مراكز خدمة المواطنين', icon: 'users' },
    ]},
    { id: 'cat_25', name: 'تجارة الجملة', icon: 'boxes', color: '#0891b2', subs: [
      { id: 'sub_25_1', name: 'جملة إلكترونيات', icon: 'smartphone' },
      { id: 'sub_25_2', name: 'جملة معدات طبية', icon: 'package' },
      { id: 'sub_25_3', name: 'جملة جلديات', icon: 'briefcase' },
      { id: 'sub_25_4', name: 'جملة مواد غذائية', icon: 'shopping-cart' },
      { id: 'sub_25_5', name: 'جملة منظفات', icon: 'sparkles' },
      { id: 'sub_25_6', name: 'جملة إكسسوارات', icon: 'gem' },
      { id: 'sub_25_7', name: 'جملة ملابس', icon: 'shirt' },
    ]},
  ],

  resolveCategory(catId) {
    return this.categories.find(c => c.id === catId) || null;
  },

  // ====== Firestore Category Management ======
  _categoriesLoaded: false,
  _hardcodedCategories: null,

  // Save hardcoded categories as backup
  _backupCategories() {
    if (!this._hardcodedCategories) {
      this._hardcodedCategories = JSON.parse(JSON.stringify(this.categories));
    }
  },

  // Seed categories to Firestore (one-time)
  async seedCategories() {
    try {
      const snapshot = await db.collection('categories').limit(1).get();
      if (!snapshot.empty) return false; // Already seeded
      this._backupCategories();
      const batch = db.batch();
      for (const cat of this._hardcodedCategories) {
        const ref = db.collection('categories').doc(cat.id);
        batch.set(ref, {
          id: cat.id,
          name: cat.name,
          icon: cat.icon,
          color: cat.color,
          active: true,
          subs: cat.subs.map(s => ({ id: s.id, name: s.name, icon: s.icon, active: true })),
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
      await batch.commit();
      console.log('Categories seeded to Firestore');
      return true;
    } catch (e) {
      console.error('seedCategories error:', e);
      return false;
    }
  },

  // Load categories from Firestore
  async loadCategories() {
    if (this._categoriesLoaded) return this.categories;
    try {
      this._backupCategories();
      const snapshot = await db.collection('categories').orderBy('id').get();
      if (snapshot.empty) {
        // Not seeded yet — seed from hardcoded
        await this.seedCategories();
        return this.categories;
      }
      const firestoreCats = snapshot.docs.map(d => {
        const data = d.data();
        return {
          id: data.id || d.id,
          name: data.name,
          icon: data.icon,
          color: data.color,
          active: data.active !== false,
          subs: (data.subs || []).map(s => ({
            id: s.id,
            name: s.name,
            icon: s.icon,
            active: s.active !== false
          }))
        };
      });
      if (firestoreCats.length > 0) {
        this.categories = firestoreCats;
      }
      this._categoriesLoaded = true;
      return this.categories;
    } catch (e) {
      console.error('loadCategories error:', e);
      this._backupCategories();
      return this.categories;
    }
  },

  // Get only active categories (for public site)
  getActiveCategories() {
    return this.categories
      .filter(c => c.active !== false)
      .map(c => ({
        ...c,
        subs: (c.subs || []).filter(s => s.active !== false)
      }));
  },

  // Admin: Update category
  async updateCategory(catId, data) {
    try {
      await db.collection('categories').doc(catId).update({
        ...data,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      // Update local cache
      const idx = this.categories.findIndex(c => c.id === catId);
      if (idx !== -1) Object.assign(this.categories[idx], data);
      return true;
    } catch (e) {
      console.error('updateCategory error:', e);
      return false;
    }
  },

  // Admin: Update subcategory
  async updateSubcategory(catId, subId, data) {
    try {
      const cat = this.categories.find(c => c.id === catId);
      if (!cat) return false;
      const subIdx = cat.subs.findIndex(s => s.id === subId);
      if (subIdx === -1) return false;
      Object.assign(cat.subs[subIdx], data);
      await db.collection('categories').doc(catId).update({
        subs: cat.subs,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return true;
    } catch (e) {
      console.error('updateSubcategory error:', e);
      return false;
    }
  },

  // Admin: Check if category/subcategory is in use
  async checkCategoryUsage(catId, subId) {
    try {
      let query = db.collection('places').where('category', '==', catId);
      if (subId) query = query.where('subcategory', '==', subId);
      const snapshot = await query.limit(1).get();
      return snapshot.size;
    } catch (e) {
      return 0;
    }
  },

  // ====== بيانات افتراضية (fallback) ======
  defaultPlaces: [
    { id: 'p_1', name: 'مستشفى الثورة', category: 'cat_1', subcategory: 'sub_1_1', city: 'city_1', description: 'مستشفى حكومي كبير. طوارئ 24 ساعة.', phone: '777111222', address: 'شارع الستين، صنعاء', verified: true, featured: true, isActive: true, status: 'approved', views: 8900, reviews: 156, rating: 4.2, owner: 'system' },
    { id: 'p_2', name: 'مطعم البركة', category: 'cat_2', subcategory: 'sub_2_1', city: 'city_1', description: 'مطعم يمني تقليدي. مندي، مظبي، حنيذ.', phone: '777222333', address: 'شارع الزبيري، صنعاء', verified: true, featured: true, isActive: true, status: 'approved', views: 12500, reviews: 312, rating: 4.8, owner: 'system' },
    { id: 'p_3', name: 'فندق القصر', category: 'cat_14', subcategory: 'sub_14_1', city: 'city_2', description: 'فندق 4 نجوم. إطلالة بحرية.', phone: '777333444', address: 'كريتر، عدن', verified: true, featured: true, isActive: true, status: 'approved', views: 7600, reviews: 189, rating: 4.6, owner: 'system' },
    { id: 'p_4', name: 'صيدلية الحياة', category: 'cat_1', subcategory: 'sub_1_3', city: 'city_1', description: 'صيدلية شاملة 24 ساعة.', phone: '777444555', address: 'شارع الستين، صنعاء', verified: true, featured: false, isActive: true, status: 'approved', views: 5400, reviews: 98, rating: 4.7, owner: 'system' },
    { id: 'p_5', name: 'مجمع التسوق الحديث', category: 'cat_3', subcategory: 'sub_3_2', city: 'city_1', description: 'أكبر مجمع تجاري في صنعاء.', phone: '777555666', address: 'شارع الربات، صنعاء', verified: true, featured: true, isActive: true, status: 'approved', views: 18000, reviews: 420, rating: 4.5, owner: 'system' },
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
  _placesListener: null,
  _renderDebounce: null,
  
  _pageSize: 200,
  _lastDoc: null,
  _hasMore: true,

  async getPlaces() {
    // If listener is already active, return cached data
    if (this._placesListener) return this._placesCache || [];
    
    return new Promise((resolve) => {
      try {
        const setupListener = (useOrderBy) => {
          let query = db.collection('places')
            .where('isActive', '==', true)
            .where('status', '==', 'approved')
            .limit(this._pageSize);
          
          if (useOrderBy) {
            try { query = query.orderBy('createdAt', 'desc'); } catch(e) {}
          }
          
          this._placesListener = query.onSnapshot((snapshot) => {
            const newData = snapshot.docs.map(doc => {
              const d = doc.data();
              const place = { id: doc.id, ...d };
              // Normalize: ensure images[] array always exists
              if ((!place.images || place.images.length === 0) && place.image) {
                place.images = [place.image];
              }
              if (!place.images) place.images = [];
              return place;
            });
            this._lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;
            this._hasMore = snapshot.docs.length >= this._pageSize;
            const oldData = this._placesCache || [];
            this._placesCache = newData;
            this._placesCacheTime = Date.now();
            
            // Only re-render if data actually changed AND we're not on a detail view
            // Detail views (place/offer/job/event) manage their own content
            const hasChanged = newData.length !== oldData.length || 
              JSON.stringify(newData.map(p=>p.id).sort()) !== JSON.stringify(oldData.map(p=>p.id).sort());
            
            if (hasChanged && typeof App !== 'undefined' && App._initialized) {
              clearTimeout(this._renderDebounce);
              this._renderDebounce = setTimeout(() => {
                // Don't wipe detail views — they render their own content
                const curView = App.currentView;
                if (!['place', 'offer', 'job', 'event', 'editplace'].includes(curView)) {
                  App.render();
                }
              }, 300);
            }
            
            resolve(this._placesCache);
          }, (error) => {
            // If orderBy failed, retry without it
            if (useOrderBy && error.code === 'failed-precondition') {
              console.log('Retrying places query without orderBy...');
              this._placesListener = null;
              setupListener(false);
              return;
            }
            console.error('Places listener error:', error);
            if (!this._placesCache || this._placesCache.length === 0) {
              this._placesCache = this.defaultPlaces || [];
            }
            resolve(this._placesCache);
          });
        };
        
        setupListener(true);
      } catch (e) {
        console.error('getPlaces error:', e);
        if (!this._placesCache || this._placesCache.length === 0) {
          this._placesCache = this.defaultPlaces || [];
        }
        resolve(this._placesCache);
      }
    });
  },

  // نسخة متزامنة للتوافق مع الكود القديم (تقرأ من cache)
  getPlacesSync() {
    return this._placesCache || this.defaultPlaces || [];
  },

  // تحميل المزيد من الأماكن (pagination)
  async loadMorePlaces() {
    if (!this._hasMore || !this._lastDoc) return this._placesCache || [];
    try {
      let query = db.collection('places')
        .where('isActive', '==', true)
        .where('status', '==', 'approved')
        .orderBy('createdAt', 'desc')
        .startAfter(this._lastDoc)
        .limit(this._pageSize);
      const snapshot = await query.get();
      const newDocs = snapshot.docs.map(doc => {
        const d = doc.data();
        const place = { id: doc.id, ...d };
        // Normalize: ensure images[] array always exists
        if ((!place.images || place.images.length === 0) && place.image) {
          place.images = [place.image];
        }
        if (!place.images) place.images = [];
        return place;
      });
      this._lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;
      this._hasMore = snapshot.docs.length >= this._pageSize;
      // Append to cache, avoiding duplicates
      const existingIds = new Set((this._placesCache || []).map(p => p.id));
      const unique = newDocs.filter(p => !existingIds.has(p.id));
      this._placesCache = (this._placesCache || []).concat(unique);
      return this._placesCache;
    } catch (e) {
      console.error('loadMorePlaces error:', e);
      return this._placesCache || [];
    }
  },

  hasMorePlaces() { return this._hasMore; },

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
        isActive: status === 'approved',
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
      // Immediately add to my-places cache so it shows up right away
      const newPlace = {
        id: docRef.id, ...place,
        verified: false, featured: false, isActive: true, status: 'pending',
        views: 0, reviews: 0, rating: 0, adminNote: '',
        images: place.images || [],
        createdAt: { toMillis: () => Date.now() },
        updatedAt: { toMillis: () => Date.now() }
      };
      this._myPlacesCache = [newPlace, ...this._myPlacesCache];
      return newPlace;
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

  // ====== البحث السريع (للاقتراحات) ======
  quickSearch(query) {
    if (!query || query.trim().length < 2) return [];
    const q = this.normalizeArabic(query.toLowerCase());
    const results = [];
    for (const cat of this.categories) {
      if (this.normalizeArabic(cat.name.toLowerCase()).includes(q)) results.push({ type: 'category', id: cat.id, name: cat.name, icon: cat.icon, subtitle: 'قسم رئيسي' });
      for (const sub of cat.subs) {
        if (this.normalizeArabic(sub.name.toLowerCase()).includes(q)) results.push({ type: 'subcategory', id: sub.id, catId: cat.id, name: sub.name, icon: sub.icon, subtitle: cat.name });
      }
    }
    for (const city of this.cities) {
      if (this.normalizeArabic(city.name.toLowerCase()).includes(q)) results.push({ type: 'city', id: city.id, name: city.name, icon: 'map-pin', subtitle: 'مدينة' });
    }
    const places = this.getPlacesSync();
    for (const p of places) {
      if (p.isActive === false) continue;
      const name = this.normalizeArabic((p.name || '').toLowerCase());
      const addr = this.normalizeArabic((p.address || '').toLowerCase());
      if (name.includes(q) || addr.includes(q)) {
        const cat = this.categories.find(c => c.id === p.category);
        const city = this.cities.find(c => c.id === p.city);
        results.push({ type: 'place', id: p.id, name: p.name, icon: cat ? cat.icon : 'map-pin', subtitle: [cat?.name, city?.name].filter(Boolean).join(' • ') });
      }
    }
    return results.slice(0, 8);
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
      if (sub) return { ...sub, parent: cat };
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

  // ====== رفع الصور (ImageStorage) ======
  async uploadPlaceImages(files, maxWidth = 800) {
    if (!ImageStorage.isConfigured()) {
      console.warn('uploadPlaceImages: ImageStorage not configured');
      return [];
    }
    const urls = [];
    for (const file of files) {
      try {
        const ownerSegment = (Auth.currentUser && Auth.currentUser.id) ? Auth.currentUser.id : 'anon';
        const result = await ImageStorage.upload(file, 'places/' + ownerSegment);
        urls.push(result.url);
      } catch (e) {
        console.error('Upload image error:', e);
      }
    }
    return urls;
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
  },

  // ====== My Places (all statuses for current user) ======
  _myPlacesCache: [],
  _myPlacesListener: null,

  async getMyPlaces(userId) {
    if (!userId) return [];

    // Set up real-time listener for this user's places
    if (this._myPlacesListener) return this._myPlacesCache;

    return new Promise((resolve) => {
      try {
        this._myPlacesListener = db.collection('places')
          .where('owner', '==', userId)
          .onSnapshot((snapshot) => {
            this._myPlacesCache = snapshot.docs.map(doc => {
              const d = doc.data();
              const place = { id: doc.id, ...d };
              if ((!place.images || place.images.length === 0) && place.image) {
                place.images = [place.image];
              }
              if (!place.images) place.images = [];
              return place;
            });
            // Sort client-side: pending first, then by createdAt desc
            this._myPlacesCache.sort((a, b) => {
              const statusOrder = { pending: 0, approved: 1, rejected: 2 };
              const sa = statusOrder[a.status] ?? 1;
              const sb = statusOrder[b.status] ?? 1;
              if (sa !== sb) return sa - sb;
              const ta = a.createdAt?.toMillis?.() || 0;
              const tb = b.createdAt?.toMillis?.() || 0;
              return tb - ta;
            });

            // Re-render if myplaces view is active
            if (typeof App !== 'undefined' && App._initialized && App.currentView === 'myplaces') {
              clearTimeout(this._myPlacesDebounce);
              this._myPlacesDebounce = setTimeout(() => App.render(), 200);
            }

            resolve(this._myPlacesCache);
          }, (error) => {
            console.error('MyPlaces listener error:', error);
            // Fallback: one-time query
            db.collection('places')
              .where('owner', '==', userId)
              .get()
              .then(snap => {
                this._myPlacesCache = snap.docs.map(doc => {
                  const d = doc.data();
                  return { id: doc.id, ...d, images: d.images || (d.image ? [d.image] : []) };
                });
                resolve(this._myPlacesCache);
              })
              .catch(() => resolve(this._myPlacesCache));
          });
      } catch (e) {
        console.error('getMyPlaces error:', e);
        resolve(this._myPlacesCache);
      }
    });
  },

  getMyPlacesSync() {
    return this._myPlacesCache;
  },

  _stopMyPlacesListener() {
    if (this._myPlacesListener) {
      this._myPlacesListener();
      this._myPlacesListener = null;
    }
    this._myPlacesCache = [];
  },

  // ====== Place Edits (Edit-with-Review System) ======
  _myEditsCache: [],
  _myEditsListener: null,

  async submitPlaceEdit(placeId, proposedData) {
    if (!Auth.currentUser) throw new Error('غير مسجل الدخول');
    // Verify ownership
    const place = await this.getPlace(placeId);
    if (!place || place.owner !== Auth.currentUser.id) throw new Error('ليس لديك صلاحية تعديل هذا المكان');
    // Check if there's already a pending edit
    const existing = await db.collection('place_edits')
      .where('placeId', '==', placeId)
      .where('status', '==', 'pending')
      .get();
    if (!existing.empty) throw new Error('يوجد طلب تعديل معلق بالفعل لهذا المكان. انتظر موافقة أو رفض الأدمن أولاً.');
    // Create edit document
    const editData = {
      placeId: placeId,
      owner: Auth.currentUser.id,
      ownerName: Auth.currentUser.name || '',
      status: 'pending',
      proposedData: proposedData,
      currentData: {
        name: place.name || '',
        category: place.category || '',
        subcategory: place.subcategory || '',
        city: place.city || '',
        description: place.description || '',
        address: place.address || '',
        phone: place.phone || '',
        whatsapp: place.whatsapp || '',
        email: place.email || '',
        facebook: place.facebook || '',
        instagram: place.instagram || '',
        telegram: place.telegram || '',
        website: place.website || '',
        openTime: place.openTime || '',
        closeTime: place.closeTime || '',
        workDays: place.workDays || [],
        images: place.images || [],
        lat: place.lat || '',
        lng: place.lng || ''
      },
      placeName: place.name || '',
      adminNote: '',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    const docRef = await db.collection('place_edits').add(editData);
    // Notify admin
    await Admin.notifyNewPlace('تعديل: ' + place.name, Auth.currentUser.name);
    return { id: docRef.id, ...editData };
  },

  async getMyPlaceEdits(userId) {
    if (!userId) return [];
    try {
      const snap = await db.collection('place_edits')
        .where('owner', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      // Fallback without orderBy if index missing
      try {
        const snap = await db.collection('place_edits')
          .where('owner', '==', userId)
          .get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (e2) {
        console.error('getMyPlaceEdits error:', e2);
        return [];
      }
    }
  },

  async getPlaceEdit(editId) {
    try {
      const doc = await db.collection('place_edits').doc(editId).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    } catch (e) {
      console.error('getPlaceEdit error:', e);
      return null;
    }
  },

  async cancelPlaceEdit(editId) {
    try {
      await db.collection('place_edits').doc(editId).delete();
      return true;
    } catch (e) {
      console.error('cancelPlaceEdit error:', e);
      return false;
    }
  },

  // ====== نسخ متزامنة للتوافق مع app.js ======
  _usersCache: [],
  _reviewsCache: [],
  _favoritesCache: [],

  getApprovedPlacesSync() {
    return (this._placesCache || this.defaultPlaces || []).filter(p => p.status === 'approved' || !p.status);
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
    let places = this.getApprovedPlacesSync() || [];
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
    // تحميل التصنيفات من Firestore
    try {
      await Promise.race([
        this.loadCategories(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
      ]);
    } catch(e) { console.log('Categories load skipped:', e.message); }
    // تحميل الأماكن مع timeout
    try {
      await Promise.race([
        this.getPlaces(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000))
      ]);
    } catch(e) { console.log('Places load skipped:', e.message); }
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
